import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { redis } from "../utils/redis";
import { NotificationService } from "../services/notification.service";
import { ExportService } from "../services/export.service";
import { TokenService } from "../services/token.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { EmailService } from "../services/email.service";

// ─── STATS ───────────────────────────────────────────────────────────────────

export const getStats = asyncHandler(async (req: Request, res: Response) => {
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

  res.json({
    status: "success",
    data: {
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
    },
  });
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export const getRevenueAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as string) || "12m";
  const months = period === "7d" ? 1 : period === "30d" ? 1 : 12;

  const payments = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - months)) },
    },
    include: { enrollments: { select: { id: true } } },
    orderBy: { createdAt: "asc" },
  });

  const monthMap: Record<string, { revenue: number; enrollments: number }> = {};
  for (const p of payments) {
    const key = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthMap[key]) monthMap[key] = { revenue: 0, enrollments: 0 };
    monthMap[key].revenue += p.amount;
    monthMap[key].enrollments += p.enrollments.length;
  }

  const data = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));
  res.json({ status: "success", data });
});

export const getUserAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const months = req.query.period === "12m" ? 12 : 1;
  const since = new Date(new Date().setMonth(new Date().getMonth() - months));

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  const monthMap: Record<string, { students: number; instructors: number }> = {};
  for (const u of users) {
    const key = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthMap[key]) monthMap[key] = { students: 0, instructors: 0 };
    if (u.role === "STUDENT") monthMap[key].students++;
    if (u.role === "INSTRUCTOR") monthMap[key].instructors++;
  }

  res.json({ status: "success", data: Object.entries(monthMap).map(([month, v]) => ({ month, ...v })) });
});

export const getCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const [topByEnrollment, topByRating, byCategory, completionRates] = await Promise.all([
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
      select: {
        title: true,
        enrollments: { select: { status: true } },
      },
    }),
  ]);

  const calcRating = (reviews: { rating: number }[]) =>
    reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  res.json({
    status: "success",
    data: {
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
      completionRates: completionRates.map((c) => ({
        courseTitle: c.title,
        completionRate:
          c.enrollments.length
            ? parseFloat(
                ((c.enrollments.filter((e) => e.status === "COMPLETED").length / c.enrollments.length) * 100).toFixed(1)
              )
            : 0,
      })),
    },
  });
});

export const getEnrollmentAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const months = req.query.period === "12m" ? 12 : 1;
  const since = new Date(new Date().setMonth(new Date().getMonth() - months));

  const enrollments = await prisma.enrollment.findMany({
    where: { enrolledAt: { gte: since } },
    select: { enrolledAt: true, status: true },
    orderBy: { enrolledAt: "asc" },
  });

  const monthMap: Record<string, { newEnrollments: number; completions: number }> = {};
  for (const e of enrollments) {
    const key = new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthMap[key]) monthMap[key] = { newEnrollments: 0, completions: 0 };
    monthMap[key].newEnrollments++;
    if (e.status === "COMPLETED") monthMap[key].completions++;
  }

  res.json({ status: "success", data: Object.entries(monthMap).map(([month, v]) => ({ month, ...v })) });
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
      payoutPercentage: true, createdAt: true, updatedAt: true,
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

  const { name, role, church, location, isVerified, bio, payoutPercentage } = req.body;
  const allowedRoles = ["ADMIN", "INSTRUCTOR", "STUDENT"];
  if (role && !allowedRoles.includes(role)) throw new AppError("Invalid role", 400);

  const user = await prisma.user.update({
    where: { id },
    data: { name, role, church, location, isVerified, bio, payoutPercentage },
    select: { id: true, name: true, email: true, role: true, church: true, location: true, isVerified: true, bio: true, payoutPercentage: true },
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

  await prisma.user.delete({ where: { id } });
  res.json({ status: "success", message: "User deleted" });
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
      location: true, createdAt: true, isVerified: true, isBanned: true, payoutPercentage: true,
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
      isVerified: inst.isVerified, isBanned: inst.isBanned, payoutPercentage: inst.payoutPercentage,
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
      payoutPercentage: 70, // Default CWAY revenue split
    },
    select: {
      id: true, name: true, email: true, role: true, isVerified: true, createdAt: true
    }
  });

  // Send the email asynchronously
  EmailService.sendInstructorWelcomeEmail(user, password).catch(err => {
    console.error("Failed to send instructor welcome email:", err);
  });

  res.status(201).json({ status: "success", data: user, message: "Instructor created and email sent." });
});

export const updateInstructorPayout = asyncHandler(async (req: Request, res: Response) => {
  const { percentage } = req.body;
  if (typeof percentage !== "number" || isNaN(percentage) || percentage < 0 || percentage > 100) {
    throw new AppError("Percentage must be a number between 0 and 100", 400);
  }

  const user = await prisma.user.update({
    where: { id: req.params.id, role: "INSTRUCTOR" },
    data: { payoutPercentage: percentage },
    select: { id: true, name: true, payoutPercentage: true },
  });

  res.json({ status: "success", data: user });
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
        createdAt: true, rejectionReason: true,
        instructor: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
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
  const templates = await prisma.certificateTemplate.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ status: "success", data: templates });
});

export const createCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;

  if (isDefault) {
    await prisma.certificateTemplate.updateMany({ data: { isDefault: false } });
  }

  const template = await prisma.certificateTemplate.create({
    data: { name, htmlTemplate, isDefault: isDefault || false, logoUrl, signatorySignatureUrl, borderStyle },
  });

  res.status(201).json({ status: "success", data: template });
});

export const updateCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;

  if (isDefault) {
    await prisma.certificateTemplate.updateMany({ where: { NOT: { id: req.params.id } }, data: { isDefault: false } });
  }

  const template = await prisma.certificateTemplate.update({
    where: { id: req.params.id },
    data: { name, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle },
  });

  res.json({ status: "success", data: template });
});

export const deleteCertificateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) throw new AppError("Template not found", 404);
  if (template.isDefault) throw new AppError("Cannot delete the default certificate template", 400);

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
