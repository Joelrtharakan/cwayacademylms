import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { redis } from "../utils/redis";
import { NotificationService } from "../services/notification.service";
import { ExportService } from "../services/export.service";
import { TokenService } from "../services/token.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendCourseApprovedEmail, sendInstructorWelcomeEmail } from "../services/email.service";
import { deleteFromR2, extractR2Key } from "../services/storage.service";
import { VideoService } from "../services/video.service";

// ─── STATS ───────────────────────────────────────────────────────────────────

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = "admin:dashboard:stats";
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ status: "success", data: JSON.parse(cached) });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    pendingApprovals,
    totalEnrollments,
    enrollmentsThisMonth,
    revenueAll,
    revenueMonth,
    certificatesIssued,
    activeSponshorships,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.course.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { enrolledAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
    }),
    prisma.certificate.count(),
    prisma.sponsorship.count({ where: { status: "COMPLETED" } }),
  ]);

  const data = {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    pendingApprovals,
    totalEnrollments,
    enrollmentsThisMonth,
    totalRevenue: revenueAll._sum.amount ?? 0,
    revenueThisMonth: revenueMonth._sum.amount ?? 0,
    certificatesIssued,
    activeSponshorships,
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 5); // 5 sec TTL
  res.json({ status: "success", data });
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as string) || "12m";
  const cacheKey = `admin:dashboard:revenue:${period}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ status: "success", data: JSON.parse(cached) });

  const months = period === "7d" ? 1 : period === "30d" ? 1 : 12;
  const since = new Date(new Date().setMonth(new Date().getMonth() - months));

  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      to_char(p."createdAt", 'Mon YYYY') as month,
      SUM(p.amount) as revenue,
      COUNT(e.id) as enrollments
    FROM "Payment" p
    LEFT JOIN "Enrollment" e ON e."paymentId" = p.id
    WHERE p.status = 'COMPLETED' AND p."createdAt" >= ${since}
    GROUP BY to_char(p."createdAt", 'Mon YYYY')
    ORDER BY MIN(p."createdAt") ASC
  `;

  const data = stats.map((s) => ({
    month: s.month,
    revenue: Number(s.revenue || 0),
    enrollments: Number(s.enrollments || 0),
  }));

  await redis.set(cacheKey, JSON.stringify(data), "EX", 5); // 5 sec TTL
  res.json({ status: "success", data });
});

export const getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const months = req.query.period === "12m" ? 12 : 1;
  const since = new Date(new Date().setMonth(new Date().getMonth() - months));

  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      to_char("createdAt", 'Mon YYYY') as month,
      SUM(CASE WHEN role = 'STUDENT' THEN 1 ELSE 0 END) as students,
      SUM(CASE WHEN role = 'INSTRUCTOR' THEN 1 ELSE 0 END) as instructors
    FROM "User"
    WHERE "createdAt" >= ${since}
    GROUP BY to_char("createdAt", 'Mon YYYY')
    ORDER BY MIN("createdAt") ASC
  `;

  const data = stats.map((s) => ({
    month: s.month,
    students: Number(s.students || 0),
    instructors: Number(s.instructors || 0),
  }));

  res.json({ status: "success", data });
});

export const getCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const cacheKey = "admin:dashboard:course-analytics";
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ status: "success", data: JSON.parse(cached) });

  const [topByEnrollment, topByRating, byCategory, coursesForCompletion, completionGroups] = await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { enrollments: { _count: "desc" } },
      take: 10,
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      take: 10,
      select: {
        id: true,
        title: true,
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { courses: true } },
        courses: { select: { _count: { select: { enrollments: true } } } },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true }
    }),
    prisma.enrollment.groupBy({
      by: ["courseId", "status"],
      _count: { id: true },
    }),
  ]);

  const calcRating = (reviews: { rating: number }[]) =>
    reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  const data = {
    topByEnrollment: topByEnrollment.map((c) => ({
      id: c.id,
      title: c.title,
      enrollmentCount: c._count.enrollments,
      rating: parseFloat(calcRating(c.reviews).toFixed(1)),
    })),
    topByRating: topByRating
      .map((c) => ({
        id: c.id,
        title: c.title,
        rating: parseFloat(calcRating(c.reviews).toFixed(1)),
        reviewCount: c._count.reviews,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10),
    byCategory: byCategory.map((cat) => ({
      categoryName: cat.name,
      courseCount: cat._count.courses,
      enrollmentCount: cat.courses.reduce((s, c) => s + c._count.enrollments, 0),
    })),
    completionRates: coursesForCompletion.map((c) => {
      const statsForCourse = completionGroups.filter(g => g.courseId === c.id);
      const total = statsForCourse.reduce((acc, g) => acc + g._count.id, 0);
      const completed = statsForCourse.find(g => g.status === "COMPLETED")?._count.id || 0;
      
      return {
        courseTitle: c.title,
        completionRate: total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
      };
    }).sort((a, b) => b.completionRate - a.completionRate),
  };

  await redis.set(cacheKey, JSON.stringify(data), "EX", 5); // 5 sec TTL
  res.json({ status: "success", data });
});

export const getEnrollmentAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const months = req.query.period === "12m" ? 12 : 1;
  const since = new Date(new Date().setMonth(new Date().getMonth() - months));

  const stats = await prisma.$queryRaw<any[]>`
    SELECT 
      to_char("enrolledAt", 'Mon YYYY') as month,
      COUNT(*) as "newEnrollments",
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completions
    FROM "Enrollment"
    WHERE "enrolledAt" >= ${since}
    GROUP BY to_char("enrolledAt", 'Mon YYYY')
    ORDER BY MIN("enrolledAt") ASC
  `;

  const data = stats.map((s) => ({
    month: s.month,
    newEnrollments: Number(s.newEnrollments || 0),
    completions: Number(s.completions || 0),
  }));

  res.json({ status: "success", data });
});

export const getRecentEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(20, Math.max(1, parseInt((req.query.limit as string) || "8")));

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    take: limit,
    select: {
      id: true,
      enrolledAt: true,
      progress: true,
      status: true,
      student: { select: { id: true, name: true, email: true, avatar: true } },
      course: { select: { id: true, title: true } },
    },
  });

  res.json({ status: "success", data: enrollments });
});

export const getStudentTimeAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "10")));
  const cacheKey = `admin:analytics:students-time:${limit}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ status: "success", data: JSON.parse(cached) });

  const results = await prisma.$queryRaw<any[]>`
    SELECT u.id, u.name, u.email, u.avatar, u."appActiveSeconds",
           SUM(lp."watchedSeconds") as "watchedSeconds",
           COUNT(DISTINCT e."courseId") as "enrollmentCount"
    FROM "User" u
    LEFT JOIN "Enrollment" e ON e."studentId" = u.id
    LEFT JOIN "LessonProgress" lp ON lp."enrollmentId" = e.id
    WHERE u.role = 'STUDENT'
    GROUP BY u.id, u.name, u.email, u.avatar, u."appActiveSeconds"
    HAVING (SUM(lp."watchedSeconds") > 0 OR u."appActiveSeconds" > 0)
    ORDER BY (COALESCE(SUM(lp."watchedSeconds"), 0) + COALESCE(u."appActiveSeconds", 0)) DESC
    LIMIT ${limit}
  `;

  const topStudents = results.map((r) => {
    const totalSeconds = Number(r.watchedSeconds || 0) + Number(r.appActiveSeconds || 0);
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      avatar: r.avatar,
      totalSeconds,
      enrollmentCount: Number(r.enrollmentCount || 0),
    };
  });

  await redis.set(cacheKey, JSON.stringify(topStudents), "EX", 60); // Cache for 60 seconds

  res.json({ status: "success", data: topStudents });
});

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, status, language, search, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (role) where.role = role;
  if (language) where.preferredLanguage = language;
  if (status === "banned") where.isBanned = true;
  if (status === "active") { where.isBanned = false; where.isVerified = true; }
  if (status === "unverified") { where.isVerified = false; where.isBanned = false; }
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];

  const validSortBy: Record<string, any> = { createdAt: "createdAt", name: "name", email: "email" };
  const orderBy = { [validSortBy[sortBy] || "createdAt"]: sortOrder === "asc" ? "asc" : "desc" };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      select: {
        id: true, name: true, email: true, role: true, avatar: true, church: true,
        location: true, preferredLanguage: true, isVerified: true, isBanned: true, createdAt: true,
        _count: { select: { enrollments: true, coursesCreated: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ status: "success", data: { users, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, name: true, email: true, role: true, avatar: true, bio: true, phone: true,
      church: true, location: true, preferredLanguage: true, isVerified: true, isBanned: true,
      createdAt: true, updatedAt: true,
      enrollments: {
        take: 20,
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { enrolledAt: "desc" },
      },
      coursesCreated: {
        select: { id: true, title: true, status: true, _count: { select: { enrollments: true } } },
      },
      payments: {
        take: 20,
        include: { course: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
      },
      certificates: {
        include: { course: { select: { title: true } } },
        orderBy: { issuedAt: "desc" },
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);
  res.json({ status: "success", data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id && req.body.role && req.body.role !== req.user!.role) {
    throw new AppError("You cannot change your own role", 400);
  }

  const { name, role, church, location, isVerified, bio } = req.body;
  const allowedRoles = ["ADMIN", "INSTRUCTOR", "STUDENT"];
  if (role && !allowedRoles.includes(role)) throw new AppError("Invalid role", 400);

  const user = await prisma.user.update({
    where: { id },
    data: { name, role, church, location, isVerified, bio },
    select: { id: true, name: true, email: true, role: true, church: true, location: true, isVerified: true, bio: true },
  });

  res.json({ status: "success", data: user });
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) throw new AppError("You cannot ban your own account", 400);

  await prisma.user.update({ where: { id }, data: { isBanned: true } });
  // Invalidate Redis session
  try { await redis.del(`refresh:${id}`); } catch (_) {}

  res.json({ status: "success", message: "User banned" });
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: false } });
  res.json({ status: "success", message: "User unbanned" });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (id === req.user!.id) throw new AppError("You cannot delete your own account", 400);

  // 1. Fetch user and related file keys before deleting
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      blogPosts: { select: { coverKey: true } },
      submissions: { select: { fileUrl: true } },
      coursesCreated: {
        select: {
          thumbnail: true,
          promoVideoUrl: true,
          sections: {
            select: {
              readingMaterials: { select: { fileKey: true } },
              lessons: {
                select: {
                  bunnyVideoId: true,
                  assignment: { select: { attachmentUrl: true } }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) throw new AppError("User not found", 404);

  // 2. Collect all R2 keys to delete
  const keysToDelete: string[] = [];

  // Avatar
  if (user.avatar) {
    const key = extractR2Key(user.avatar);
    if (key) keysToDelete.push(key);
  }

  // Blog Posts
  user.blogPosts.forEach(post => {
    if (post.coverKey) keysToDelete.push(post.coverKey);
  });

  // Submissions
  user.submissions.forEach(sub => {
    const key = extractR2Key(sub.fileUrl);
    if (key) keysToDelete.push(key);
  });

  // Courses (Instructor)
  const bunnyVideoIdsToDelete: string[] = [];

  user.coursesCreated.forEach(course => {
    const thumbKey = extractR2Key(course.thumbnail);
    if (thumbKey) keysToDelete.push(thumbKey);
    // promoVideoUrl is normally Bunny.net embed URL, but if it's R2, this will catch it
    const promoKey = extractR2Key(course.promoVideoUrl);
    if (promoKey) keysToDelete.push(promoKey);

    course.sections.forEach(sec => {
      sec.readingMaterials.forEach(rm => {
        if (rm.fileKey) keysToDelete.push(rm.fileKey);
      });
      sec.lessons.forEach(lesson => {
        if (lesson.bunnyVideoId) bunnyVideoIdsToDelete.push(lesson.bunnyVideoId);
        if (lesson.assignment?.attachmentUrl) {
          const attKey = extractR2Key(lesson.assignment.attachmentUrl);
          if (attKey) keysToDelete.push(attKey);
        }
      });
    });
  });

  // 3. Batch delete from R2 and Bunny.net (done in parallel, ignore errors so we don't block DB deletion)
  const deletePromises = keysToDelete.map(key => deleteFromR2(key).catch(err => {
    console.error(`Failed to delete R2 key ${key}:`, err);
  }));
  const bunnyPromises = bunnyVideoIdsToDelete.map(vid => VideoService.deleteBunnyVideo(vid).catch(err => {
    console.error(`Failed to delete Bunny.net video ${vid}:`, err);
  }));
  await Promise.all([...deletePromises, ...bunnyPromises]);

  // 4. Delete user from database (Cascade handles the rest)
  await prisma.user.delete({ where: { id } });
  
  res.json({ status: "success", message: "User deleted and associated files removed from storage" });
});

export const impersonateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) throw new AppError("User not found", 404);

  const token = crypto.randomBytes(32).toString("hex");
  await redis.set(`impersonate:${token}`, id, "EX", 300); // 5 min TTL

  res.json({ status: "success", data: { impersonateToken: token } });
});

export const exportUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, status, language, search } = req.query as Record<string, string>;

  const where: any = {};
  if (role) where.role = role;
  if (language) where.preferredLanguage = language;
  if (status === "banned") where.isBanned = true;
  if (status === "active") { where.isBanned = false; where.isVerified = true; }
  if (status === "unverified") { where.isVerified = false; where.isBanned = false; }
  if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, name: true, email: true, role: true, church: true, location: true,
      preferredLanguage: true, isVerified: true, isBanned: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  const csv = ExportService.exportUsersCSV(users);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.send(csv);
});

// ─── INSTRUCTORS ─────────────────────────────────────────────────────────────

export const getInstructors = asyncHandler(async (req: Request, res: Response) => {
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    select: {
      id: true, name: true, email: true, avatar: true, bio: true, church: true,
      location: true, createdAt: true, isVerified: true, isBanned: true,
      _count: { select: { coursesCreated: true } },
      coursesCreated: {
        select: {
          status: true,
          _count: { select: { enrollments: true } },
          payments: { select: { amount: true, status: true } },
        },
      },
    },
  });

  const data = instructors.map((inst) => {
    const publishedCourses = inst.coursesCreated.filter((c) => c.status === "PUBLISHED").length;
    const totalStudents = inst.coursesCreated.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalRevenue = inst.coursesCreated
      .flatMap((c) => c.payments)
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      id: inst.id, name: inst.name, email: inst.email, avatar: inst.avatar, bio: inst.bio,
      church: inst.church, location: inst.location, createdAt: inst.createdAt,
      isVerified: inst.isVerified, isBanned: inst.isBanned,
      _count: inst._count, publishedCourses, totalStudents, totalRevenue,
    };
  });

  res.json({ status: "success", data });
});

export const createInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) throw new AppError("Name and email are required", 400);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("A user with this email already exists", 400);

  // Generate a random 12-character alphanumeric password
  const password = crypto.randomBytes(8).toString("hex").slice(0, 12);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "INSTRUCTOR",
      isVerified: true, // Auto-verified since admin created them
    },
    select: {
      id: true, name: true, email: true, role: true, isVerified: true, createdAt: true
    }
  });

  // Send the email asynchronously
  sendInstructorWelcomeEmail(user, password).catch((err: any) => {
    console.error("Failed to send instructor welcome email:", err);
  });

  res.status(201).json({ status: "success", data: user, message: "Instructor created and email sent." });
});


// ─── COURSE MANAGEMENT ───────────────────────────────────────────────────────

export const getCourses = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, instructor, category, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;
  if (instructor) where.instructorId = instructor;
  if (category) where.categoryId = category;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy === "title" ? "title" : "createdAt"]: sortOrder === "asc" ? "asc" : "desc" },
      select: {
        id: true, title: true, slug: true, status: true, thumbnail: true, price: true,
        isFree: true, moduleNumber: true, language: true, level: true, isFeatured: true,
        createdAt: true, rejectionReason: true, courseCode: true,
        instructor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        program: { select: { id: true, title: true } },
        _count: { select: { enrollments: true, reviews: true } },
        reviews: { select: { rating: true } },
        sections: { select: { _count: { select: { lessons: true } }, title: true, order: true } },
        description: true, subtitle: true,
      },
    }),
    prisma.course.count({ where }),
  ]);

  const data = courses.map((c) => ({
    ...c,
    avgRating: c.reviews.length ? c.reviews.reduce((a, r) => a + r.rating, 0) / c.reviews.length : 0,
    reviews: undefined,
  }));

  res.json({ status: "success", data: { courses: data, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const approveCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { status: "PUBLISHED", rejectionReason: null },
    include: { instructor: { select: { id: true, name: true, email: true } } },
  });

  await NotificationService.createNotification(
    course.instructorId,
    "COURSE_APPROVED",
    "Your course has been approved",
    `'${course.title}' is now live on CWAY Academy`,
    `/courses/${course.slug}`
  );

  try {
    await sendCourseApprovedEmail(
      { name: course.instructor.name, email: course.instructor.email },
      { title: (course.title as any), slug: (course.slug as any), id: course.id }
    );
  } catch (e) {
    console.error("[Email] Failed to send course approved email:", e);
  }

  res.json({ status: "success", message: "Course approved and published" });
});

export const rejectCourse = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) throw new AppError("Rejection reason is required", 400);

  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { status: "DRAFT", rejectionReason: reason },
  });

  await NotificationService.createNotification(
    course.instructorId,
    "COURSE_REJECTED",
    "Course needs revision",
    reason,
    `/instructor/courses/${course.id}/edit`
  );

  res.json({ status: "success", message: "Course rejected" });
});

export const featureCourse = asyncHandler(async (req: Request, res: Response) => {
  const { isFeatured } = req.body;
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: { isFeatured: Boolean(isFeatured) },
    select: { id: true, title: true, isFeatured: true },
  });

  res.json({ status: "success", data: course });
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!course) throw new AppError("Course not found", 404);

  if (course._count.enrollments > 0 && req.query.confirm !== "true") {
    return res.status(409).json({
      status: "warning",
      message: `This course has ${course._count.enrollments} active enrollment(s). Pass ?confirm=true to proceed.`,
      enrollmentCount: course._count.enrollments,
    });
  }

  await prisma.course.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Course deleted" });
});

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────────────────────

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: { orderBy: { order: "asc" }, include: { _count: { select: { courses: true } } } },
      _count: { select: { courses: true } },
    },
  });

  res.json({ status: "success", data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, icon, parentId } = req.body;
  const autoSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const category = await prisma.category.create({
    data: { name, slug: autoSlug, icon, parentId: parentId || null },
  });

  res.status(201).json({ status: "success", data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, slug, icon, parentId } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, slug, icon, parentId: parentId || null },
  });

  res.json({ status: "success", data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { courses: true } } },
  });
  if (!cat) throw new AppError("Category not found", 404);
  if (cat._count.courses > 0) throw new AppError("Cannot delete a category that has courses assigned to it", 400);

  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Category deleted" });
});

export const reorderCategories = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  if (!Array.isArray(orderedIds)) throw new AppError("orderedIds must be an array", 400);

  await Promise.all(
    orderedIds.map((id, index) => prisma.category.update({ where: { id }, data: { order: index } }))
  );

  res.json({ status: "success", message: "Reordered" });
});

// ─── PAYMENTS ────────────────────────────────────────────────────────────────

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const { status, dateFrom, dateTo, search, page = "1", limit = "20" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  if (search) {
    where.OR = [
      { student: { name: { contains: search, mode: "insensitive" } } },
      { student: { email: { contains: search, mode: "insensitive" } } },
      { course: { title: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [payments, total, summary] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
  ]);

  const refunded = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "REFUNDED" } });
  const pending = await prisma.payment.count({ where: { status: "PENDING" } });

  res.json({
    status: "success",
    data: {
      payments,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      summary: {
        totalRevenue: summary._sum.amount ?? 0,
        totalRefunded: refunded._sum.amount ?? 0,
        pendingCount: pending,
      },
    },
  });
});

export const refundPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await prisma.payment.findUnique({
    where: { id: req.params.id },
    include: { enrollments: { select: { id: true } } },
  });
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "COMPLETED") throw new AppError("Only completed payments can be refunded", 400);

  // TODO: Trigger actual Stripe refund via Stripe API in Phase 5
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // await stripe.refunds.create({ payment_intent: payment.stripePaymentId! });

  await prisma.$transaction([
    prisma.payment.update({ where: { id: req.params.id }, data: { status: "REFUNDED" } }),
    ...payment.enrollments.map((e) =>
      prisma.enrollment.update({ where: { id: e.id }, data: { status: "REFUNDED" } })
    ),
  ]);

  res.json({ status: "success", message: "Refund processed" });
});

// ─── SPONSORSHIPS ────────────────────────────────────────────────────────────

export const getSponsorships = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;

  const [sponsorships, total] = await Promise.all([
    prisma.sponsorship.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { student: { select: { id: true, name: true, email: true } } },
    }),
    prisma.sponsorship.count({ where }),
  ]);

  res.json({ status: "success", data: { sponsorships, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const linkSponsorship = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, courseId } = req.body;
  if (!studentId || !courseId) throw new AppError("studentId and courseId are required", 400);

  const sponsorship = await prisma.sponsorship.findUnique({ where: { id: req.params.id } });
  if (!sponsorship) throw new AppError("Sponsorship not found", 404);

  // Check if student already enrolled
  const existing = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId, courseId } } });
  if (existing) throw new AppError("Student is already enrolled in this course", 400);

  await prisma.$transaction([
    prisma.sponsorship.update({ where: { id: req.params.id }, data: { studentId, courseId } }),
    prisma.enrollment.create({ data: { studentId, courseId, sponsorshipId: req.params.id } }),
  ]);

  res.json({ status: "success", message: "Sponsorship linked and enrollment created" });
});

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { course: { select: { id: true, title: true } } },
  });
  res.json({ status: "success", data: coupons });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, discount, type, maxUses, expiresAt, courseId } = req.body;

  if (!code || !discount || !type) throw new AppError("code, discount, and type are required", 400);
  if (discount <= 0) throw new AppError("Discount must be greater than 0", 400);
  if (type === "PERCENT" && discount > 100) throw new AppError("Percent discount cannot exceed 100", 400);

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discount,
      type,
      maxUses: maxUses || 100,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      courseId: courseId || null,
    },
    include: { course: { select: { id: true, title: true } } },
  });

  res.status(201).json({ status: "success", data: coupon });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { isActive, expiresAt, maxUses } = req.body;
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: { isActive, expiresAt: expiresAt ? new Date(expiresAt) : undefined, maxUses },
    include: { course: { select: { id: true, title: true } } },
  });
  res.json({ status: "success", data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Coupon deleted" });
});

// ─── CERTIFICATE TEMPLATES ───────────────────────────────────────────────────

export const getCertificateTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await prisma.certificateTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { certificates: true } } }
  });
  res.json({ status: "success", data: templates });
});

export const createCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;
  const templateType = type === "PROGRAM" ? "PROGRAM" : "COURSE";

  // If setting as default, unset other defaults of the same type only
  if (isDefault) {
    await prisma.certificateTemplate.updateMany({
      where: { type: templateType },
      data: { isDefault: false }
    });
  }

  const template = await prisma.certificateTemplate.create({
    data: { name, type: templateType, htmlTemplate, isDefault: isDefault || false, logoUrl, signatorySignatureUrl, borderStyle },
  });

  res.status(201).json({ status: "success", data: template });
});

export const updateCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, type, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;
  const templateType = type === "PROGRAM" ? "PROGRAM" : "COURSE";

  // If setting as default, unset other defaults of the same type
  if (isDefault) {
    await prisma.certificateTemplate.updateMany({
      where: { type: templateType, NOT: { id: req.params.id } },
      data: { isDefault: false }
    });
  }

  const template = await prisma.certificateTemplate.update({
    where: { id: req.params.id },
    data: { name, type: templateType, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle },
  });

  res.json({ status: "success", data: template });
});

export const deleteCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);

  await prisma.certificateTemplate.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Template deleted" });
});

export const previewCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);

  const { studentName, courseName, completionDate, instructorName, moduleNumber, uniqueCode } = req.query as Record<string, string>;

  let rendered = template.htmlTemplate
    .replace(/\{\{studentName\}\}/g, studentName || "John Doe")
    .replace(/\{\{courseName\}\}/g, courseName || "Sample Course")
    .replace(/\{\{completionDate\}\}/g, completionDate || new Date().toLocaleDateString())
    .replace(/\{\{instructorName\}\}/g, instructorName || "Dr. Instructor")
    .replace(/\{\{moduleNumber\}\}/g, moduleNumber || "1")
    .replace(/\{\{uniqueCode\}\}/g, uniqueCode || "CWAY-PREVIEW-001")
    .replace(/\{\{certificateNumber\}\}/g, "CA/2406/12345")
    .replace(/\{\{logoUrl\}\}/g, template.logoUrl || "https://cwayacademy.netlify.app/logo.png?v=3");

  res.json({ status: "success", data: { renderedHtml: rendered } });
});

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

export const getEmailTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
  res.json({ status: "success", data: templates });
});

export const createEmailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, subject, htmlBody } = req.body;
  if (!name || !subject || !htmlBody) {
    throw new AppError("name, subject, and htmlBody are required", 400);
  }

  const existing = await prisma.emailTemplate.findUnique({ where: { name } });
  if (existing) {
    throw new AppError(`An email template with the name '${name}' already exists.`, 400);
  }

  const template = await prisma.emailTemplate.create({
    data: { name, subject, htmlBody, variables: "[]" },
  });
  
  res.status(201).json({ status: "success", data: template });
});

export const updateEmailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { subject, htmlBody } = req.body;
  const template = await prisma.emailTemplate.update({
    where: { id: req.params.id },
    data: { subject, htmlBody },
  });
  res.json({ status: "success", data: template });
});

export const previewEmailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);

  const { sampleData } = req.body as { sampleData: Record<string, string> };

  let renderedHtml = template.htmlBody;
  let renderedSubject = template.subject;
  if (sampleData) {
    Object.entries(sampleData).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      renderedHtml = renderedHtml.replace(regex, val);
      renderedSubject = renderedSubject.replace(regex, val);
    });
  }

  res.json({ status: "success", data: { renderedHtml, renderedSubject } });
});

export const testEmailTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);

  const { toEmail, sampleData } = req.body as { toEmail: string; sampleData: Record<string, string> };
  if (!toEmail) throw new AppError("toEmail is required", 400);

  // TODO: Actually send email via email service
  console.log(`[Test Email] To: ${toEmail}, Template: ${template.name}`);

  res.json({ status: "success", message: `Test email sent to ${toEmail}` });
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { userId, type, isRead, page = "1", limit = "50" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(200, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (userId) where.userId = userId;
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead === "true";

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.notification.count({ where }),
  ]);

  res.json({ status: "success", data: { notifications, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const broadcastNotification = asyncHandler(async (req: Request, res: Response) => {
  const { targetRole, targetUserIds, title, body, link, sendEmail } = req.body;

  if (!title || !body) throw new AppError("title and body are required", 400);

  const result = await NotificationService.createBroadcastNotification(
    targetRole || "ALL",
    title,
    body,
    link,
    targetUserIds
  );

  // TODO: Queue email jobs via BullMQ if sendEmail === true

  res.json({ status: "success", message: `Broadcast sent to ${result.count} users` });
});

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await prisma.siteSettings.findFirst();
  res.json({ status: "success", data: settings });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.siteSettings.findFirst();

  const data = req.body;

  const settings = existing
    ? await prisma.siteSettings.update({ where: { id: existing.id }, data })
    : await prisma.siteSettings.create({ data });

  res.json({ status: "success", data: settings });
});

// ─── PROGRAM MANAGEMENT (LMS WORKFLOW) ───────────────────────────────────────

export const getPrograms = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { courses: true } },
        courses: {
          select: { id: true, title: true, status: true, invitationStatus: true, thumbnail: true,
            instructor: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.program.count({ where }),
  ]);

  res.json({ status: "success", data: { programs, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

export const getProgramById = asyncHandler(async (req: Request, res: Response) => {
  const program = await prisma.program.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { courses: true } },
      courses: {
        select: {
          id: true, title: true, slug: true, status: true, invitationStatus: true,
          thumbnail: true, price: true, isFree: true, createdAt: true,
          instructor: { select: { id: true, name: true, email: true, avatar: true } },
          invitation: { select: { id: true, status: true, adminNote: true,
            instructor: { select: { id: true, name: true, email: true } } } },
          _count: { select: { enrollments: true, sections: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!program) throw new AppError("Program not found", 404);
  res.json({ status: "success", data: program });
});

export const getProgramStudents = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const enrollments = await prisma.programEnrollment.findMany({
    where: { programId: id },
    include: {
      student: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });
  res.json({ status: "success", data: enrollments });
});

export const getProgramStudentDetails = asyncHandler(async (req: Request, res: Response) => {
  const { id, studentId } = req.params;

  // 1. Get the program enrollment
  const programEnrollment = await prisma.programEnrollment.findUnique({
    where: { studentId_programId: { studentId, programId: id } },
    include: {
      student: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
      program: { select: { id: true, title: true } },
    },
  });

  if (!programEnrollment) throw new AppError("Student is not enrolled in this program", 404);

  // 2. Get all courses in this program and the student's progress
  const courses = await prisma.course.findMany({
    where: { programId: id },
    select: {
      id: true,
      title: true,
      courseCode: true,
      status: true,
      enrollments: {
        where: { studentId },
        select: { id: true, progress: true, status: true, enrolledAt: true, completedAt: true },
      },
      sections: {
        select: {
          lessons: {
            select: {
              quiz: {
                select: {
                  id: true,
                  title: true,
                  passingScore: true,
                  attempts: {
                    where: { studentId },
                    select: { id: true, score: true, passed: true, completedAt: true },
                    orderBy: { score: 'desc' }
                  },
                },
              },
              assignment: {
                select: {
                  id: true,
                  title: true,
                  maxScore: true,
                  submissions: {
                    where: { studentId },
                    select: { id: true, isGraded: true, grade: true, submittedAt: true, gradedAt: true },
                    orderBy: { submittedAt: 'desc' }
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // 3. Get certificates related to this student for this program and its courses
  const courseIds = courses.map(c => c.id);
  const certificates = await prisma.certificate.findMany({
    where: {
      studentId,
      OR: [
        { programId: id },
        { courseId: { in: courseIds } }
      ]
    },
    include: {
      course: { select: { title: true } },
      program: { select: { title: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  res.json({
    status: "success",
    data: {
      programEnrollment,
      courses: courses.map((course) => {
        const quizzes: any[] = [];
        const assignments: any[] = [];
        course.sections.forEach((section) => {
          section.lessons.forEach((lesson) => {
            if (lesson.quiz) quizzes.push(lesson.quiz);
            if (lesson.assignment) assignments.push(lesson.assignment);
          });
        });
        return {
          id: course.id,
          title: course.title,
          courseCode: course.courseCode,
          status: course.status,
          enrollments: course.enrollments,
          quizzes,
          assignments,
        };
      }),
      certificates,
    },
  });
});

// ─── CACHE HELPER ─────────────────────────────────────────────────────────────
async function invalidateProgramCache(programId?: string) {
  try {
    if (programId) await redis.del(`cway:program:${programId}`);
    await redis.del("cway:public:programs");
  } catch (e) {
    console.error("Redis invalidation error:", e);
  }
}

export const createProgram = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, duration, tags, status } = req.body;
  if (!title) throw new AppError("Title is required", 400);

  const program = await prisma.program.create({
    data: {
      title,
      description: description || null,
      duration: duration || null,
      tags: tags ? JSON.stringify(tags) : "[]",
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    },
  });

  await invalidateProgramCache();
  res.status(201).json({ status: "success", data: program });
});

export const updateProgram = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, duration, tags, status, applicationsClosed } = req.body;
  const program = await prisma.program.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(duration !== undefined && { duration }),
      ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      ...(status !== undefined && { status }),
      ...(applicationsClosed !== undefined && { applicationsClosed }),
    },
    include: { _count: { select: { courses: true } } },
  });
  
  await invalidateProgramCache(req.params.id);
  res.json({ status: "success", data: program });
});

export const deleteProgram = asyncHandler(async (req: Request, res: Response) => {
  const program = await prisma.program.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { courses: true } } },
  });
  if (!program) throw new AppError("Program not found", 404);

  // Unlink courses from this program instead of deleting them
  await prisma.course.updateMany({
    where: { programId: req.params.id },
    data: { programId: null },
  });
  await prisma.program.delete({ where: { id: req.params.id } });
  
  await invalidateProgramCache(req.params.id);
  res.json({ status: "success", message: "Program deleted" });
});

export const addCourseToProgram = asyncHandler(async (req: Request, res: Response) => {
  const { programId } = req.params;
  const { title, description, price, requirements, instructorId, courseCode } = req.body;
  if (!title) throw new AppError("Course title is required", 400);

  // Find or use provided instructorId; fallback to admin's own id
  const resolvedInstructorId = instructorId || req.user!.id;

  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      courseCode: courseCode || null,
      description: description || null,
      price: price ? parseFloat(price) : 0,
      requirements: requirements ? JSON.stringify(requirements) : "[]",
      instructorId: resolvedInstructorId,
      programId,
      weeksDuration: 6,
      status: "DRAFT",
      invitationStatus: "UNASSIGNED",
    },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      _count: { select: { sections: true } },
    },
  });

  res.status(201).json({ status: "success", data: course });
});

export const assignInstructorToCourse = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { instructorId, adminNote } = req.body;
  if (!instructorId) throw new AppError("instructorId is required", 400);

  const [course, instructor] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.user.findUnique({ where: { id: instructorId, role: "INSTRUCTOR" } }),
  ]);

  if (!course) throw new AppError("Course not found", 404);
  if (!instructor) throw new AppError("Instructor not found", 404);

  // Delete any existing invitation for this course
  await prisma.courseInvitation.deleteMany({ where: { courseId } });

  // Create new invitation and update course
  const [invitation] = await prisma.$transaction([
    prisma.courseInvitation.create({
      data: { courseId, instructorId, adminNote: adminNote || null, status: "PENDING" },
      include: { instructor: { select: { id: true, name: true, email: true } } },
    }),
    prisma.course.update({
      where: { id: courseId },
      data: { instructorId, invitationStatus: "PENDING" },
    }),
  ]);

  await NotificationService.createNotification(
    instructorId,
    "COURSE_INVITATION",
    "You've been assigned a course",
    `You have a new course invitation: "${course.title}"`,
    `/instructor/courses`
  );

  res.json({ status: "success", data: invitation, message: "Invitation sent to instructor" });
});


function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function uniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let count = 0;
  while (await prisma.course.findUnique({ where: { slug } })) {
    count++;
    slug = `${slugify(title)}-${count}`;
  }
  return slug;
}

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const { title, subtitle, description, categoryId, level = "BEGINNER", language = "ENGLISH",
    moduleNumber, weeksDuration = 6, totalLectures = 0, scriptureRef, isFree = true,
    price = 0, currency = "INR", requirements, outcomes, targetAudience,
    welcomeMessage, congratsMessage, tags, instructorId, adminNote } = req.body;

  if (!title) throw new AppError("Title is required", 400);
  if (!instructorId) throw new AppError("Instructor ID is required to create a course", 400);

  const slug = await uniqueSlug(title);

  const [course, invitation] = await prisma.$transaction(async (tx) => {
    const newCourse = await tx.course.create({
      data: {
        title, subtitle, description, categoryId, level, language,
        moduleNumber: moduleNumber ? Number(moduleNumber) : undefined,
        weeksDuration: Number(weeksDuration), totalLectures: Number(totalLectures),
        scriptureRef, isFree: Boolean(isFree), price: Number(price), currency,
        requirements: JSON.stringify(requirements || []),
        outcomes: JSON.stringify(outcomes || []),
        targetAudience: JSON.stringify(targetAudience || []),
        welcomeMessage, congratsMessage,
        tags: JSON.stringify(tags || []),
        slug, status: "DRAFT", instructorId,
        invitationStatus: "PENDING",
        forum: { create: {} },
        curriculum: { create: {} }
      },
    });

    const newInvitation = await tx.courseInvitation.create({
      data: {
        courseId: newCourse.id,
        instructorId,
        adminNote: adminNote || null,
        status: "PENDING"
      }
    });

    return [newCourse, newInvitation];
  });

  await NotificationService.createNotification(
    instructorId,
    "COURSE_INVITATION",
    "You've been assigned a new course",
    `An admin created '${course.title}' and assigned it to you.`,
    `/instructor/invitations`
  );

  res.status(201).json({ status: "success", data: course, invitation });
});

export const duplicateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { programId } = req.body;

  const originalCourse = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              quiz: { include: { questions: { include: { answers: true } } } },
              assignment: true
            }
          }
        }
      }
    }
  });

  if (!originalCourse) throw new AppError("Course not found", 404);

  const crypto = await import("crypto");
  const randomHex = crypto.randomBytes(3).toString("hex");
  const slug = await uniqueSlug(`${originalCourse.title} Copy ${randomHex}`);

  const newCourse = await prisma.$transaction(async (tx) => {
    const createdCourse = await tx.course.create({
      data: {
        title: `${originalCourse.title} (Copy)`,
        subtitle: originalCourse.subtitle,
        description: originalCourse.description,
        thumbnail: originalCourse.thumbnail,
        promoVideoUrl: originalCourse.promoVideoUrl,
        price: originalCourse.price,
        currency: originalCourse.currency,
        status: "DRAFT",
        level: originalCourse.level,
        language: originalCourse.language,
        moduleNumber: originalCourse.moduleNumber,
        weeksDuration: originalCourse.weeksDuration,
        totalLectures: originalCourse.totalLectures,
        totalDuration: originalCourse.totalDuration,
        scriptureRef: originalCourse.scriptureRef,
        isFeatured: originalCourse.isFeatured,
        isFree: originalCourse.isFree,
        requirements: originalCourse.requirements,
        outcomes: originalCourse.outcomes,
        targetAudience: originalCourse.targetAudience,
        welcomeMessage: originalCourse.welcomeMessage,
        congratsMessage: originalCourse.congratsMessage,
        tags: originalCourse.tags,
        slug,
        instructorId: originalCourse.instructorId,
        categoryId: originalCourse.categoryId,
        programId: programId || null,
        invitationStatus: "PENDING",
        forum: { create: {} },
        curriculum: { create: {} },
        sections: {
          create: originalCourse.sections.map((sec) => ({
            title: sec.title,
            description: sec.description,
            objectives: sec.objectives,
            weekNumber: sec.weekNumber,
            isPublished: false,
            order: sec.order,
            lessons: {
              create: sec.lessons.map((les) => ({
                title: les.title,
                type: les.type,
                content: les.content,
                videoUrl: les.videoUrl,
                duration: les.duration,
                order: les.order,
                isFree: les.isFree,
                isPreview: les.isPreview,
                bunnyVideoId: les.bunnyVideoId,
                forumMarks: les.forumMarks,
                dueDate: les.dueDate,
                ...(les.quiz && {
                  quiz: {
                    create: {
                      title: les.quiz.title,
                      passingScore: les.quiz.passingScore,
                      timeLimit: les.quiz.timeLimit,
                      maxAttempts: les.quiz.maxAttempts,
                      rubricId: les.quiz.rubricId,
                      questions: {
                        create: les.quiz.questions.map((q) => ({
                          text: q.text,
                          type: q.type,
                          points: q.points,
                          order: q.order,
                          scriptureRef: q.scriptureRef,
                          answers: {
                            create: q.answers.map((a) => ({
                              text: a.text,
                              isCorrect: a.isCorrect
                            }))
                          }
                        }))
                      }
                    }
                  }
                }),
                ...(les.assignment && {
                  assignment: {
                    create: {
                      title: les.assignment.title,
                      description: les.assignment.description,
                      dueDate: les.assignment.dueDate,
                      maxScore: les.assignment.maxScore,
                      attachmentUrl: les.assignment.attachmentUrl,
                      rubricId: les.assignment.rubricId
                    }
                  }
                })
              }))
            }
          }))
        }
      }
    });

    await tx.courseInvitation.create({
      data: {
        courseId: createdCourse.id,
        instructorId: createdCourse.instructorId,
        status: "PENDING"
      }
    });

    return createdCourse;
  }, {
    timeout: 60000,
  });

  res.status(201).json({ status: "success", data: newCourse });
});

export const removeCourseFromProgram = asyncHandler(async (req: Request, res: Response) => {
  const { programId, courseId } = req.params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.programId !== programId) {
    throw new AppError("Course not found in this program", 404);
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { programId: null },
  });

  res.json({ status: "success", message: "Course removed from program" });
});

// ─── PROGRAM APPLICATIONS ────────────────────────────────────────────────────
export const getApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await prisma.programApplication.findMany({
    include: { program: { select: { title: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ status: "success", data: applications });
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await prisma.programApplication.findUnique({
    where: { id },
    include: { 
      program: { select: { title: true } },
      referenceForms: true
    }
  });
  if (!application) throw new AppError("Application not found", 404);
  res.json({ status: "success", data: application });
});

export const approveApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await prisma.programApplication.findUnique({
    where: { id },
    include: { program: { include: { courses: { orderBy: { createdAt: "asc" } } } } }
  });
  if (!application) throw new AppError("Application not found", 404);
  if (application.status !== "PENDING") throw new AppError("Application is not pending", 400);

  let user = await prisma.user.findUnique({ where: { email: application.email } });
  let password = "";
  
  if (!user) {
    password = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        name: application.fullName,
        email: application.email,
        passwordHash,
        role: "STUDENT",
        phone: application.mobileNumber,
        isVerified: true
      }
    });
  }

  // Create ProgramEnrollment
  const firstCourse = application.program.courses[0];
  
  await prisma.programEnrollment.upsert({
    where: { studentId_programId: { studentId: user.id, programId: application.programId } },
    update: { currentCourseId: firstCourse?.id },
    create: {
      studentId: user.id,
      programId: application.programId,
      currentCourseId: firstCourse?.id
    }
  });

  // Enroll in first course
  if (firstCourse) {
    await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId: user.id, courseId: firstCourse.id } },
      update: {},
      create: { studentId: user.id, courseId: firstCourse.id }
    });
  }

  await prisma.programApplication.update({
    where: { id },
    data: { status: "APPROVED" }
  });

  if (password) {
    const { sendAdmissionEmail } = await import("../services/email.service");
    await sendAdmissionEmail({ name: user.name, email: user.email }, password, (application.program.title as any));
  }

  res.json({ status: "success", message: "Application approved successfully" });
});

export const rejectApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.programApplication.update({
    where: { id },
    data: { status: "REJECTED" }
  });
  res.json({ status: "success", message: "Application rejected" });
});

export const getProgramStudentGrades = asyncHandler(async (req: Request, res: Response) => {
  const { id: programId, studentId } = req.params;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      courses: {
        include: {
          enrollments: { where: { studentId } }
        }
      }
    }
  });

  if (!program) throw new AppError("Program not found", 404);

  const coursesWithGrades = await Promise.all(program.courses.map(async (course) => {
    const courseData = await prisma.course.findUnique({
      where: { id: course.id },
      include: { sections: { include: { lessons: { include: { assignment: true, quiz: true } } } } }
    });
    
    if (!courseData) return { ...course, finalGrade: 0 };

    const gradedItems: { id: string, type: string, maxScore: number }[] = [];
    courseData.sections.forEach(sec => {
      sec.lessons.forEach(lesson => {
        if (lesson.assignment) gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore });
        if (lesson.quiz) gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100 });
        if (lesson.type === "FORUM") gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100 });
      });
    });

    const submissions = await prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId: course.id } } } } });
    const quizAttempts = await prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId: course.id } } } } });
    const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
    const forumDiscussions = await prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });

    const grades: Record<string, number | null> = {};
    gradedItems.forEach(item => grades[item.id] = null);

    submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined) grades[sub.assignmentId] = sub.grade; });
    quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId]!) grades[qa.quizId] = qa.score; });
    forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score! > grades[sf.lessonId]!)) grades[sf.lessonId] = sf.score!; });

    let totalEarned = 0;
    let totalMaxGraded = 0;

    gradedItems.forEach(item => {
      const score = grades[item.id];
      if (score !== null && score !== undefined) {
        totalEarned += score;
        totalMaxGraded += item.maxScore;
      }
    });

    const finalGrade = totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;

    return {
      id: course.id,
      title: course.title,
      courseCode: course.courseCode,
      finalGrade
    };
  }));

  // also get student
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true }
  });

  res.json({ status: "success", data: { program, coursesWithGrades, student } });
});

export const downloadCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { course: true, program: true }
  });

  if (!certificate) throw new AppError("Certificate not found", 404);

  const { CertificateService } = await import("../services/certificate.service");
  const pdfBuffer = await CertificateService.generateCertificatePDF(id);

  res.setHeader("Content-Type", "application/pdf");
  const slug = certificate.course ? certificate.course.slug : (certificate.program ? certificate.program.id : 'certificate');
  res.setHeader("Content-Disposition", `attachment; filename="${slug}-certificate.pdf"`);
  res.send(pdfBuffer);
});

// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) || "1"));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "50")));
  const skip = (page - 1) * limit;

  const action = req.query.action as string | undefined;
  const resource = req.query.resource as string | undefined;
  const status = req.query.status as string | undefined;
  const userId = req.query.userId as string | undefined;
  const search = req.query.search as string | undefined;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const role = req.query.role as string | undefined;

  const where: any = {};

  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (status) where.status = status;
  if (userId) where.userId = userId;
  if (role) where.actorRole = role;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  if (search) {
    where.OR = [
      { actorEmail: { contains: search, mode: "insensitive" } },
      { actorName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { resourceId: { contains: search, mode: "insensitive" } },
    ];
  }

  const db = prisma as any;
  const [logs, total] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
    }),
    db.activityLog.count({ where }),
  ]);

  res.json({
    status: "success",
    data: {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getLogStats = asyncHandler(async (req: Request, res: Response) => {
  const days = parseInt((req.query.days as string) || "30");
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const db = prisma as any;
  const [total, byAction, byStatus, recentFailures] = await Promise.all([
    db.activityLog.count({ where: { createdAt: { gte: since } } }),
    db.activityLog.groupBy({
      by: ["action"],
      where: { createdAt: { gte: since } },
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
    }),
    db.activityLog.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { status: true },
    }),
    db.activityLog.count({
      where: { createdAt: { gte: since }, status: "FAILED" },
    }),
  ]);

  const logins = byAction.find((a: any) => a.action === "LOGIN")?._count.action ?? 0;
  const mutations = byAction
    .filter((a: any) => !["LOGIN", "LOGOUT", "LOGIN_FAILED"].includes(a.action))
    .reduce((sum: number, a: any) => sum + a._count.action, 0);

  res.json({
    status: "success",
    data: {
      total,
      logins,
      mutations,
      failures: recentFailures,
      byAction: byAction.map((a: any) => ({ action: a.action, count: a._count.action })),
      byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count.status })),
    },
  });
});
