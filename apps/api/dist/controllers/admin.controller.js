"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrograms = exports.updateSettings = exports.getSettings = exports.broadcastNotification = exports.getNotifications = exports.testEmailTemplate = exports.previewEmailTemplate = exports.updateEmailTemplate = exports.createEmailTemplate = exports.getEmailTemplates = exports.previewCertificateTemplate = exports.deleteCertificateTemplate = exports.updateCertificateTemplate = exports.createCertificateTemplate = exports.getCertificateTemplates = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCoupons = exports.linkSponsorship = exports.getSponsorships = exports.refundPayment = exports.getPayments = exports.reorderCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = exports.deleteCourse = exports.featureCourse = exports.rejectCourse = exports.approveCourse = exports.getCourses = exports.createInstructor = exports.getInstructors = exports.exportUsers = exports.impersonateUser = exports.deleteUser = exports.unbanUser = exports.banUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.getStudentTimeAnalytics = exports.getRecentEnrollments = exports.getEnrollmentAnalytics = exports.getCourseAnalytics = exports.getUserAnalytics = exports.getRevenueAnalytics = exports.getStats = void 0;
exports.getLogStats = exports.getLogs = exports.downloadCertificate = exports.getProgramStudentGrades = exports.rejectApplication = exports.approveApplication = exports.getApplicationById = exports.getApplications = exports.removeCourseFromProgram = exports.duplicateCourse = exports.createCourse = exports.assignInstructorToCourse = exports.addCourseToProgram = exports.deleteProgram = exports.updateProgram = exports.createProgram = exports.getProgramStudentDetails = exports.getProgramStudents = exports.getProgramById = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const redis_1 = require("../utils/redis");
const notification_service_1 = require("../services/notification.service");
const export_service_1 = require("../services/export.service");
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const email_service_1 = require("../services/email.service");
const storage_service_1 = require("../services/storage.service");
const video_service_1 = require("../services/video.service");
// ─── STATS ───────────────────────────────────────────────────────────────────
exports.getStats = (0, errors_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, totalStudents, totalInstructors, totalCourses, publishedCourses, pendingApprovals, totalEnrollments, enrollmentsThisMonth, revenueAll, revenueMonth, certificatesIssued, activeSponshorships,] = await Promise.all([
        prisma_1.prisma.user.count(),
        prisma_1.prisma.user.count({ where: { role: "STUDENT" } }),
        prisma_1.prisma.user.count({ where: { role: "INSTRUCTOR" } }),
        prisma_1.prisma.course.count(),
        prisma_1.prisma.course.count({ where: { status: "PUBLISHED" } }),
        prisma_1.prisma.course.count({ where: { status: "PENDING" } }),
        prisma_1.prisma.enrollment.count(),
        prisma_1.prisma.enrollment.count({ where: { enrolledAt: { gte: startOfMonth } } }),
        prisma_1.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
        prisma_1.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
        }),
        prisma_1.prisma.certificate.count(),
        prisma_1.prisma.sponsorship.count({ where: { status: "COMPLETED" } }),
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
exports.getRevenueAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const period = req.query.period || "12m";
    const months = period === "7d" ? 1 : period === "30d" ? 1 : 12;
    const since = new Date(new Date().setMonth(new Date().getMonth() - months));
    const stats = await prisma_1.prisma.$queryRaw `
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
    res.json({ status: "success", data });
});
exports.getUserAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const months = req.query.period === "12m" ? 12 : 1;
    const since = new Date(new Date().setMonth(new Date().getMonth() - months));
    const stats = await prisma_1.prisma.$queryRaw `
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
exports.getCourseAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const [topByEnrollment, topByRating, byCategory, coursesForCompletion, completionGroups] = await Promise.all([
        prisma_1.prisma.course.findMany({
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
        prisma_1.prisma.course.findMany({
            where: { status: "PUBLISHED" },
            take: 10,
            select: {
                id: true,
                title: true,
                _count: { select: { reviews: true } },
                reviews: { select: { rating: true } },
            },
        }),
        prisma_1.prisma.category.findMany({
            select: {
                name: true,
                _count: { select: { courses: true } },
                courses: { select: { _count: { select: { enrollments: true } } } },
            },
        }),
        prisma_1.prisma.course.findMany({
            where: { status: "PUBLISHED" },
            select: { id: true, title: true }
        }),
        prisma_1.prisma.enrollment.groupBy({
            by: ["courseId", "status"],
            _count: { id: true },
        }),
    ]);
    const calcRating = (reviews) => reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
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
            completionRates: coursesForCompletion.map((c) => {
                const statsForCourse = completionGroups.filter(g => g.courseId === c.id);
                const total = statsForCourse.reduce((acc, g) => acc + g._count.id, 0);
                const completed = statsForCourse.find(g => g.status === "COMPLETED")?._count.id || 0;
                return {
                    courseTitle: c.title,
                    completionRate: total > 0 ? parseFloat(((completed / total) * 100).toFixed(1)) : 0,
                };
            }).sort((a, b) => b.completionRate - a.completionRate),
        },
    });
});
exports.getEnrollmentAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const months = req.query.period === "12m" ? 12 : 1;
    const since = new Date(new Date().setMonth(new Date().getMonth() - months));
    const stats = await prisma_1.prisma.$queryRaw `
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
exports.getRecentEnrollments = (0, errors_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "8")));
    const enrollments = await prisma_1.prisma.enrollment.findMany({
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
exports.getStudentTimeAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10")));
    const cacheKey = `admin:analytics:students-time:${limit}`;
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return res.json({ status: "success", data: JSON.parse(cached) });
    const results = await prisma_1.prisma.$queryRaw `
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
    await redis_1.redis.set(cacheKey, JSON.stringify(topStudents), "EX", 60); // Cache for 60 seconds
    res.json({ status: "success", data: topStudents });
});
// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
exports.getUsers = (0, errors_1.asyncHandler)(async (req, res) => {
    const { role, status, language, search, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (role)
        where.role = role;
    if (language)
        where.preferredLanguage = language;
    if (status === "banned")
        where.isBanned = true;
    if (status === "active") {
        where.isBanned = false;
        where.isVerified = true;
    }
    if (status === "unverified") {
        where.isVerified = false;
        where.isBanned = false;
    }
    if (search)
        where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
    const validSortBy = { createdAt: "createdAt", name: "name", email: "email" };
    const orderBy = { [validSortBy[sortBy] || "createdAt"]: sortOrder === "asc" ? "asc" : "desc" };
    const [users, total] = await Promise.all([
        prisma_1.prisma.user.findMany({
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
        prisma_1.prisma.user.count({ where }),
    ]);
    res.json({ status: "success", data: { users, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.getUserById = (0, errors_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
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
    if (!user)
        throw new errors_1.AppError("User not found", 404);
    res.json({ status: "success", data: user });
});
exports.updateUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (id === req.user.id && req.body.role && req.body.role !== req.user.role) {
        throw new errors_1.AppError("You cannot change your own role", 400);
    }
    const { name, role, church, location, isVerified, bio } = req.body;
    const allowedRoles = ["ADMIN", "INSTRUCTOR", "STUDENT"];
    if (role && !allowedRoles.includes(role))
        throw new errors_1.AppError("Invalid role", 400);
    const user = await prisma_1.prisma.user.update({
        where: { id },
        data: { name, role, church, location, isVerified, bio },
        select: { id: true, name: true, email: true, role: true, church: true, location: true, isVerified: true, bio: true },
    });
    res.json({ status: "success", data: user });
});
exports.banUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (id === req.user.id)
        throw new errors_1.AppError("You cannot ban your own account", 400);
    await prisma_1.prisma.user.update({ where: { id }, data: { isBanned: true } });
    // Invalidate Redis session
    try {
        await redis_1.redis.del(`refresh:${id}`);
    }
    catch (_) { }
    res.json({ status: "success", message: "User banned" });
});
exports.unbanUser = (0, errors_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.user.update({ where: { id: req.params.id }, data: { isBanned: false } });
    res.json({ status: "success", message: "User unbanned" });
});
exports.deleteUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (id === req.user.id)
        throw new errors_1.AppError("You cannot delete your own account", 400);
    // 1. Fetch user and related file keys before deleting
    const user = await prisma_1.prisma.user.findUnique({
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
    if (!user)
        throw new errors_1.AppError("User not found", 404);
    // 2. Collect all R2 keys to delete
    const keysToDelete = [];
    // Avatar
    if (user.avatar) {
        const key = (0, storage_service_1.extractR2Key)(user.avatar);
        if (key)
            keysToDelete.push(key);
    }
    // Blog Posts
    user.blogPosts.forEach(post => {
        if (post.coverKey)
            keysToDelete.push(post.coverKey);
    });
    // Submissions
    user.submissions.forEach(sub => {
        const key = (0, storage_service_1.extractR2Key)(sub.fileUrl);
        if (key)
            keysToDelete.push(key);
    });
    // Courses (Instructor)
    const bunnyVideoIdsToDelete = [];
    user.coursesCreated.forEach(course => {
        const thumbKey = (0, storage_service_1.extractR2Key)(course.thumbnail);
        if (thumbKey)
            keysToDelete.push(thumbKey);
        // promoVideoUrl is normally Bunny.net embed URL, but if it's R2, this will catch it
        const promoKey = (0, storage_service_1.extractR2Key)(course.promoVideoUrl);
        if (promoKey)
            keysToDelete.push(promoKey);
        course.sections.forEach(sec => {
            sec.readingMaterials.forEach(rm => {
                if (rm.fileKey)
                    keysToDelete.push(rm.fileKey);
            });
            sec.lessons.forEach(lesson => {
                if (lesson.bunnyVideoId)
                    bunnyVideoIdsToDelete.push(lesson.bunnyVideoId);
                if (lesson.assignment?.attachmentUrl) {
                    const attKey = (0, storage_service_1.extractR2Key)(lesson.assignment.attachmentUrl);
                    if (attKey)
                        keysToDelete.push(attKey);
                }
            });
        });
    });
    // 3. Batch delete from R2 and Bunny.net (done in parallel, ignore errors so we don't block DB deletion)
    const deletePromises = keysToDelete.map(key => (0, storage_service_1.deleteFromR2)(key).catch(err => {
        console.error(`Failed to delete R2 key ${key}:`, err);
    }));
    const bunnyPromises = bunnyVideoIdsToDelete.map(vid => video_service_1.VideoService.deleteBunnyVideo(vid).catch(err => {
        console.error(`Failed to delete Bunny.net video ${vid}:`, err);
    }));
    await Promise.all([...deletePromises, ...bunnyPromises]);
    // 4. Delete user from database (Cascade handles the rest)
    await prisma_1.prisma.user.delete({ where: { id } });
    res.json({ status: "success", message: "User deleted and associated files removed from storage" });
});
exports.impersonateUser = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await prisma_1.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user)
        throw new errors_1.AppError("User not found", 404);
    const token = crypto_1.default.randomBytes(32).toString("hex");
    await redis_1.redis.set(`impersonate:${token}`, id, "EX", 300); // 5 min TTL
    res.json({ status: "success", data: { impersonateToken: token } });
});
exports.exportUsers = (0, errors_1.asyncHandler)(async (req, res) => {
    const { role, status, language, search } = req.query;
    const where = {};
    if (role)
        where.role = role;
    if (language)
        where.preferredLanguage = language;
    if (status === "banned")
        where.isBanned = true;
    if (status === "active") {
        where.isBanned = false;
        where.isVerified = true;
    }
    if (status === "unverified") {
        where.isVerified = false;
        where.isBanned = false;
    }
    if (search)
        where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];
    const users = await prisma_1.prisma.user.findMany({
        where,
        select: {
            id: true, name: true, email: true, role: true, church: true, location: true,
            preferredLanguage: true, isVerified: true, isBanned: true, createdAt: true,
            _count: { select: { enrollments: true } },
        },
    });
    const csv = export_service_1.ExportService.exportUsersCSV(users);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(csv);
});
// ─── INSTRUCTORS ─────────────────────────────────────────────────────────────
exports.getInstructors = (0, errors_1.asyncHandler)(async (req, res) => {
    const instructors = await prisma_1.prisma.user.findMany({
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
exports.createInstructor = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email)
        throw new errors_1.AppError("Name and email are required", 400);
    const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        throw new errors_1.AppError("A user with this email already exists", 400);
    // Generate a random 12-character alphanumeric password
    const password = crypto_1.default.randomBytes(8).toString("hex").slice(0, 12);
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({
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
    (0, email_service_1.sendInstructorWelcomeEmail)(user, password).catch((err) => {
        console.error("Failed to send instructor welcome email:", err);
    });
    res.status(201).json({ status: "success", data: user, message: "Instructor created and email sent." });
});
// ─── COURSE MANAGEMENT ───────────────────────────────────────────────────────
exports.getCourses = (0, errors_1.asyncHandler)(async (req, res) => {
    const { status, search, instructor, category, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (status)
        where.status = status;
    if (instructor)
        where.instructorId = instructor;
    if (category)
        where.categoryId = category;
    if (search)
        where.title = { contains: search, mode: "insensitive" };
    const [courses, total] = await Promise.all([
        prisma_1.prisma.course.findMany({
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
        prisma_1.prisma.course.count({ where }),
    ]);
    const data = courses.map((c) => ({
        ...c,
        avgRating: c.reviews.length ? c.reviews.reduce((a, r) => a + r.rating, 0) / c.reviews.length : 0,
        reviews: undefined,
    }));
    res.json({ status: "success", data: { courses: data, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.approveCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const course = await prisma_1.prisma.course.update({
        where: { id: req.params.id },
        data: { status: "PUBLISHED", rejectionReason: null },
        include: { instructor: { select: { id: true, name: true, email: true } } },
    });
    await notification_service_1.NotificationService.createNotification(course.instructorId, "COURSE_APPROVED", "Your course has been approved", `'${course.title}' is now live on CWAY Academy`, `/courses/${course.slug}`);
    try {
        await (0, email_service_1.sendCourseApprovedEmail)({ name: course.instructor.name, email: course.instructor.email }, { title: course.title, slug: course.slug, id: course.id });
    }
    catch (e) {
        console.error("[Email] Failed to send course approved email:", e);
    }
    res.json({ status: "success", message: "Course approved and published" });
});
exports.rejectCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { reason } = req.body;
    if (!reason)
        throw new errors_1.AppError("Rejection reason is required", 400);
    const course = await prisma_1.prisma.course.update({
        where: { id: req.params.id },
        data: { status: "DRAFT", rejectionReason: reason },
    });
    await notification_service_1.NotificationService.createNotification(course.instructorId, "COURSE_REJECTED", "Course needs revision", reason, `/instructor/courses/${course.id}/edit`);
    res.json({ status: "success", message: "Course rejected" });
});
exports.featureCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { isFeatured } = req.body;
    const course = await prisma_1.prisma.course.update({
        where: { id: req.params.id },
        data: { isFeatured: Boolean(isFeatured) },
        select: { id: true, title: true, isFeatured: true },
    });
    res.json({ status: "success", data: course });
});
exports.deleteCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const course = await prisma_1.prisma.course.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { enrollments: true } } },
    });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (course._count.enrollments > 0 && req.query.confirm !== "true") {
        return res.status(409).json({
            status: "warning",
            message: `This course has ${course._count.enrollments} active enrollment(s). Pass ?confirm=true to proceed.`,
            enrollmentCount: course._count.enrollments,
        });
    }
    await prisma_1.prisma.course.delete({ where: { id: req.params.id } });
    res.json({ status: "success", message: "Course deleted" });
});
// ─── CATEGORY MANAGEMENT ─────────────────────────────────────────────────────
exports.getCategories = (0, errors_1.asyncHandler)(async (req, res) => {
    const categories = await prisma_1.prisma.category.findMany({
        where: { parentId: null },
        orderBy: { order: "asc" },
        include: {
            children: { orderBy: { order: "asc" }, include: { _count: { select: { courses: true } } } },
            _count: { select: { courses: true } },
        },
    });
    res.json({ status: "success", data: categories });
});
exports.createCategory = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, slug, icon, parentId } = req.body;
    const autoSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const category = await prisma_1.prisma.category.create({
        data: { name, slug: autoSlug, icon, parentId: parentId || null },
    });
    res.status(201).json({ status: "success", data: category });
});
exports.updateCategory = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, slug, icon, parentId } = req.body;
    const category = await prisma_1.prisma.category.update({
        where: { id: req.params.id },
        data: { name, slug, icon, parentId: parentId || null },
    });
    res.json({ status: "success", data: category });
});
exports.deleteCategory = (0, errors_1.asyncHandler)(async (req, res) => {
    const cat = await prisma_1.prisma.category.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { courses: true } } },
    });
    if (!cat)
        throw new errors_1.AppError("Category not found", 404);
    if (cat._count.courses > 0)
        throw new errors_1.AppError("Cannot delete a category that has courses assigned to it", 400);
    await prisma_1.prisma.category.delete({ where: { id: req.params.id } });
    res.json({ status: "success", message: "Category deleted" });
});
exports.reorderCategories = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
        throw new errors_1.AppError("orderedIds must be an array", 400);
    await Promise.all(orderedIds.map((id, index) => prisma_1.prisma.category.update({ where: { id }, data: { order: index } })));
    res.json({ status: "success", message: "Reordered" });
});
// ─── PAYMENTS ────────────────────────────────────────────────────────────────
exports.getPayments = (0, errors_1.asyncHandler)(async (req, res) => {
    const { status, dateFrom, dateTo, search, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (status)
        where.status = status;
    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom)
            where.createdAt.gte = new Date(dateFrom);
        if (dateTo)
            where.createdAt.lte = new Date(dateTo);
    }
    if (search) {
        where.OR = [
            { student: { name: { contains: search, mode: "insensitive" } } },
            { student: { email: { contains: search, mode: "insensitive" } } },
            { course: { title: { contains: search, mode: "insensitive" } } },
        ];
    }
    const [payments, total, summary] = await Promise.all([
        prisma_1.prisma.payment.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            include: {
                student: { select: { name: true, email: true } },
                course: { select: { title: true } },
            },
        }),
        prisma_1.prisma.payment.count({ where }),
        prisma_1.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "COMPLETED" },
        }),
    ]);
    const refunded = await prisma_1.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "REFUNDED" } });
    const pending = await prisma_1.prisma.payment.count({ where: { status: "PENDING" } });
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
exports.refundPayment = (0, errors_1.asyncHandler)(async (req, res) => {
    const payment = await prisma_1.prisma.payment.findUnique({
        where: { id: req.params.id },
        include: { enrollments: { select: { id: true } } },
    });
    if (!payment)
        throw new errors_1.AppError("Payment not found", 404);
    if (payment.status !== "COMPLETED")
        throw new errors_1.AppError("Only completed payments can be refunded", 400);
    // TODO: Trigger actual Stripe refund via Stripe API in Phase 5
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // await stripe.refunds.create({ payment_intent: payment.stripePaymentId! });
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.payment.update({ where: { id: req.params.id }, data: { status: "REFUNDED" } }),
        ...payment.enrollments.map((e) => prisma_1.prisma.enrollment.update({ where: { id: e.id }, data: { status: "REFUNDED" } })),
    ]);
    res.json({ status: "success", message: "Refund processed" });
});
// ─── SPONSORSHIPS ────────────────────────────────────────────────────────────
exports.getSponsorships = (0, errors_1.asyncHandler)(async (req, res) => {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (status)
        where.status = status;
    const [sponsorships, total] = await Promise.all([
        prisma_1.prisma.sponsorship.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            include: { student: { select: { id: true, name: true, email: true } } },
        }),
        prisma_1.prisma.sponsorship.count({ where }),
    ]);
    res.json({ status: "success", data: { sponsorships, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.linkSponsorship = (0, errors_1.asyncHandler)(async (req, res) => {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
        throw new errors_1.AppError("studentId and courseId are required", 400);
    const sponsorship = await prisma_1.prisma.sponsorship.findUnique({ where: { id: req.params.id } });
    if (!sponsorship)
        throw new errors_1.AppError("Sponsorship not found", 404);
    // Check if student already enrolled
    const existing = await prisma_1.prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId, courseId } } });
    if (existing)
        throw new errors_1.AppError("Student is already enrolled in this course", 400);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.sponsorship.update({ where: { id: req.params.id }, data: { studentId, courseId } }),
        prisma_1.prisma.enrollment.create({ data: { studentId, courseId, sponsorshipId: req.params.id } }),
    ]);
    res.json({ status: "success", message: "Sponsorship linked and enrollment created" });
});
// ─── COUPONS ─────────────────────────────────────────────────────────────────
exports.getCoupons = (0, errors_1.asyncHandler)(async (req, res) => {
    const coupons = await prisma_1.prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        include: { course: { select: { id: true, title: true } } },
    });
    res.json({ status: "success", data: coupons });
});
exports.createCoupon = (0, errors_1.asyncHandler)(async (req, res) => {
    const { code, discount, type, maxUses, expiresAt, courseId } = req.body;
    if (!code || !discount || !type)
        throw new errors_1.AppError("code, discount, and type are required", 400);
    if (discount <= 0)
        throw new errors_1.AppError("Discount must be greater than 0", 400);
    if (type === "PERCENT" && discount > 100)
        throw new errors_1.AppError("Percent discount cannot exceed 100", 400);
    const coupon = await prisma_1.prisma.coupon.create({
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
exports.updateCoupon = (0, errors_1.asyncHandler)(async (req, res) => {
    const { isActive, expiresAt, maxUses } = req.body;
    const coupon = await prisma_1.prisma.coupon.update({
        where: { id: req.params.id },
        data: { isActive, expiresAt: expiresAt ? new Date(expiresAt) : undefined, maxUses },
        include: { course: { select: { id: true, title: true } } },
    });
    res.json({ status: "success", data: coupon });
});
exports.deleteCoupon = (0, errors_1.asyncHandler)(async (req, res) => {
    await prisma_1.prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ status: "success", message: "Coupon deleted" });
});
// ─── CERTIFICATE TEMPLATES ───────────────────────────────────────────────────
exports.getCertificateTemplates = (0, errors_1.asyncHandler)(async (req, res) => {
    const templates = await prisma_1.prisma.certificateTemplate.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { certificates: true } } }
    });
    res.json({ status: "success", data: templates });
});
exports.createCertificateTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, type, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;
    const templateType = type === "PROGRAM" ? "PROGRAM" : "COURSE";
    // If setting as default, unset other defaults of the same type only
    if (isDefault) {
        await prisma_1.prisma.certificateTemplate.updateMany({
            where: { type: templateType },
            data: { isDefault: false }
        });
    }
    const template = await prisma_1.prisma.certificateTemplate.create({
        data: { name, type: templateType, htmlTemplate, isDefault: isDefault || false, logoUrl, signatorySignatureUrl, borderStyle },
    });
    res.status(201).json({ status: "success", data: template });
});
exports.updateCertificateTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, type, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle } = req.body;
    const templateType = type === "PROGRAM" ? "PROGRAM" : "COURSE";
    // If setting as default, unset other defaults of the same type
    if (isDefault) {
        await prisma_1.prisma.certificateTemplate.updateMany({
            where: { type: templateType, NOT: { id: req.params.id } },
            data: { isDefault: false }
        });
    }
    const template = await prisma_1.prisma.certificateTemplate.update({
        where: { id: req.params.id },
        data: { name, type: templateType, htmlTemplate, isDefault, logoUrl, signatorySignatureUrl, borderStyle },
    });
    res.json({ status: "success", data: template });
});
exports.deleteCertificateTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const template = await prisma_1.prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
    if (!template)
        throw new errors_1.AppError("Template not found", 404);
    await prisma_1.prisma.certificateTemplate.delete({ where: { id: req.params.id } });
    res.json({ status: "success", message: "Template deleted" });
});
exports.previewCertificateTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const template = await prisma_1.prisma.certificateTemplate.findUnique({ where: { id: req.params.id } });
    if (!template)
        throw new errors_1.AppError("Template not found", 404);
    const { studentName, courseName, completionDate, instructorName, moduleNumber, uniqueCode } = req.query;
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
exports.getEmailTemplates = (0, errors_1.asyncHandler)(async (req, res) => {
    const templates = await prisma_1.prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
    res.json({ status: "success", data: templates });
});
exports.createEmailTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, subject, htmlBody } = req.body;
    if (!name || !subject || !htmlBody) {
        throw new errors_1.AppError("name, subject, and htmlBody are required", 400);
    }
    const existing = await prisma_1.prisma.emailTemplate.findUnique({ where: { name } });
    if (existing) {
        throw new errors_1.AppError(`An email template with the name '${name}' already exists.`, 400);
    }
    const template = await prisma_1.prisma.emailTemplate.create({
        data: { name, subject, htmlBody, variables: "[]" },
    });
    res.status(201).json({ status: "success", data: template });
});
exports.updateEmailTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { subject, htmlBody } = req.body;
    const template = await prisma_1.prisma.emailTemplate.update({
        where: { id: req.params.id },
        data: { subject, htmlBody },
    });
    res.json({ status: "success", data: template });
});
exports.previewEmailTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const template = await prisma_1.prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
    if (!template)
        throw new errors_1.AppError("Template not found", 404);
    const { sampleData } = req.body;
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
exports.testEmailTemplate = (0, errors_1.asyncHandler)(async (req, res) => {
    const template = await prisma_1.prisma.emailTemplate.findUnique({ where: { id: req.params.id } });
    if (!template)
        throw new errors_1.AppError("Template not found", 404);
    const { toEmail, sampleData } = req.body;
    if (!toEmail)
        throw new errors_1.AppError("toEmail is required", 400);
    // TODO: Actually send email via email service
    console.log(`[Test Email] To: ${toEmail}, Template: ${template.name}`);
    res.json({ status: "success", message: `Test email sent to ${toEmail}` });
});
// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
exports.getNotifications = (0, errors_1.asyncHandler)(async (req, res) => {
    const { userId, type, isRead, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (userId)
        where.userId = userId;
    if (type)
        where.type = type;
    if (isRead !== undefined)
        where.isRead = isRead === "true";
    const [notifications, total] = await Promise.all([
        prisma_1.prisma.notification.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true, email: true, role: true } } },
        }),
        prisma_1.prisma.notification.count({ where }),
    ]);
    res.json({ status: "success", data: { notifications, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.broadcastNotification = (0, errors_1.asyncHandler)(async (req, res) => {
    const { targetRole, targetUserIds, title, body, link, sendEmail } = req.body;
    if (!title || !body)
        throw new errors_1.AppError("title and body are required", 400);
    const result = await notification_service_1.NotificationService.createBroadcastNotification(targetRole || "ALL", title, body, link, targetUserIds);
    // TODO: Queue email jobs via BullMQ if sendEmail === true
    res.json({ status: "success", message: `Broadcast sent to ${result.count} users` });
});
// ─── SETTINGS ────────────────────────────────────────────────────────────────
exports.getSettings = (0, errors_1.asyncHandler)(async (req, res) => {
    const settings = await prisma_1.prisma.siteSettings.findFirst();
    res.json({ status: "success", data: settings });
});
exports.updateSettings = (0, errors_1.asyncHandler)(async (req, res) => {
    const existing = await prisma_1.prisma.siteSettings.findFirst();
    const data = req.body;
    const settings = existing
        ? await prisma_1.prisma.siteSettings.update({ where: { id: existing.id }, data })
        : await prisma_1.prisma.siteSettings.create({ data });
    res.json({ status: "success", data: settings });
});
// ─── PROGRAM MANAGEMENT (LMS WORKFLOW) ───────────────────────────────────────
exports.getPrograms = (0, errors_1.asyncHandler)(async (req, res) => {
    const { status, search, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (status)
        where.status = status;
    if (search)
        where.title = { contains: search, mode: "insensitive" };
    const [programs, total] = await Promise.all([
        prisma_1.prisma.program.findMany({
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
        prisma_1.prisma.program.count({ where }),
    ]);
    res.json({ status: "success", data: { programs, total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.getProgramById = (0, errors_1.asyncHandler)(async (req, res) => {
    const program = await prisma_1.prisma.program.findUnique({
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
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    res.json({ status: "success", data: program });
});
exports.getProgramStudents = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const enrollments = await prisma_1.prisma.programEnrollment.findMany({
        where: { programId: id },
        include: {
            student: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
        },
        orderBy: { enrolledAt: "desc" },
    });
    res.json({ status: "success", data: enrollments });
});
exports.getProgramStudentDetails = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id, studentId } = req.params;
    // 1. Get the program enrollment
    const programEnrollment = await prisma_1.prisma.programEnrollment.findUnique({
        where: { studentId_programId: { studentId, programId: id } },
        include: {
            student: { select: { id: true, name: true, email: true, avatar: true, phone: true } },
            program: { select: { id: true, title: true } },
        },
    });
    if (!programEnrollment)
        throw new errors_1.AppError("Student is not enrolled in this program", 404);
    // 2. Get all courses in this program and the student's progress
    const courses = await prisma_1.prisma.course.findMany({
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
    const certificates = await prisma_1.prisma.certificate.findMany({
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
                const quizzes = [];
                const assignments = [];
                course.sections.forEach((section) => {
                    section.lessons.forEach((lesson) => {
                        if (lesson.quiz)
                            quizzes.push(lesson.quiz);
                        if (lesson.assignment)
                            assignments.push(lesson.assignment);
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
exports.createProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, description, duration, tags, status } = req.body;
    if (!title)
        throw new errors_1.AppError("Title is required", 400);
    const program = await prisma_1.prisma.program.create({
        data: {
            title,
            description: description || null,
            duration: duration || null,
            tags: tags ? JSON.stringify(tags) : "[]",
            status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        },
    });
    res.status(201).json({ status: "success", data: program });
});
exports.updateProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, description, duration, tags, status, applicationsClosed } = req.body;
    const program = await prisma_1.prisma.program.update({
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
    res.json({ status: "success", data: program });
});
exports.deleteProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const program = await prisma_1.prisma.program.findUnique({
        where: { id: req.params.id },
        include: { _count: { select: { courses: true } } },
    });
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    // Unlink courses from this program instead of deleting them
    await prisma_1.prisma.course.updateMany({
        where: { programId: req.params.id },
        data: { programId: null },
    });
    await prisma_1.prisma.program.delete({ where: { id: req.params.id } });
    res.json({ status: "success", message: "Program deleted" });
});
exports.addCourseToProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { programId } = req.params;
    const { title, description, price, requirements, instructorId, courseCode } = req.body;
    if (!title)
        throw new errors_1.AppError("Course title is required", 400);
    // Find or use provided instructorId; fallback to admin's own id
    const resolvedInstructorId = instructorId || req.user.id;
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const course = await prisma_1.prisma.course.create({
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
exports.assignInstructorToCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId } = req.params;
    const { instructorId, adminNote } = req.body;
    if (!instructorId)
        throw new errors_1.AppError("instructorId is required", 400);
    const [course, instructor] = await Promise.all([
        prisma_1.prisma.course.findUnique({ where: { id: courseId } }),
        prisma_1.prisma.user.findUnique({ where: { id: instructorId, role: "INSTRUCTOR" } }),
    ]);
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (!instructor)
        throw new errors_1.AppError("Instructor not found", 404);
    // Delete any existing invitation for this course
    await prisma_1.prisma.courseInvitation.deleteMany({ where: { courseId } });
    // Create new invitation and update course
    const [invitation] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.courseInvitation.create({
            data: { courseId, instructorId, adminNote: adminNote || null, status: "PENDING" },
            include: { instructor: { select: { id: true, name: true, email: true } } },
        }),
        prisma_1.prisma.course.update({
            where: { id: courseId },
            data: { instructorId, invitationStatus: "PENDING" },
        }),
    ]);
    await notification_service_1.NotificationService.createNotification(instructorId, "COURSE_INVITATION", "You've been assigned a course", `You have a new course invitation: "${course.title}"`, `/instructor/courses`);
    res.json({ status: "success", data: invitation, message: "Invitation sent to instructor" });
});
function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}
async function uniqueSlug(title) {
    let slug = slugify(title);
    let count = 0;
    while (await prisma_1.prisma.course.findUnique({ where: { slug } })) {
        count++;
        slug = `${slugify(title)}-${count}`;
    }
    return slug;
}
exports.createCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, subtitle, description, categoryId, level = "BEGINNER", language = "ENGLISH", moduleNumber, weeksDuration = 6, totalLectures = 0, scriptureRef, isFree = true, price = 0, currency = "INR", requirements, outcomes, targetAudience, welcomeMessage, congratsMessage, tags, instructorId, adminNote } = req.body;
    if (!title)
        throw new errors_1.AppError("Title is required", 400);
    if (!instructorId)
        throw new errors_1.AppError("Instructor ID is required to create a course", 400);
    const slug = await uniqueSlug(title);
    const [course, invitation] = await prisma_1.prisma.$transaction(async (tx) => {
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
    await notification_service_1.NotificationService.createNotification(instructorId, "COURSE_INVITATION", "You've been assigned a new course", `An admin created '${course.title}' and assigned it to you.`, `/instructor/invitations`);
    res.status(201).json({ status: "success", data: course, invitation });
});
exports.duplicateCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { programId } = req.body;
    const originalCourse = await prisma_1.prisma.course.findUnique({
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
    if (!originalCourse)
        throw new errors_1.AppError("Course not found", 404);
    const crypto = await Promise.resolve().then(() => __importStar(require("crypto")));
    const randomHex = crypto.randomBytes(3).toString("hex");
    const slug = await uniqueSlug(`${originalCourse.title} Copy ${randomHex}`);
    const newCourse = await prisma_1.prisma.$transaction(async (tx) => {
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
exports.removeCourseFromProgram = (0, errors_1.asyncHandler)(async (req, res) => {
    const { programId, courseId } = req.params;
    const course = await prisma_1.prisma.course.findUnique({
        where: { id: courseId },
    });
    if (!course || course.programId !== programId) {
        throw new errors_1.AppError("Course not found in this program", 404);
    }
    await prisma_1.prisma.course.update({
        where: { id: courseId },
        data: { programId: null },
    });
    res.json({ status: "success", message: "Course removed from program" });
});
// ─── PROGRAM APPLICATIONS ────────────────────────────────────────────────────
exports.getApplications = (0, errors_1.asyncHandler)(async (req, res) => {
    const applications = await prisma_1.prisma.programApplication.findMany({
        include: { program: { select: { title: true } } },
        orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: applications });
});
exports.getApplicationById = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const application = await prisma_1.prisma.programApplication.findUnique({
        where: { id },
        include: {
            program: { select: { title: true } },
            referenceForms: true
        }
    });
    if (!application)
        throw new errors_1.AppError("Application not found", 404);
    res.json({ status: "success", data: application });
});
exports.approveApplication = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const application = await prisma_1.prisma.programApplication.findUnique({
        where: { id },
        include: { program: { include: { courses: { orderBy: { createdAt: "asc" } } } } }
    });
    if (!application)
        throw new errors_1.AppError("Application not found", 404);
    if (application.status !== "PENDING")
        throw new errors_1.AppError("Application is not pending", 400);
    let user = await prisma_1.prisma.user.findUnique({ where: { email: application.email } });
    let password = "";
    if (!user) {
        password = Math.random().toString(36).slice(-8);
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        user = await prisma_1.prisma.user.create({
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
    await prisma_1.prisma.programEnrollment.upsert({
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
        await prisma_1.prisma.enrollment.upsert({
            where: { studentId_courseId: { studentId: user.id, courseId: firstCourse.id } },
            update: {},
            create: { studentId: user.id, courseId: firstCourse.id }
        });
    }
    await prisma_1.prisma.programApplication.update({
        where: { id },
        data: { status: "APPROVED" }
    });
    if (password) {
        const { sendAdmissionEmail } = await Promise.resolve().then(() => __importStar(require("../services/email.service")));
        await sendAdmissionEmail({ name: user.name, email: user.email }, password, application.program.title);
    }
    res.json({ status: "success", message: "Application approved successfully" });
});
exports.rejectApplication = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.programApplication.update({
        where: { id },
        data: { status: "REJECTED" }
    });
    res.json({ status: "success", message: "Application rejected" });
});
exports.getProgramStudentGrades = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: programId, studentId } = req.params;
    const program = await prisma_1.prisma.program.findUnique({
        where: { id: programId },
        include: {
            courses: {
                include: {
                    enrollments: { where: { studentId } }
                }
            }
        }
    });
    if (!program)
        throw new errors_1.AppError("Program not found", 404);
    const coursesWithGrades = await Promise.all(program.courses.map(async (course) => {
        const courseData = await prisma_1.prisma.course.findUnique({
            where: { id: course.id },
            include: { sections: { include: { lessons: { include: { assignment: true, quiz: true } } } } }
        });
        if (!courseData)
            return { ...course, finalGrade: 0 };
        const gradedItems = [];
        courseData.sections.forEach(sec => {
            sec.lessons.forEach(lesson => {
                if (lesson.assignment)
                    gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore });
                if (lesson.quiz)
                    gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100 });
                if (lesson.type === "FORUM")
                    gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100 });
            });
        });
        const submissions = await prisma_1.prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId: course.id } } } } });
        const quizAttempts = await prisma_1.prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId: course.id } } } } });
        const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
        const forumDiscussions = await prisma_1.prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });
        const grades = {};
        gradedItems.forEach(item => grades[item.id] = null);
        submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined)
            grades[sub.assignmentId] = sub.grade; });
        quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId])
            grades[qa.quizId] = qa.score; });
        forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score > grades[sf.lessonId]))
            grades[sf.lessonId] = sf.score; });
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
    const student = await prisma_1.prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, email: true }
    });
    res.json({ status: "success", data: { program, coursesWithGrades, student } });
});
exports.downloadCertificate = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const certificate = await prisma_1.prisma.certificate.findUnique({
        where: { id },
        include: { course: true, program: true }
    });
    if (!certificate)
        throw new errors_1.AppError("Certificate not found", 404);
    const { CertificateService } = await Promise.resolve().then(() => __importStar(require("../services/certificate.service")));
    const pdfBuffer = await CertificateService.generateCertificatePDF(id);
    res.setHeader("Content-Type", "application/pdf");
    const slug = certificate.course ? certificate.course.slug : (certificate.program ? certificate.program.id : 'certificate');
    res.setHeader("Content-Disposition", `attachment; filename="${slug}-certificate.pdf"`);
    res.send(pdfBuffer);
});
// ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────
exports.getLogs = (0, errors_1.asyncHandler)(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "50")));
    const skip = (page - 1) * limit;
    const action = req.query.action;
    const resource = req.query.resource;
    const status = req.query.status;
    const userId = req.query.userId;
    const search = req.query.search;
    const from = req.query.from;
    const to = req.query.to;
    const role = req.query.role;
    const where = {};
    if (action)
        where.action = action;
    if (resource)
        where.resource = resource;
    if (status)
        where.status = status;
    if (userId)
        where.userId = userId;
    if (role)
        where.actorRole = role;
    if (from || to) {
        where.createdAt = {};
        if (from)
            where.createdAt.gte = new Date(from);
        if (to)
            where.createdAt.lte = new Date(to);
    }
    if (search) {
        where.OR = [
            { actorEmail: { contains: search, mode: "insensitive" } },
            { actorName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { resourceId: { contains: search, mode: "insensitive" } },
        ];
    }
    const db = prisma_1.prisma;
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
exports.getLogStats = (0, errors_1.asyncHandler)(async (req, res) => {
    const days = parseInt(req.query.days || "30");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const db = prisma_1.prisma;
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
    const logins = byAction.find((a) => a.action === "LOGIN")?._count.action ?? 0;
    const mutations = byAction
        .filter((a) => !["LOGIN", "LOGOUT", "LOGIN_FAILED"].includes(a.action))
        .reduce((sum, a) => sum + a._count.action, 0);
    res.json({
        status: "success",
        data: {
            total,
            logins,
            mutations,
            failures: recentFailures,
            byAction: byAction.map((a) => ({ action: a.action, count: a._count.action })),
            byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
        },
    });
});
