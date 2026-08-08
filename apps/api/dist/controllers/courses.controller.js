"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.uploadAvatar = exports.sendMessage = exports.getMessageThread = exports.getConversations = exports.getCourseAnalytics = exports.unenrollStudent = exports.getInstructorCourseStudents = exports.getInstructorStats = exports.getMyCourses = exports.deleteForumReply = exports.createForumReply = exports.deleteForumPost = exports.pinForumPost = exports.createForumPost = exports.getForumPosts = exports.resetQuizAttempts = exports.getQuizStats = exports.getQuizAttempts = exports.gradeSubmission = exports.getAssignmentSubmissions = exports.getInstructorAssignments = exports.updateAssignment = exports.createAssignment = exports.reorderQuestions = exports.deleteQuestion = exports.updateQuestion = exports.addQuestion = exports.updateQuiz = exports.createQuiz = exports.uploadLessonAttachment = exports.getLessonVideoStatus = exports.uploadLessonVideo = exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.reorderSections = exports.deleteSection = exports.updateSection = exports.createSection = exports.uploadPromoVideo = exports.uploadThumbnail = exports.duplicateCourse = exports.submitForReview = exports.deleteCourseInstructor = exports.updateCourse = exports.getCourse = exports.createCourse = exports.listCourses = void 0;
exports.declineInvitation = exports.acceptInvitation = exports.getInvitations = exports.getInstructorGradebook = exports.deleteAnnouncement = exports.createAnnouncement = exports.getInstructorAnnouncements = exports.getCourseAnnouncements = exports.getPublicCategories = void 0;
const localized_1 = require("../utils/localized");
const prisma_1 = require("../utils/prisma");
const redis_1 = require("../utils/redis");
const errors_1 = require("../utils/errors");
const storage_service_1 = require("../services/storage.service");
const video_service_1 = require("../services/video.service");
const notification_service_1 = require("../services/notification.service");
const authz_1 = require("../utils/authz");
// ─── Helpers ───────────────────────────────────────────────────────────────
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
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
function parseJson(val, fallback = []) {
    try {
        return JSON.parse(val || "[]");
    }
    catch {
        return fallback;
    }
}
// ─── CACHE HELPER ─────────────────────────────────────────────────────────────
async function invalidateCourseCache(courseId) {
    try {
        if (courseId) {
            await redis_1.redis.del(`cway:course:${courseId}`);
        }
        const keys = await redis_1.redis.keys("cway:public:courses:*");
        if (keys.length > 0) {
            await redis_1.redis.del(...keys);
        }
    }
    catch (e) {
        console.error("Redis invalidation error:", e);
    }
}
// ─── PUBLIC: LIST COURSES ───────────────────────────────────────────────────
exports.listCourses = (0, errors_1.asyncHandler)(async (req, res) => {
    const { search, category, level, language, isFree, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const cacheKey = `cway:public:courses:${JSON.stringify(req.query)}`;
    try {
        const cached = await redis_1.redis.get(cacheKey);
        if (cached)
            return res.json(JSON.parse(cached));
    }
    catch (e) {
        console.error("Redis get error:", e);
    }
    const where = {};
    // Public catalog only shows published courses
    where.status = "PUBLISHED";
    if (search)
        where.OR = [{ title: { contains: search } }, { subtitle: { contains: search } }];
    if (category)
        where.categoryId = category;
    if (level)
        where.level = level;
    if (language)
        where.language = language;
    if (isFree !== undefined)
        where.isFree = isFree === "true";
    if (minPrice)
        where.price = { gte: Number(minPrice) };
    if (maxPrice)
        where.price = { ...where.price, lte: Number(maxPrice) };
    const orderBy = sortBy === "popular" ? { enrollments: { _count: "desc" } } :
        sortBy === "rating" ? { createdAt: "desc" } :
            sortBy === "moduleOrder" ? { moduleNumber: "asc" } :
                { createdAt: "desc" };
    const [courses, total] = await Promise.all([
        prisma_1.prisma.course.findMany({
            where, skip, take: Number(limit), orderBy,
            select: {
                id: true, title: true, slug: true, subtitle: true, thumbnail: true,
                price: true, currency: true, status: true, level: true, language: true,
                moduleNumber: true, weeksDuration: true, totalLectures: true, isFree: true,
                isFeatured: true, programId: true,
                instructor: { select: { id: true, name: true, avatar: true } },
                category: { select: { name: true } },
                _count: { select: { enrollments: true, sections: true } },
                reviews: { select: { rating: true } },
                program: { select: { id: true, title: true, description: true } },
            },
        }),
        prisma_1.prisma.course.count({ where }),
    ]);
    const enriched = courses.map((c) => {
        const ratings = c.reviews.map((r) => r.rating);
        return {
            ...c,
            avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            reviewCount: ratings.length,
            reviews: undefined,
        };
    });
    const responseData = { status: "success", data: { courses: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } };
    try {
        await redis_1.redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);
    }
    catch (e) {
        console.error("Redis set error:", e);
    }
    res.json(responseData);
});
// ─── CREATE COURSE ──────────────────────────────────────────────────────────
exports.createCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, subtitle, description, categoryId, level = "BEGINNER", language = "ENGLISH", moduleNumber, weeksDuration = 6, totalLectures = 0, scriptureRef, isFree = true, price = 0, currency = "INR", requirements, outcomes, targetAudience, welcomeMessage, congratsMessage, tags, instructorId } = req.body;
    if (!title)
        throw new errors_1.AppError("Title is required", 400);
    const instId = (req.user.role === "ADMIN" && instructorId) ? instructorId : req.user.id;
    const slug = await uniqueSlug(title);
    const course = await prisma_1.prisma.course.create({
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
            slug, status: "DRAFT", instructorId: instId,
            forum: { create: {} },
            curriculum: { create: {} }
        },
    });
    await invalidateCourseCache();
    res.status(201).json({ status: "success", data: course });
});
// ─── GET COURSE ─────────────────────────────────────────────────────────────
exports.getCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    let course = null;
    const cacheKey = `cway:course:${id}`;
    try {
        const cached = await redis_1.redis.get(cacheKey);
        if (cached)
            course = JSON.parse(cached);
    }
    catch (e) {
        console.error("Redis get error:", e);
    }
    if (!course) {
        course = await prisma_1.prisma.course.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            include: {
                instructor: { select: { id: true, name: true, avatar: true, bio: true, church: true } },
                category: { select: { id: true, name: true, slug: true } },
                sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { quiz: true } }, readingMaterials: { orderBy: { order: "asc" } } } },
                reviews: { select: { rating: true } },
                announcements: { orderBy: { createdAt: "desc" } },
                _count: { select: { enrollments: true } },
                curriculum: true,
            },
        });
        if (course) {
            try {
                await redis_1.redis.set(cacheKey, JSON.stringify(course), "EX", 3600);
            }
            catch (e) {
                console.error("Redis set error:", e);
            }
        }
    }
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    // Non-published courses only accessible by owner/admin
    if (course.status !== "PUBLISHED") {
        if (!req.user)
            throw new errors_1.AppError("Course not found", 404);
        if (req.user.role === "STUDENT")
            throw new errors_1.AppError("Course not found", 404);
        if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id)
            throw new errors_1.AppError("Not authorized", 403);
    }
    let isEnrolled = false;
    if (req.user?.role === "STUDENT") {
        const enrollment = await prisma_1.prisma.enrollment.findUnique({
            where: { studentId_courseId: { studentId: req.user.id, courseId: course.id } },
        });
        if (enrollment) {
            isEnrolled = true;
        }
        else if (course.programId) {
            const progEnrollment = await prisma_1.prisma.programEnrollment.findFirst({
                where: { studentId: req.user.id, programId: course.programId },
            });
            if (progEnrollment && progEnrollment.status !== "REJECTED" && progEnrollment.status !== "WITHDRAWN") {
                isEnrolled = true;
            }
        }
    }
    const isInstructor = req.user?.id === course.instructorId || req.user?.role === "ADMIN" || req.user?.role === "REGISTRAR";
    const ratings = course.reviews.map((r) => r.rating);
    // Strip private content for non-enrolled students
    const sections = course.sections.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => ({
            ...l,
            content: (isInstructor || isEnrolled || l.isFree || l.isPreview) ? l.content : undefined,
            videoUrl: (isInstructor || isEnrolled || l.isFree || l.isPreview) ? l.videoUrl : undefined,
        })),
        readingMaterials: s.readingMaterials?.map((rm) => ({
            ...rm,
            fileUrl: (isInstructor || isEnrolled) ? rm.fileUrl : undefined,
            fileKey: (isInstructor || isEnrolled) ? rm.fileKey : undefined,
        })) || [],
    }));
    res.json({
        status: "success", data: {
            ...course,
            sections,
            avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            reviewCount: ratings.length,
            enrollmentCount: course._count.enrollments,
            isEnrolled,
            reviews: undefined, _count: undefined,
        },
    });
});
// ─── UPDATE COURSE ──────────────────────────────────────────────────────────
exports.updateCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    const { title, subtitle, description, categoryId, level, language, moduleNumber, weeksDuration, totalLectures, scriptureRef, isFree, price, currency, requirements, outcomes, targetAudience, welcomeMessage, congratsMessage, tags, status, courseCode } = req.body;
    const data = {};
    if (courseCode !== undefined)
        data.courseCode = courseCode === "" ? null : courseCode;
    if (title !== undefined) {
        data.title = title;
        data.slug = await uniqueSlug(title);
    }
    if (subtitle !== undefined)
        data.subtitle = subtitle;
    if (description !== undefined)
        data.description = description;
    if (categoryId !== undefined)
        data.categoryId = categoryId === "" ? null : categoryId;
    if (level !== undefined)
        data.level = level;
    if (language !== undefined)
        data.language = language;
    if (moduleNumber !== undefined)
        data.moduleNumber = moduleNumber ? Number(moduleNumber) : null;
    if (weeksDuration !== undefined)
        data.weeksDuration = Number(weeksDuration);
    if (totalLectures !== undefined)
        data.totalLectures = Number(totalLectures);
    if (scriptureRef !== undefined)
        data.scriptureRef = scriptureRef;
    if (isFree !== undefined)
        data.isFree = Boolean(isFree);
    if (price !== undefined)
        data.price = Number(price);
    if (currency !== undefined)
        data.currency = currency;
    if (requirements !== undefined)
        data.requirements = JSON.stringify(requirements);
    if (outcomes !== undefined)
        data.outcomes = JSON.stringify(outcomes);
    if (targetAudience !== undefined)
        data.targetAudience = JSON.stringify(targetAudience);
    if (welcomeMessage !== undefined)
        data.welcomeMessage = welcomeMessage;
    if (congratsMessage !== undefined)
        data.congratsMessage = congratsMessage;
    if (tags !== undefined)
        data.tags = JSON.stringify(tags);
    if (status !== undefined) {
        if (req.user.role === "ADMIN") {
            data.status = status;
        }
        else if (req.user.role === "INSTRUCTOR" && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
            data.status = status;
        }
    }
    const updated = await prisma_1.prisma.course.update({ where: { id }, data });
    await invalidateCourseCache(id);
    res.json({ status: "success", data: updated });
});
// ─── DELETE COURSE ──────────────────────────────────────────────────────────
exports.deleteCourseInstructor = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } } } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    if (course._count.enrollments > 0)
        throw new errors_1.AppError(`This course has ${course._count.enrollments} active enrollments. Archive instead of deleting.`, 400);
    await prisma_1.prisma.course.delete({ where: { id } });
    await invalidateCourseCache(id);
    res.json({ status: "success", message: "Course deleted" });
});
// ─── SUBMIT FOR REVIEW ──────────────────────────────────────────────────────
exports.submitForReview = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id }, include: { instructor: true } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (course.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    if (course.status !== "DRAFT" && course.status !== "REJECTED")
        throw new errors_1.AppError("Only DRAFT or REJECTED courses can be submitted", 400);
    await prisma_1.prisma.course.update({ where: { id }, data: { status: "PENDING" } });
    // Notify all admins
    const admins = await prisma_1.prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(admins.map((admin) => notification_service_1.NotificationService.createNotification(admin.id, "COURSE_PENDING_REVIEW", `${course.instructor.name} submitted a course for review`, `'${course.title}' is awaiting your approval`, `/admin/courses?status=PENDING`)));
    await invalidateCourseCache(id);
    res.json({ status: "success", message: "Course submitted for review" });
});
// ─── DUPLICATE COURSE ────────────────────────────────────────────────────────
exports.duplicateCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const original = await prisma_1.prisma.course.findUnique({
        where: { id }, include: { sections: { include: { lessons: true } } },
    });
    if (!original)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && original.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    const slug = await uniqueSlug(`${original.title} Copy`);
    const newCourse = await prisma_1.prisma.course.create({
        data: {
            title: `${original.title} (Copy)`, slug, subtitle: original.subtitle,
            description: original.description, categoryId: original.categoryId,
            level: original.level, language: original.language,
            moduleNumber: original.moduleNumber, weeksDuration: original.weeksDuration,
            totalLectures: original.totalLectures, scriptureRef: original.scriptureRef,
            isFree: original.isFree, price: original.price, currency: original.currency,
            requirements: original.requirements, outcomes: original.outcomes,
            targetAudience: original.targetAudience, tags: original.tags,
            instructorId: original.instructorId, status: "DRAFT",
        },
    });
    await prisma_1.prisma.forum.create({ data: { courseId: newCourse.id } });
    for (const section of original.sections) {
        const newSection = await prisma_1.prisma.section.create({ data: { courseId: newCourse.id, title: section.title, order: section.order } });
        for (const lesson of section.lessons) {
            await prisma_1.prisma.lesson.create({
                data: { sectionId: newSection.id, title: lesson.title, type: lesson.type, content: lesson.content, videoUrl: lesson.videoUrl, duration: lesson.duration, order: lesson.order, isFree: lesson.isFree, isPreview: lesson.isPreview },
            });
        }
    }
    await invalidateCourseCache();
    res.status(201).json({ status: "success", data: { newCourseId: newCourse.id } });
});
// ─── THUMBNAIL UPLOAD ────────────────────────────────────────────────────────
exports.uploadThumbnail = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, authz_1.verifyCourseOwner)(id, req.user);
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const ext = req.file.mimetype.split("/")[1];
    const key = (0, storage_service_1.generateKey)("thumbnails", `${id}-${Date.now()}.${ext}`);
    const { url } = await (0, storage_service_1.uploadToR2)(req.file.buffer, key, req.file.mimetype);
    await prisma_1.prisma.course.update({ where: { id }, data: { thumbnail: url } });
    await invalidateCourseCache(id);
    res.json({ status: "success", data: { thumbnailUrl: url } });
});
// ─── PROMO VIDEO UPLOAD ──────────────────────────────────────────────────────
exports.uploadPromoVideo = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, authz_1.verifyCourseOwner)(id, req.user);
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const course = await prisma_1.prisma.course.findUnique({ where: { id } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    const { videoId, uploadUrl } = await video_service_1.VideoService.createBunnyVideo(course.title);
    await video_service_1.VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
    const streamUrl = video_service_1.VideoService.getBunnyStreamUrl(videoId);
    await prisma_1.prisma.course.update({ where: { id }, data: { promoVideoUrl: streamUrl } });
    await invalidateCourseCache(id);
    res.json({ status: "success", data: { videoUrl: streamUrl, videoId } });
});
// ─── SECTIONS ────────────────────────────────────────────────────────────────
exports.createSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, authz_1.verifyCourseOwner)(id, req.user);
    const { title, order } = req.body;
    if (!title)
        throw new errors_1.AppError("Title required", 400);
    let sectionOrder = Number(order);
    if (!order) {
        const last = await prisma_1.prisma.section.findFirst({ where: { courseId: id }, orderBy: { order: "desc" } });
        sectionOrder = last ? last.order + 1 : 0;
    }
    const section = await prisma_1.prisma.section.create({ data: { courseId: id, title, order: sectionOrder } });
    await invalidateCourseCache(id);
    res.status(201).json({ status: "success", data: section });
});
exports.updateSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    await (0, authz_1.verifySectionOwner)(sectionId, req.user);
    const { title, order } = req.body;
    const section = await prisma_1.prisma.section.update({ where: { id: sectionId }, data: { ...(title && { title }), ...(order !== undefined && { order: Number(order) }) } });
    const course = await prisma_1.prisma.course.findFirst({ where: { sections: { some: { id: sectionId } } } });
    if (course)
        await invalidateCourseCache(course.id);
    res.json({ status: "success", data: section });
});
exports.deleteSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    await (0, authz_1.verifySectionOwner)(sectionId, req.user);
    const section = await prisma_1.prisma.section.findUnique({ where: { id: sectionId } });
    await prisma_1.prisma.section.delete({ where: { id: sectionId } });
    if (section)
        await invalidateCourseCache(section.courseId);
    res.json({ status: "success", message: "Section deleted" });
});
exports.reorderSections = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    if (orderedIds.length > 0)
        await (0, authz_1.verifySectionOwner)(orderedIds[0], req.user);
    await prisma_1.prisma.$transaction(orderedIds.map((sid, idx) => prisma_1.prisma.section.update({ where: { id: sid }, data: { order: idx } })));
    if (orderedIds.length > 0) {
        const section = await prisma_1.prisma.section.findUnique({ where: { id: orderedIds[0] } });
        if (section)
            await invalidateCourseCache(section.courseId);
    }
    res.json({ status: "success", message: "Sections reordered" });
});
// ─── LESSONS ─────────────────────────────────────────────────────────────────
exports.createLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    await (0, authz_1.verifySectionOwner)(sectionId, req.user);
    const { title, type = "VIDEO", content, videoUrl, duration, order, isFree = false, isPreview = false } = req.body;
    if (!title)
        throw new errors_1.AppError("Title required", 400);
    let lessonOrder = Number(order);
    if (!order) {
        const last = await prisma_1.prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
        lessonOrder = last ? last.order + 1 : 0;
    }
    const lesson = await prisma_1.prisma.lesson.create({ data: { sectionId, title, type, content, videoUrl, duration: duration ? Number(duration) : 0, order: lessonOrder, isFree: Boolean(isFree), isPreview: Boolean(isPreview) } });
    const section = await prisma_1.prisma.section.findUnique({ where: { id: sectionId } });
    if (section)
        await invalidateCourseCache(section.courseId);
    res.status(201).json({ status: "success", data: lesson });
});
exports.updateLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    const { title, type, content, videoUrl, duration, order, isFree, isPreview } = req.body;
    const data = {};
    if (title !== undefined)
        data.title = title;
    if (type !== undefined)
        data.type = type;
    if (content !== undefined)
        data.content = content;
    if (videoUrl !== undefined)
        data.videoUrl = videoUrl;
    if (duration !== undefined)
        data.duration = Number(duration);
    if (order !== undefined)
        data.order = Number(order);
    if (isFree !== undefined)
        data.isFree = Boolean(isFree);
    if (isPreview !== undefined)
        data.isPreview = Boolean(isPreview);
    const lesson = await prisma_1.prisma.lesson.update({ where: { id: lessonId }, data });
    const section = await prisma_1.prisma.section.findUnique({ where: { id: lesson.sectionId } });
    if (section)
        await invalidateCourseCache(section.courseId);
    res.json({ status: "success", data: lesson });
});
exports.deleteLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId } });
    await prisma_1.prisma.lesson.delete({ where: { id: lessonId } });
    if (lesson) {
        const section = await prisma_1.prisma.section.findUnique({ where: { id: lesson.sectionId } });
        if (section)
            await invalidateCourseCache(section.courseId);
    }
    res.json({ status: "success", message: "Lesson deleted" });
});
exports.reorderLessons = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    if (orderedIds.length > 0)
        await (0, authz_1.verifyLessonOwner)(orderedIds[0], req.user);
    await prisma_1.prisma.$transaction(orderedIds.map((lid, idx) => prisma_1.prisma.lesson.update({ where: { id: lid }, data: { order: idx } })));
    if (orderedIds.length > 0) {
        const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: orderedIds[0] } });
        if (lesson) {
            const section = await prisma_1.prisma.section.findUnique({ where: { id: lesson.sectionId } });
            if (section)
                await invalidateCourseCache(section.courseId);
        }
    }
    res.json({ status: "success", message: "Lessons reordered" });
});
exports.uploadLessonVideo = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    const { videoId, uploadUrl } = await video_service_1.VideoService.createBunnyVideo(lesson.title);
    await video_service_1.VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
    const streamUrl = video_service_1.VideoService.getBunnyStreamUrl(videoId);
    await prisma_1.prisma.lesson.update({ where: { id: lessonId }, data: { videoUrl: streamUrl, bunnyVideoId: videoId } });
    await invalidateCourseCache(lesson.section.courseId);
    res.json({ status: "success", data: { videoId, streamUrl, status: "processing" } });
});
exports.getLessonVideoStatus = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    if (!lesson.bunnyVideoId)
        throw new errors_1.AppError("No video attached to this lesson", 400);
    const status = await video_service_1.VideoService.getBunnyVideoStatus(lesson.bunnyVideoId);
    res.json({ status: "success", data: status });
});
exports.uploadLessonAttachment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const key = (0, storage_service_1.generateKey)("attachments", req.file.originalname);
    const { url } = await (0, storage_service_1.uploadToR2)(req.file.buffer, key, req.file.mimetype);
    // Update assignment attachmentUrl
    await prisma_1.prisma.assignment.updateMany({ where: { lessonId }, data: { attachmentUrl: url } });
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
    if (lesson)
        await invalidateCourseCache(lesson.section.courseId);
    res.json({ status: "success", data: { attachmentUrl: url } });
});
// ─── QUIZ ─────────────────────────────────────────────────────────────────────
exports.createQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    const { title, passingScore = 70, timeLimit, maxAttempts = 3 } = req.body;
    const quiz = await prisma_1.prisma.quiz.create({ data: { lessonId, title, passingScore: Number(passingScore), timeLimit: timeLimit ? Number(timeLimit) : null, maxAttempts: Number(maxAttempts) } });
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
    if (lesson)
        await invalidateCourseCache(lesson.section.courseId);
    res.status(201).json({ status: "success", data: { ...quiz, questions: [] } });
});
exports.updateQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    await (0, authz_1.verifyQuizOwner)(quizId, req.user);
    const { title, passingScore, timeLimit, maxAttempts } = req.body;
    const data = {};
    if (title)
        data.title = title;
    if (passingScore !== undefined)
        data.passingScore = Number(passingScore);
    if (timeLimit !== undefined)
        data.timeLimit = timeLimit ? Number(timeLimit) : null;
    if (maxAttempts !== undefined)
        data.maxAttempts = Number(maxAttempts);
    const quiz = await prisma_1.prisma.quiz.update({ where: { id: quizId }, data });
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: quiz.lessonId }, include: { section: true } });
    if (lesson)
        await invalidateCourseCache(lesson.section.courseId);
    res.json({ status: "success", data: quiz });
});
exports.addQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    await (0, authz_1.verifyQuizOwner)(quizId, req.user);
    const { text, type = "MCQ", points = 1, order, scriptureRef, answers = [] } = req.body;
    if (!text)
        throw new errors_1.AppError("Question text required", 400);
    if (type === "MCQ" && answers.filter((a) => a.isCorrect).length !== 1)
        throw new errors_1.AppError("MCQ must have exactly 1 correct answer", 400);
    let qOrder = Number(order);
    if (!order) {
        const last = await prisma_1.prisma.question.findFirst({ where: { quizId }, orderBy: { order: "desc" } });
        qOrder = last ? last.order + 1 : 0;
    }
    const question = await prisma_1.prisma.question.create({
        data: { quizId, text, type, points: Number(points), order: qOrder, scriptureRef, answers: { create: answers.map((a) => ({ text: a.text, isCorrect: Boolean(a.isCorrect) })) } },
        include: { answers: true },
    });
    const quiz = await prisma_1.prisma.quiz.findUnique({ where: { id: quizId }, include: { lesson: { include: { section: true } } } });
    if (quiz)
        await invalidateCourseCache(quiz.lesson.section.courseId);
    res.status(201).json({ status: "success", data: question });
});
exports.updateQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
    await (0, authz_1.verifyQuestionOwner)(questionId, req.user);
    const { text, type, points, scriptureRef, answers } = req.body;
    const data = {};
    if (text)
        data.text = text;
    if (type)
        data.type = type;
    if (points !== undefined)
        data.points = Number(points);
    if (scriptureRef !== undefined)
        data.scriptureRef = scriptureRef;
    if (answers) {
        await prisma_1.prisma.answer.deleteMany({ where: { questionId } });
        data.answers = { create: answers.map((a) => ({ text: a.text, isCorrect: Boolean(a.isCorrect) })) };
    }
    const question = await prisma_1.prisma.question.update({ where: { id: questionId }, data, include: { answers: true } });
    const quiz = await prisma_1.prisma.quiz.findUnique({ where: { id: question.quizId }, include: { lesson: { include: { section: true } } } });
    if (quiz)
        await invalidateCourseCache(quiz.lesson.section.courseId);
    res.json({ status: "success", data: question });
});
exports.deleteQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
    await (0, authz_1.verifyQuestionOwner)(questionId, req.user);
    const question = await prisma_1.prisma.question.findUnique({ where: { id: questionId }, include: { quiz: { include: { lesson: { include: { section: true } } } } } });
    await prisma_1.prisma.question.delete({ where: { id: questionId } });
    if (question)
        await invalidateCourseCache(question.quiz.lesson.section.courseId);
    res.json({ status: "success", message: "Question deleted" });
});
exports.reorderQuestions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    if (orderedIds.length > 0)
        await (0, authz_1.verifyQuestionOwner)(orderedIds[0], req.user);
    await prisma_1.prisma.$transaction(orderedIds.map((qid, idx) => prisma_1.prisma.question.update({ where: { id: qid }, data: { order: idx } })));
    if (orderedIds.length > 0) {
        const question = await prisma_1.prisma.question.findUnique({ where: { id: orderedIds[0] }, include: { quiz: { include: { lesson: { include: { section: true } } } } } });
        if (question)
            await invalidateCourseCache(question.quiz.lesson.section.courseId);
    }
    res.json({ status: "success", message: "Questions reordered" });
});
// ─── ASSIGNMENT ───────────────────────────────────────────────────────────────
exports.createAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await (0, authz_1.verifyLessonOwner)(lessonId, req.user);
    const { title, description, dueDate, maxScore = 100 } = req.body;
    const assignment = await prisma_1.prisma.assignment.create({ data: { lessonId, title, description, dueDate: dueDate ? new Date(dueDate) : null, maxScore: Number(maxScore) } });
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
    if (lesson)
        await invalidateCourseCache(lesson.section.courseId);
    res.status(201).json({ status: "success", data: assignment });
});
exports.updateAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    await (0, authz_1.verifyAssignmentOwner)(assignmentId, req.user);
    const { title, description, dueDate, maxScore } = req.body;
    const data = {};
    if (title)
        data.title = title;
    if (description)
        data.description = description;
    if (dueDate !== undefined)
        data.dueDate = dueDate ? new Date(dueDate) : null;
    if (maxScore !== undefined)
        data.maxScore = Number(maxScore);
    const assignment = await prisma_1.prisma.assignment.update({ where: { id: assignmentId }, data });
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: assignment.lessonId }, include: { section: true } });
    if (lesson)
        await invalidateCourseCache(lesson.section.courseId);
    res.json({ status: "success", data: assignment });
});
// ─── GRADING ──────────────────────────────────────────────────────────────────
exports.getInstructorAssignments = (0, errors_1.asyncHandler)(async (req, res) => {
    const { courseId, isGraded, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // Get all course IDs for this instructor
    const courses = await prisma_1.prisma.course.findMany({ where: { instructorId: req.user.id }, select: { id: true } });
    const courseIds = courses.map((c) => c.id);
    const where = { assignment: { lesson: { section: { courseId: { in: courseIds } } } } };
    if (courseId)
        where.assignment.lesson.section.courseId = courseId;
    if (isGraded !== undefined)
        where.isGraded = isGraded === "true";
    const submissions = await prisma_1.prisma.submission.findMany({
        where, skip, take: Number(limit), orderBy: { submittedAt: "desc" },
        include: { student: { select: { name: true, avatar: true } }, assignment: { include: { lesson: { include: { section: { include: { course: { select: { title: true } } } } } } } } },
    });
    res.json({ status: "success", data: submissions });
});
exports.getAssignmentSubmissions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const { isGraded } = req.query;
    const where = { assignmentId };
    if (isGraded !== undefined)
        where.isGraded = isGraded === "true";
    const submissions = await prisma_1.prisma.submission.findMany({ where, include: { student: { select: { name: true, email: true, avatar: true, church: true } } } });
    res.json({ status: "success", data: submissions });
});
exports.gradeSubmission = (0, errors_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    await (0, authz_1.verifySubmissionOwner)(submissionId, req.user);
    const { grade, feedback } = req.body;
    const submission = await prisma_1.prisma.submission.findUnique({ where: { id: submissionId }, include: { assignment: { include: { lesson: { include: { section: true } } } } } });
    if (!submission)
        throw new errors_1.AppError("Submission not found", 404);
    if (grade < 0 || grade > submission.assignment.maxScore)
        throw new errors_1.AppError(`Grade must be 0–${submission.assignment.maxScore}`, 400);
    const updated = await prisma_1.prisma.submission.update({
        where: { id: submissionId },
        data: { grade: Number(grade), feedback, isGraded: true, gradedAt: new Date() },
    });
    await notification_service_1.NotificationService.createNotification(submission.studentId, "ASSIGNMENT_GRADED", "Your assignment has been graded", `You scored ${grade}/${submission.assignment.maxScore} on '${(0, localized_1.resolveLocalized)(submission.assignment.title)}'`, "/student/assignments");
    await invalidateCourseCache(submission.assignment.lesson.section.courseId);
    res.json({ status: "success", data: updated });
});
// ─── QUIZ RESULTS ────────────────────────────────────────────────────────────
exports.getQuizAttempts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const attempts = await prisma_1.prisma.quizAttempt.findMany({
        where: { quizId }, orderBy: { startedAt: "desc" },
        include: { student: { select: { name: true, avatar: true } } },
    });
    res.json({ status: "success", data: attempts });
});
exports.getQuizStats = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const attempts = await prisma_1.prisma.quizAttempt.findMany({ where: { quizId, completedAt: { not: null } } });
    const total = attempts.length;
    const passed = attempts.filter((a) => a.passed).length;
    const scores = attempts.map((a) => a.score);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const distribution = [
        { range: "0-20", count: scores.filter((s) => s <= 20).length },
        { range: "21-40", count: scores.filter((s) => s > 20 && s <= 40).length },
        { range: "41-60", count: scores.filter((s) => s > 40 && s <= 60).length },
        { range: "61-80", count: scores.filter((s) => s > 60 && s <= 80).length },
        { range: "81-100", count: scores.filter((s) => s > 80).length },
    ];
    res.json({ status: "success", data: { totalAttempts: total, passRate: total ? (passed / total) * 100 : 0, avgScore: avg, scoreDistribution: distribution } });
});
exports.resetQuizAttempts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const { studentId } = req.body;
    await (0, authz_1.verifyQuizOwner)(quizId, req.user);
    const where = { quizId };
    if (studentId)
        where.studentId = studentId;
    const deleted = await prisma_1.prisma.quizAttempt.deleteMany({
        where
    });
    res.json({ status: "success", message: `Reset ${deleted.count} attempts successfully` });
});
// ─── FORUM ───────────────────────────────────────────────────────────────────
exports.getForumPosts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 20, isPinned } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const forum = await prisma_1.prisma.forum.findUnique({ where: { courseId: id } });
    if (!forum)
        throw new errors_1.AppError("Forum not found", 404);
    const where = { forumId: forum.id };
    if (isPinned !== undefined)
        where.isPinned = isPinned === "true";
    const posts = await prisma_1.prisma.forumPost.findMany({
        where, skip, take: Number(limit),
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: { author: { select: { id: true, name: true, avatar: true, role: true } }, _count: { select: { replies: true } } },
    });
    res.json({ status: "success", data: posts });
});
exports.createForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await (0, authz_1.verifyForumAccess)(id, req.user);
    const { title, content } = req.body;
    const forum = await prisma_1.prisma.forum.findUnique({ where: { courseId: id } });
    if (!forum)
        throw new errors_1.AppError("Forum not found", 404);
    const post = await prisma_1.prisma.forumPost.create({ data: { forumId: forum.id, authorId: req.user.id, title, content }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
    res.status(201).json({ status: "success", data: post });
});
exports.pinForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const post = await prisma_1.prisma.forumPost.findUnique({ where: { id: postId }, select: { forum: { select: { courseId: true } } } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    await (0, authz_1.verifyCourseOwner)(post.forum.courseId, req.user);
    const updated = await prisma_1.prisma.forumPost.update({ where: { id: postId }, data: { isPinned: true } });
    res.json({ status: "success", data: updated });
});
exports.deleteForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    await (0, authz_1.verifyForumPostOwnerOrInstructor)(postId, req.user);
    await prisma_1.prisma.forumPost.delete({ where: { id: postId } });
    res.json({ status: "success", message: "Post deleted" });
});
exports.createForumReply = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    await (0, authz_1.verifyForumAccessFromPost)(postId, req.user);
    const { content } = req.body;
    const post = await prisma_1.prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    const reply = await prisma_1.prisma.forumReply.create({ data: { postId, authorId: req.user.id, content }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
    // Notify post author
    if (post.authorId !== req.user.id) {
        await notification_service_1.NotificationService.createNotification(post.authorId, "FORUM_REPLY", "Your question received a reply", `Someone replied to your post: '${post.title}'`, `/courses/${postId}/forum`);
    }
    res.status(201).json({ status: "success", data: reply });
});
exports.deleteForumReply = (0, errors_1.asyncHandler)(async (req, res) => {
    const { replyId } = req.params;
    await (0, authz_1.verifyForumReplyOwnerOrInstructor)(replyId, req.user);
    await prisma_1.prisma.forumReply.delete({ where: { id: replyId } });
    res.json({ status: "success", message: "Reply deleted" });
});
// ─── INSTRUCTOR STATS ────────────────────────────────────────────────────────
exports.getMyCourses = (0, errors_1.asyncHandler)(async (req, res) => {
    const whereClause = (req.user.role === "ADMIN" || req.user.role === "REGISTRAR")
        ? {}
        : {
            instructorId: req.user.id,
            OR: [{ invitation: null }, { invitation: { status: "ACCEPTED" } }],
        };
    const courses = await prisma_1.prisma.course.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            instructor: { select: { id: true, name: true, avatar: true } },
            category: { select: { name: true } },
            _count: { select: { enrollments: { where: { studentId: { not: req.user.id } } }, sections: true } },
            reviews: { select: { rating: true } },
            enrollments: { select: { progress: true } },
            program: { select: { title: true } },
        },
    });
    const enriched = courses.map((c) => {
        const ratings = c.reviews.map((r) => r.rating);
        const totalProgress = c.enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
        const avgProgress = c.enrollments.length ? totalProgress / c.enrollments.length : 0;
        return {
            ...c,
            avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            reviewCount: ratings.length,
            avgProgress,
            reviews: undefined,
            enrollments: undefined,
        };
    });
    res.json({ status: "success", data: { courses: enriched, total: courses.length, page: 1, pages: 1 } });
});
exports.getInstructorStats = (0, errors_1.asyncHandler)(async (req, res) => {
    const instructorId = req.user.id;
    const courses = await prisma_1.prisma.course.findMany({
        where: {
            instructorId,
            OR: [
                { invitation: null },
                { invitation: { status: "ACCEPTED" } }
            ]
        },
        select: { id: true, status: true }
    });
    const courseIds = courses.map((c) => c.id);
    const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
    const [enrollments, payments, reviews, completions, pendingSubmissions] = await Promise.all([
        prisma_1.prisma.enrollment.count({ where: { courseId: { in: courseIds }, studentId: { not: instructorId } } }),
        prisma_1.prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED" }, select: { amount: true } }),
        prisma_1.prisma.review.findMany({ where: { courseId: { in: courseIds } }, select: { rating: true } }),
        prisma_1.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: "COMPLETED", studentId: { not: instructorId } } }),
        prisma_1.prisma.submission.count({ where: { assignment: { lesson: { section: { courseId: { in: courseIds } } } }, isGraded: false } }),
    ]);
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const ratings = reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPayments = await prisma_1.prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED", createdAt: { gte: monthStart } }, select: { amount: true } });
    const revenueThisMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ status: "success", data: { totalStudents: enrollments, totalRevenue, revenueThisMonth, avgRating, totalCompletions: completions, pendingSubmissions, publishedCourses } });
});
exports.getInstructorCourseStudents = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    const enrollments = await prisma_1.prisma.enrollment.findMany({
        where: { courseId: id, studentId: { not: course.instructorId } },
        include: {
            student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            lessonProgress: {
                where: { completedAt: { not: null } },
                include: { lesson: { select: { title: true } } }
            },
            readingMaterialProgress: {
                where: { completedAt: { not: null } },
                include: { readingMaterial: { select: { title: true } } }
            }
        },
        orderBy: { enrolledAt: "desc" }
    });
    const enriched = enrollments.map(e => {
        let lastCompleted = null;
        for (const lp of e.lessonProgress) {
            if (lp.completedAt && (!lastCompleted || lp.completedAt > lastCompleted.date)) {
                lastCompleted = { title: lp.lesson.title, date: lp.completedAt };
            }
        }
        for (const rp of e.readingMaterialProgress) {
            if (rp.completedAt && (!lastCompleted || rp.completedAt > lastCompleted.date)) {
                lastCompleted = { title: rp.readingMaterial.title, date: rp.completedAt };
            }
        }
        return {
            ...e,
            lastCompleted,
            lessonProgress: undefined,
            readingMaterialProgress: undefined
        };
    });
    res.json({ status: "success", data: enriched });
});
exports.unenrollStudent = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId, studentId } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
    });
    if (!enrollment)
        throw new errors_1.AppError("Enrollment not found", 404);
    await prisma_1.prisma.enrollment.delete({
        where: { id: enrollment.id }
    });
    res.json({ status: "success", message: "Student unenrolled successfully" });
});
// ─── COURSE ANALYTICS ────────────────────────────────────────────────────────
exports.getCourseAnalytics = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id }, include: { sections: { include: { lessons: true } } } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    const enrollments = await prisma_1.prisma.enrollment.findMany({ where: { courseId: id }, include: { lessonProgress: { select: { lessonId: true } } } });
    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
    const notStarted = enrollments.filter((e) => e.progress === 0).length;
    // Enrollments over time (last 6 months)
    const enrollmentsOverTime = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const count = enrollments.filter((e) => e.enrolledAt >= start && e.enrolledAt < end).length;
        enrollmentsOverTime.push({ month: start.toLocaleString("default", { month: "short" }), count });
    }
    // Lesson completion rates
    const allLessons = course.sections.flatMap((s) => s.lessons);
    const lessonCompletionRates = allLessons.map((l) => {
        const completed = enrollments.filter((e) => e.lessonProgress.some((lp) => lp.lessonId === l.id)).length;
        return { lessonId: l.id, lessonTitle: l.title, completionRate: total ? (completed / total) * 100 : 0 };
    });
    const studentProgress = { notStarted, inProgress: total - notStarted - completed, completed };
    res.json({ status: "success", data: { enrollmentsOverTime, lessonCompletionRates, revenueOverTime: [], quizStats: [], studentProgress } });
});
// ─── MESSAGES ────────────────────────────────────────────────────────────────
exports.getConversations = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const messages = await prisma_1.prisma.message.findMany({
        where: { OR: [{ senderId: userId }, { receiverId: userId }] },
        orderBy: { sentAt: "desc" },
        include: { sender: { select: { id: true, name: true, avatar: true, role: true } }, receiver: { select: { id: true, name: true, avatar: true, role: true } } },
    });
    const convoMap = new Map();
    for (const m of messages) {
        const other = m.senderId === userId ? m.receiver : m.sender;
        if (!convoMap.has(other.id)) {
            const unread = await prisma_1.prisma.message.count({ where: { senderId: other.id, receiverId: userId, readAt: null } });
            convoMap.set(other.id, { otherUser: other, lastMessage: { content: m.content, sentAt: m.sentAt, isRead: !!m.readAt }, unreadCount: unread });
        }
    }
    res.json({ status: "success", data: Array.from(convoMap.values()) });
});
exports.getMessageThread = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const otherId = req.params.userId;
    const messages = await prisma_1.prisma.message.findMany({
        where: { OR: [{ senderId: userId, receiverId: otherId }, { senderId: otherId, receiverId: userId }] },
        orderBy: { sentAt: "asc" },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    // Mark as read
    await prisma_1.prisma.message.updateMany({ where: { senderId: otherId, receiverId: userId, readAt: null }, data: { readAt: new Date() } });
    res.json({ status: "success", data: messages });
});
exports.sendMessage = (0, errors_1.asyncHandler)(async (req, res) => {
    const { receiverId, content } = req.body;
    if (!content || content.length > 2000)
        throw new errors_1.AppError("Message must be 1-2000 characters", 400);
    const message = await prisma_1.prisma.message.create({
        data: { senderId: req.user.id, receiverId, content },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
    });
    const sender = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id }, select: { name: true } });
    await notification_service_1.NotificationService.createNotification(receiverId, "NEW_MESSAGE", `New message from ${sender?.name}`, content.slice(0, 80), `/student/dashboard`);
    res.status(201).json({ status: "success", data: message });
});
// ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────
exports.uploadAvatar = (0, errors_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const key = (0, storage_service_1.generateKey)("avatars", `${req.user.id}.${req.file.mimetype.split("/")[1]}`);
    const { url } = await (0, storage_service_1.uploadToR2)(req.file.buffer, key, req.file.mimetype);
    await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { avatar: url } });
    res.json({ status: "success", data: { avatarUrl: url } });
});
// ─── USER PROFILE UPDATE ──────────────────────────────────────────────────────
exports.updateMyProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, bio, church, location, phone, socialLinks, title, credentials, yearsExperience, expertise, notificationPrefs, avatar } = req.body;
    const data = {};
    if (name)
        data.name = name;
    // Allow clearing the avatar: an explicit null/empty removes the profile photo.
    if (avatar !== undefined)
        data.avatar = avatar === "" ? null : avatar;
    if (bio !== undefined)
        data.bio = bio;
    if (church !== undefined)
        data.church = church;
    if (location !== undefined)
        data.location = location;
    if (phone !== undefined)
        data.phone = phone;
    if (socialLinks !== undefined)
        data.socialLinks = JSON.stringify(socialLinks);
    if (title !== undefined)
        data.title = title;
    if (credentials !== undefined)
        data.credentials = credentials;
    if (yearsExperience !== undefined)
        data.yearsExperience = Number(yearsExperience);
    if (expertise !== undefined)
        data.expertise = JSON.stringify(expertise);
    if (notificationPrefs !== undefined)
        data.notificationPrefs = JSON.stringify(notificationPrefs);
    const user = await prisma_1.prisma.user.update({ where: { id: req.user.id }, data, select: { id: true, name: true, email: true, bio: true, church: true, location: true, phone: true, avatar: true, role: true, title: true, credentials: true, yearsExperience: true, expertise: true, notificationPrefs: true, socialLinks: true } });
    res.json({ status: "success", data: user });
});
// ─── CATEGORIES (public) ─────────────────────────────────────────────────────
exports.getPublicCategories = (0, errors_1.asyncHandler)(async (_req, res) => {
    const cats = await prisma_1.prisma.category.findMany({ orderBy: { order: "asc" } });
    res.json({ status: "success", data: cats });
});
// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
exports.getCourseAnnouncements = (0, errors_1.asyncHandler)(async (req, res) => {
    const course = await prisma_1.prisma.course.findFirst({
        where: { OR: [{ id: req.params.id }, { slug: req.params.id }] }
    });
    if (!course)
        return res.status(404).json({ status: "error", message: "Course not found" });
    const announcements = await prisma_1.prisma.announcement.findMany({
        where: { courseId: course.id },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, avatar: true, role: true } } }
    });
    res.json({ status: "success", data: announcements });
});
exports.getInstructorAnnouncements = (0, errors_1.asyncHandler)(async (req, res) => {
    const announcements = await prisma_1.prisma.announcement.findMany({
        where: { courseId: req.params.id, authorId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, avatar: true, role: true } } }
    });
    res.json({ status: "success", data: announcements });
});
exports.createAnnouncement = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ status: "error", message: "Title and content are required" });
    }
    const course = await prisma_1.prisma.course.findFirst({ where: { id: req.params.id, instructorId: req.user.id } });
    if (!course)
        return res.status(404).json({ status: "error", message: "Course not found" });
    const announcement = await prisma_1.prisma.announcement.create({
        data: {
            courseId: course.id,
            authorId: req.user.id,
            title,
            content,
        },
        include: { author: { select: { id: true, name: true, avatar: true, role: true } } }
    });
    // Create notifications for all enrolled students
    const enrollments = await prisma_1.prisma.enrollment.findMany({ where: { courseId: course.id, status: "ACTIVE" } });
    if (enrollments.length > 0) {
        const notifications = enrollments.map(e => ({
            userId: e.studentId,
            type: "ANNOUNCEMENT",
            title: `New Announcement in ${course.title}`,
            body: title,
            link: `/student/courses/${course.slug || course.id}/learn`,
        }));
        await prisma_1.prisma.notification.createMany({ data: notifications });
    }
    res.json({ status: "success", data: announcement });
});
exports.deleteAnnouncement = (0, errors_1.asyncHandler)(async (req, res) => {
    const announcement = await prisma_1.prisma.announcement.findFirst({
        where: { id: req.params.announcementId, courseId: req.params.id, authorId: req.user.id }
    });
    if (!announcement) {
        return res.status(404).json({ status: "error", message: "Announcement not found" });
    }
    await prisma_1.prisma.announcement.delete({ where: { id: announcement.id } });
    res.json({ status: "success", message: "Announcement deleted" });
});
// ── GRADEBOOK ───────────────────────────────────────────────────────────────
exports.getInstructorGradebook = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findUnique({ where: { id } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    // 1. Fetch graded items (Assignments and Quizzes)
    const modules = await prisma_1.prisma.section.findMany({
        where: { courseId: id },
        include: {
            lessons: {
                include: {
                    assignment: true,
                    quiz: true
                }
            }
        },
        orderBy: { order: "asc" }
    });
    const gradedItems = [];
    for (const mod of modules) {
        for (const lesson of mod.lessons.sort((a, b) => a.order - b.order)) {
            if (lesson.assignment) {
                gradedItems.push({
                    id: lesson.assignment.id,
                    title: lesson.assignment.title,
                    type: "ASSIGNMENT",
                    maxScore: lesson.assignment.maxScore
                });
            }
            if (lesson.quiz) {
                gradedItems.push({
                    id: lesson.quiz.id,
                    title: lesson.quiz.title,
                    type: "QUIZ",
                    maxScore: 100 // Default or specific to quiz if maxScore added later
                });
            }
            if (lesson.type === "FORUM") {
                gradedItems.push({
                    id: lesson.id,
                    title: lesson.title,
                    type: "FORUM",
                    maxScore: lesson.forumMarks || 100
                });
            }
        }
    }
    // 2. Fetch all students (Enrollments)
    const enrollments = await prisma_1.prisma.enrollment.findMany({
        where: { courseId: id },
        include: {
            student: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { enrolledAt: "desc" }
    });
    // Extract student IDs
    const studentIds = enrollments.map(e => e.student.id);
    // 3. Fetch submissions and quiz attempts for these students & items
    const assignmentIds = gradedItems.filter(i => i.type === "ASSIGNMENT").map(i => i.id);
    const quizIds = gradedItems.filter(i => i.type === "QUIZ").map(i => i.id);
    const submissions = await prisma_1.prisma.submission.findMany({
        where: {
            studentId: { in: studentIds },
            assignmentId: { in: assignmentIds }
        }
    });
    const quizAttempts = await prisma_1.prisma.quizAttempt.findMany({
        where: {
            studentId: { in: studentIds },
            quizId: { in: quizIds }
        }
    });
    const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
    const forumDiscussions = await prisma_1.prisma.discussion.findMany({
        where: {
            lessonId: { in: forumIds },
            authorId: { in: studentIds },
            score: { not: null }
        }
    });
    // 4. Map the data
    const studentsWithGrades = enrollments.map(e => {
        const grades = {};
        // Initialize all to null
        gradedItems.forEach(item => grades[item.id] = null);
        // Map Assignments
        const studentSubmissions = submissions.filter(s => s.studentId === e.student.id);
        studentSubmissions.forEach(sub => {
            if (sub.grade !== null && sub.grade !== undefined) {
                grades[sub.assignmentId] = sub.grade;
            }
        });
        // Map Quizzes (Take the highest score if multiple attempts)
        const studentQuizAttempts = quizAttempts.filter(q => q.studentId === e.student.id);
        studentQuizAttempts.forEach(qa => {
            if (grades[qa.quizId] === null || qa.score > grades[qa.quizId]) {
                grades[qa.quizId] = qa.score;
            }
        });
        // Map Forums (Take the highest score if multiple posts)
        const studentForums = forumDiscussions.filter(f => f.authorId === e.student.id && f.lessonId);
        studentForums.forEach(sf => {
            if (sf.lessonId && (grades[sf.lessonId] === null || sf.score > grades[sf.lessonId])) {
                grades[sf.lessonId] = sf.score;
            }
        });
        // Calculate Course Grade (Total Points of Graded Items)
        let totalEarned = 0;
        let totalMaxGraded = 0;
        gradedItems.forEach(item => {
            const score = grades[item.id];
            if (score !== null && score !== undefined) {
                totalEarned += score;
                totalMaxGraded += item.maxScore;
            }
        });
        // Return exact percentage rounded to 1 decimal place (e.g. 99.5)
        const courseGrade = totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;
        return {
            id: e.student.id,
            name: e.student.name,
            email: e.student.email,
            avatar: e.student.avatar,
            grades,
            courseGrade
        };
    });
    res.json({
        status: "success",
        data: {
            items: gradedItems,
            students: studentsWithGrades
        }
    });
});
// ─── INSTRUCTOR INVITATIONS ──────────────────────────────────────────────────
exports.getInvitations = (0, errors_1.asyncHandler)(async (req, res) => {
    const { status } = req.query;
    const where = { instructorId: req.user.id };
    if (status)
        where.status = status;
    const invitations = await prisma_1.prisma.courseInvitation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            course: {
                select: {
                    id: true, title: true, slug: true, description: true, thumbnail: true,
                    weeksDuration: true, status: true, invitationStatus: true, price: true,
                    program: { select: { id: true, title: true } },
                },
            },
        },
    });
    res.json({ status: "success", data: invitations });
});
exports.acceptInvitation = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const invitation = await prisma_1.prisma.courseInvitation.findUnique({
        where: { id },
        include: { course: true },
    });
    if (!invitation)
        throw new errors_1.AppError("Invitation not found", 404);
    if (invitation.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    if (invitation.status !== "PENDING")
        throw new errors_1.AppError("Invitation is no longer pending", 400);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.courseInvitation.update({ where: { id }, data: { status: "ACCEPTED" } }),
        prisma_1.prisma.course.update({
            where: { id: invitation.courseId },
            data: { invitationStatus: "ACCEPTED", instructorId: req.user.id },
        }),
    ]);
    res.json({ status: "success", message: "Invitation accepted. The course is now in your dashboard." });
});
exports.declineInvitation = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const invitation = await prisma_1.prisma.courseInvitation.findUnique({ where: { id } });
    if (!invitation)
        throw new errors_1.AppError("Invitation not found", 404);
    if (invitation.instructorId !== req.user.id)
        throw new errors_1.AppError("Not authorized", 403);
    if (invitation.status !== "PENDING")
        throw new errors_1.AppError("Invitation is no longer pending", 400);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.courseInvitation.update({ where: { id }, data: { status: "DECLINED" } }),
        prisma_1.prisma.course.update({
            where: { id: invitation.courseId },
            data: { invitationStatus: "DECLINED" },
        }),
    ]);
    res.json({ status: "success", message: "Invitation declined." });
});
