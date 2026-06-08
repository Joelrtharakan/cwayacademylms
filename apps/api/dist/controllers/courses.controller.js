"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.uploadAvatar = exports.sendMessage = exports.getMessageThread = exports.getConversations = exports.getPayoutHistory = exports.requestPayout = exports.getInstructorRevenue = exports.getCourseAnalytics = exports.getInstructorStats = exports.getMyCourses = exports.deleteForumReply = exports.createForumReply = exports.deleteForumPost = exports.pinForumPost = exports.createForumPost = exports.getForumPosts = exports.getQuizStats = exports.getQuizAttempts = exports.gradeSubmission = exports.getAssignmentSubmissions = exports.getInstructorAssignments = exports.updateAssignment = exports.createAssignment = exports.reorderQuestions = exports.deleteQuestion = exports.updateQuestion = exports.addQuestion = exports.updateQuiz = exports.createQuiz = exports.uploadLessonAttachment = exports.getLessonVideoStatus = exports.uploadLessonVideo = exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.reorderSections = exports.deleteSection = exports.updateSection = exports.createSection = exports.uploadPromoVideo = exports.uploadThumbnail = exports.duplicateCourse = exports.submitForReview = exports.deleteCourseInstructor = exports.updateCourse = exports.getCourse = exports.createCourse = exports.listCourses = void 0;
exports.deleteAnnouncement = exports.createAnnouncement = exports.getInstructorAnnouncements = exports.getCourseAnnouncements = exports.getPublicCategories = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_service_1 = require("../services/storage.service");
const video_service_1 = require("../services/video.service");
const notification_service_1 = require("../services/notification.service");
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
// ─── PUBLIC: LIST COURSES ───────────────────────────────────────────────────
exports.listCourses = (0, errors_1.asyncHandler)(async (req, res) => {
    const { search, category, level, language, isFree, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    // Public users only see published
    if (!req.user || req.user.role === "STUDENT") {
        where.status = "PUBLISHED";
    }
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
    // Instructor can only see own courses
    if (req.user?.role === "INSTRUCTOR")
        where.instructorId = req.user.id;
    const orderBy = sortBy === "popular" ? { enrollments: { _count: "desc" } } :
        sortBy === "rating" ? { createdAt: "desc" } :
            sortBy === "moduleOrder" ? { moduleNumber: "asc" } :
                { createdAt: "desc" };
    const [courses, total] = await Promise.all([
        prisma_1.prisma.course.findMany({
            where, skip, take: Number(limit), orderBy,
            include: {
                instructor: { select: { id: true, name: true, avatar: true } },
                category: { select: { name: true } },
                _count: { select: { enrollments: true } },
                reviews: { select: { rating: true } },
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
    res.json({ status: "success", data: { courses: enriched, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
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
    res.status(201).json({ status: "success", data: course });
});
// ─── GET COURSE ─────────────────────────────────────────────────────────────
exports.getCourse = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const course = await prisma_1.prisma.course.findFirst({
        where: { OR: [{ id }, { slug: id }] },
        include: {
            instructor: { select: { id: true, name: true, avatar: true, bio: true, church: true } },
            category: { select: { id: true, name: true, slug: true } },
            sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
            reviews: { select: { rating: true } },
            announcements: { orderBy: { createdAt: "desc" } },
            _count: { select: { enrollments: true } },
            curriculum: true,
        },
    });
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
        isEnrolled = !!enrollment;
    }
    const isInstructor = req.user?.id === course.instructorId || req.user?.role === "ADMIN";
    const ratings = course.reviews.map((r) => r.rating);
    // Strip private content for non-enrolled students
    const sections = course.sections.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => ({
            ...l,
            content: (isInstructor || isEnrolled || l.isFree || l.isPreview) ? l.content : undefined,
            videoUrl: (isInstructor || isEnrolled || l.isFree || l.isPreview) ? l.videoUrl : undefined,
        })),
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
    const { title, subtitle, description, categoryId, level, language, moduleNumber, weeksDuration, totalLectures, scriptureRef, isFree, price, currency, requirements, outcomes, targetAudience, welcomeMessage, congratsMessage, tags, status } = req.body;
    const data = {};
    if (title !== undefined) {
        data.title = title;
        data.slug = await uniqueSlug(title);
    }
    if (subtitle !== undefined)
        data.subtitle = subtitle;
    if (description !== undefined)
        data.description = description;
    if (categoryId !== undefined)
        data.categoryId = categoryId;
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
    res.status(201).json({ status: "success", data: { newCourseId: newCourse.id } });
});
// ─── THUMBNAIL UPLOAD ────────────────────────────────────────────────────────
exports.uploadThumbnail = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const ext = req.file.mimetype.split("/")[1];
    const key = storage_service_1.StorageService.generateUploadKey("thumbnails", `${id}-${Date.now()}.${ext}`);
    const { url } = await storage_service_1.StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
    await prisma_1.prisma.course.update({ where: { id }, data: { thumbnail: url } });
    res.json({ status: "success", data: { thumbnailUrl: url } });
});
// ─── PROMO VIDEO UPLOAD ──────────────────────────────────────────────────────
exports.uploadPromoVideo = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const course = await prisma_1.prisma.course.findUnique({ where: { id } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    const { videoId, uploadUrl } = await video_service_1.VideoService.createBunnyVideo(course.title);
    await video_service_1.VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
    const streamUrl = video_service_1.VideoService.getBunnyStreamUrl(videoId);
    await prisma_1.prisma.course.update({ where: { id }, data: { promoVideoUrl: streamUrl } });
    res.json({ status: "success", data: { videoUrl: streamUrl, videoId } });
});
// ─── SECTIONS ────────────────────────────────────────────────────────────────
exports.createSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, order } = req.body;
    if (!title)
        throw new errors_1.AppError("Title required", 400);
    let sectionOrder = Number(order);
    if (!order) {
        const last = await prisma_1.prisma.section.findFirst({ where: { courseId: id }, orderBy: { order: "desc" } });
        sectionOrder = last ? last.order + 1 : 0;
    }
    const section = await prisma_1.prisma.section.create({ data: { courseId: id, title, order: sectionOrder } });
    res.status(201).json({ status: "success", data: section });
});
exports.updateSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    const { title, order } = req.body;
    const section = await prisma_1.prisma.section.update({ where: { id: sectionId }, data: { ...(title && { title }), ...(order !== undefined && { order: Number(order) }) } });
    res.json({ status: "success", data: section });
});
exports.deleteSection = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    await prisma_1.prisma.section.delete({ where: { id: sectionId } });
    res.json({ status: "success", message: "Section deleted" });
});
exports.reorderSections = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    await prisma_1.prisma.$transaction(orderedIds.map((sid, idx) => prisma_1.prisma.section.update({ where: { id: sid }, data: { order: idx } })));
    res.json({ status: "success", message: "Sections reordered" });
});
// ─── LESSONS ─────────────────────────────────────────────────────────────────
exports.createLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { sectionId } = req.params;
    const { title, type = "VIDEO", content, videoUrl, duration, order, isFree = false, isPreview = false } = req.body;
    if (!title)
        throw new errors_1.AppError("Title required", 400);
    let lessonOrder = Number(order);
    if (!order) {
        const last = await prisma_1.prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
        lessonOrder = last ? last.order + 1 : 0;
    }
    const lesson = await prisma_1.prisma.lesson.create({ data: { sectionId, title, type, content, videoUrl, duration: duration ? Number(duration) : 0, order: lessonOrder, isFree: Boolean(isFree), isPreview: Boolean(isPreview) } });
    res.status(201).json({ status: "success", data: lesson });
});
exports.updateLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
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
    res.json({ status: "success", data: lesson });
});
exports.deleteLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    await prisma_1.prisma.lesson.delete({ where: { id: lessonId } });
    res.json({ status: "success", message: "Lesson deleted" });
});
exports.reorderLessons = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    await prisma_1.prisma.$transaction(orderedIds.map((lid, idx) => prisma_1.prisma.lesson.update({ where: { id: lid }, data: { order: idx } })));
    res.json({ status: "success", message: "Lessons reordered" });
});
exports.uploadLessonVideo = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    const { videoId, uploadUrl } = await video_service_1.VideoService.createBunnyVideo(lesson.title);
    await video_service_1.VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
    const streamUrl = video_service_1.VideoService.getBunnyStreamUrl(videoId);
    await prisma_1.prisma.lesson.update({ where: { id: lessonId }, data: { videoUrl: streamUrl, bunnyVideoId: videoId } });
    res.json({ status: "success", data: { videoId, streamUrl, status: "processing" } });
});
exports.getLessonVideoStatus = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
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
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const key = storage_service_1.StorageService.generateUploadKey("attachments", req.file.originalname);
    const { url } = await storage_service_1.StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
    // Update assignment attachmentUrl
    await prisma_1.prisma.assignment.updateMany({ where: { lessonId }, data: { attachmentUrl: url } });
    res.json({ status: "success", data: { attachmentUrl: url } });
});
// ─── QUIZ ─────────────────────────────────────────────────────────────────────
exports.createQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const { title, passingScore = 70, timeLimit, maxAttempts = 3 } = req.body;
    const quiz = await prisma_1.prisma.quiz.create({ data: { lessonId, title, passingScore: Number(passingScore), timeLimit: timeLimit ? Number(timeLimit) : null, maxAttempts: Number(maxAttempts) } });
    res.status(201).json({ status: "success", data: { ...quiz, questions: [] } });
});
exports.updateQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
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
    res.json({ status: "success", data: quiz });
});
exports.addQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
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
    res.status(201).json({ status: "success", data: question });
});
exports.updateQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
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
    res.json({ status: "success", data: question });
});
exports.deleteQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
    await prisma_1.prisma.question.delete({ where: { id: questionId } });
    res.json({ status: "success", message: "Question deleted" });
});
exports.reorderQuestions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { orderedIds } = req.body;
    await prisma_1.prisma.$transaction(orderedIds.map((qid, idx) => prisma_1.prisma.question.update({ where: { id: qid }, data: { order: idx } })));
    res.json({ status: "success", message: "Questions reordered" });
});
// ─── ASSIGNMENT ───────────────────────────────────────────────────────────────
exports.createAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const { title, description, dueDate, maxScore = 100 } = req.body;
    const assignment = await prisma_1.prisma.assignment.create({ data: { lessonId, title, description, dueDate: dueDate ? new Date(dueDate) : null, maxScore: Number(maxScore) } });
    res.status(201).json({ status: "success", data: assignment });
});
exports.updateAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
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
    const submissions = await prisma_1.prisma.submission.findMany({ where, include: { student: { select: { name: true, avatar: true, church: true } } } });
    res.json({ status: "success", data: submissions });
});
exports.gradeSubmission = (0, errors_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const submission = await prisma_1.prisma.submission.findUnique({ where: { id: submissionId }, include: { assignment: true } });
    if (!submission)
        throw new errors_1.AppError("Submission not found", 404);
    if (grade < 0 || grade > submission.assignment.maxScore)
        throw new errors_1.AppError(`Grade must be 0–${submission.assignment.maxScore}`, 400);
    const updated = await prisma_1.prisma.submission.update({
        where: { id: submissionId },
        data: { grade: Number(grade), feedback, isGraded: true, gradedAt: new Date() },
    });
    await notification_service_1.NotificationService.createNotification(submission.studentId, "ASSIGNMENT_GRADED", "Your assignment has been graded", `You scored ${grade}/${submission.assignment.maxScore} on '${submission.assignment.title}'`, "/student/assignments");
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
    const { title, content } = req.body;
    const forum = await prisma_1.prisma.forum.findUnique({ where: { courseId: id } });
    if (!forum)
        throw new errors_1.AppError("Forum not found", 404);
    const post = await prisma_1.prisma.forumPost.create({ data: { forumId: forum.id, authorId: req.user.id, title, content }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
    res.status(201).json({ status: "success", data: post });
});
exports.pinForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    const post = await prisma_1.prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    const updated = await prisma_1.prisma.forumPost.update({ where: { id: postId }, data: { isPinned: !post.isPinned } });
    res.json({ status: "success", data: updated });
});
exports.deleteForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
    await prisma_1.prisma.forumPost.delete({ where: { id: postId } });
    res.json({ status: "success", message: "Post deleted" });
});
exports.createForumReply = (0, errors_1.asyncHandler)(async (req, res) => {
    const { postId } = req.params;
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
    await prisma_1.prisma.forumReply.delete({ where: { id: replyId } });
    res.json({ status: "success", message: "Reply deleted" });
});
// ─── INSTRUCTOR STATS ────────────────────────────────────────────────────────
exports.getMyCourses = (0, errors_1.asyncHandler)(async (req, res) => {
    const courses = await prisma_1.prisma.course.findMany({
        where: { instructorId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            instructor: { select: { id: true, name: true, avatar: true } },
            category: { select: { name: true } },
            _count: { select: { enrollments: true } },
            reviews: { select: { rating: true } },
        },
    });
    const enriched = courses.map((c) => {
        const ratings = c.reviews.map((r) => r.rating);
        return {
            ...c,
            avgRating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
            reviewCount: ratings.length,
            reviews: undefined,
        };
    });
    res.json({ status: "success", data: { courses: enriched, total: courses.length, page: 1, pages: 1 } });
});
exports.getInstructorStats = (0, errors_1.asyncHandler)(async (req, res) => {
    const instructorId = req.user.id;
    const courses = await prisma_1.prisma.course.findMany({ where: { instructorId }, select: { id: true, status: true } });
    const courseIds = courses.map((c) => c.id);
    const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
    const [enrollments, payments, reviews, completions, pendingSubmissions] = await Promise.all([
        prisma_1.prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
        prisma_1.prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED" }, select: { amount: true } }),
        prisma_1.prisma.review.findMany({ where: { courseId: { in: courseIds } }, select: { rating: true } }),
        prisma_1.prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: "COMPLETED" } }),
        prisma_1.prisma.submission.count({ where: { assignment: { lesson: { section: { courseId: { in: courseIds } } } }, isGraded: false } }),
    ]);
    const instructor = await prisma_1.prisma.user.findUnique({ where: { id: instructorId }, select: { payoutPercentage: true } });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount * ((instructor?.payoutPercentage || 70) / 100), 0);
    const ratings = reviews.map((r) => r.rating);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPayments = await prisma_1.prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED", createdAt: { gte: monthStart } }, select: { amount: true } });
    const revenueThisMonth = monthPayments.reduce((sum, p) => sum + p.amount * ((instructor?.payoutPercentage || 70) / 100), 0);
    res.json({ status: "success", data: { totalStudents: enrollments, totalRevenue, revenueThisMonth, avgRating, totalCompletions: completions, pendingSubmissions, publishedCourses } });
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
// ─── REVENUE ─────────────────────────────────────────────────────────────────
exports.getInstructorRevenue = (0, errors_1.asyncHandler)(async (req, res) => {
    const instructorId = req.user.id;
    const user = await prisma_1.prisma.user.findUnique({ where: { id: instructorId }, select: { payoutPercentage: true } });
    const pct = (user?.payoutPercentage || 70) / 100;
    const courses = await prisma_1.prisma.course.findMany({ where: { instructorId }, select: { id: true } });
    const courseIds = courses.map((c) => c.id);
    const payments = await prisma_1.prisma.payment.findMany({
        where: { courseId: { in: courseIds }, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        include: { student: { select: { name: true } }, course: { select: { title: true } } },
    });
    const payouts = await prisma_1.prisma.payoutRequest.findMany({ where: { instructorId } });
    const paidOut = payouts.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0);
    const totalEarned = payments.reduce((sum, p) => sum + p.amount * pct, 0);
    const pendingPayout = totalEarned - paidOut;
    res.json({
        status: "success", data: {
            totalEarned, pendingPayout, paidOut, platformFeeRate: 100 - (user?.payoutPercentage || 70),
            transactions: payments.map((p) => ({ id: p.id, amount: p.amount, currency: p.currency, createdAt: p.createdAt, instructorEarnings: p.amount * pct, platformFee: p.amount * (1 - pct), student: p.student, course: p.course })),
        },
    });
});
exports.requestPayout = (0, errors_1.asyncHandler)(async (req, res) => {
    const { amount, bankDetails, note } = req.body;
    if (!amount || Number(amount) <= 0)
        throw new errors_1.AppError("Invalid amount", 400);
    const payout = await prisma_1.prisma.payoutRequest.create({ data: { instructorId: req.user.id, amount: Number(amount), bankDetails, note } });
    const admins = await prisma_1.prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await Promise.all(admins.map((a) => notification_service_1.NotificationService.createNotification(a.id, "PAYOUT_REQUEST", "New payout request", `An instructor has requested a payout of ₹${amount}`, "/admin/payouts")));
    res.status(201).json({ status: "success", data: payout });
});
exports.getPayoutHistory = (0, errors_1.asyncHandler)(async (req, res) => {
    const payouts = await prisma_1.prisma.payoutRequest.findMany({ where: { instructorId: req.user.id }, orderBy: { requestedAt: "desc" } });
    res.json({ status: "success", data: payouts });
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
    await notification_service_1.NotificationService.createNotification(receiverId, "NEW_MESSAGE", `New message from ${sender?.name}`, content.slice(0, 80), `/messages/${req.user.id}`);
    res.status(201).json({ status: "success", data: message });
});
// ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────
exports.uploadAvatar = (0, errors_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const key = storage_service_1.StorageService.generateUploadKey("avatars", `${req.user.id}.${req.file.mimetype.split("/")[1]}`);
    const { url } = await storage_service_1.StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
    await prisma_1.prisma.user.update({ where: { id: req.user.id }, data: { avatar: url } });
    res.json({ status: "success", data: { avatarUrl: url } });
});
// ─── USER PROFILE UPDATE ──────────────────────────────────────────────────────
exports.updateMyProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const { name, bio, church, location, phone, socialLinks, title, credentials, yearsExperience, expertise, notificationPrefs } = req.body;
    const data = {};
    if (name)
        data.name = name;
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
