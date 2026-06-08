"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeSubmission = exports.getAssignmentSubmissions = exports.uploadAssignmentAttachment = exports.deleteAssignment = exports.updateAssignment = exports.getAssignments = exports.createAssignment = exports.reorderQuestions = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.deleteQuiz = exports.updateQuiz = exports.getQuizzes = exports.createQuiz = exports.reorderReadingMaterials = exports.deleteReadingMaterial = exports.updateReadingMaterial = exports.getReadingMaterials = exports.createReadingMaterial = exports.getLessonVideoStatus = exports.uploadVideoToLesson = exports.updateCurriculum = exports.getCurriculum = exports.createRubric = exports.getCourseRubrics = exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.reorderModules = exports.deleteModule = exports.updateModule = exports.getModules = exports.createModule = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_service_1 = require("../services/storage.service");
const video_service_1 = require("../services/video.service");
// ─── MODULES (SECTIONS) ──────────────────────────────────────────────────────
exports.createModule = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const { title, description, objectives, weekNumber, order } = req.body;
    // Verify course ownership
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role !== "ADMIN" && course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Determine order if not provided
    let nextOrder = order;
    if (nextOrder === undefined) {
        const lastSection = await prisma_1.prisma.section.findFirst({
            where: { courseId },
            orderBy: { order: "desc" },
        });
        nextOrder = lastSection ? lastSection.order + 1 : 0;
    }
    const section = await prisma_1.prisma.section.create({
        data: {
            courseId,
            title,
            description,
            objectives: objectives ? JSON.stringify(objectives) : "[]",
            weekNumber: weekNumber ? Number(weekNumber) : null,
            order: nextOrder,
        },
    });
    res.status(201).json({ status: "success", data: section });
});
exports.getModules = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const sections = await prisma_1.prisma.section.findMany({
        where: { courseId },
        orderBy: { order: "asc" },
        include: {
            lessons: {
                orderBy: { order: "asc" },
                include: {
                    quiz: { select: { id: true } },
                    assignment: { select: { id: true } }
                }
            },
            _count: {
                select: { lessons: true, readingMaterials: true },
            },
        },
    });
    res.json({ status: "success", data: sections });
});
exports.updateModule = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, description, objectives, weekNumber, isPublished, order } = req.body;
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const updated = await prisma_1.prisma.section.update({
        where: { id: moduleId },
        data: {
            title,
            description,
            objectives: objectives ? JSON.stringify(objectives) : undefined,
            weekNumber: weekNumber ? Number(weekNumber) : undefined,
            isPublished,
            order,
        },
    });
    res.json({ status: "success", data: updated });
});
exports.deleteModule = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.section.delete({ where: { id: moduleId } });
    res.json({ status: "success", message: "Module deleted successfully" });
});
exports.reorderModules = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const { orderedIds } = req.body; // array of module IDs in new order
    if (!Array.isArray(orderedIds))
        throw new errors_1.AppError("orderedIds must be an array", 400);
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role !== "ADMIN" && course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Update in a transaction
    await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.section.update({
        where: { id },
        data: { order: index },
    })));
    res.json({ status: "success", message: "Modules reordered successfully" });
});
// ─── LESSONS ─────────────────────────────────────────────────────────────────
exports.createLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, type, content, videoUrl, duration, order, isFree, isPreview } = req.body;
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    let nextOrder = order;
    if (nextOrder === undefined) {
        const lastLesson = await prisma_1.prisma.lesson.findFirst({
            where: { sectionId: moduleId },
            orderBy: { order: "desc" },
        });
        nextOrder = lastLesson ? lastLesson.order + 1 : 0;
    }
    const lesson = await prisma_1.prisma.lesson.create({
        data: {
            sectionId: moduleId,
            title,
            type,
            content,
            videoUrl,
            duration: duration ? Number(duration) : 0,
            order: nextOrder,
            isFree: isFree ?? false,
            isPreview: isPreview ?? false,
        },
    });
    res.status(201).json({ status: "success", data: lesson });
});
exports.updateLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const { title, type, content, videoUrl, duration, order, isFree, isPreview } = req.body;
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } },
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    if (req.user.role !== "ADMIN" && lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const updated = await prisma_1.prisma.lesson.update({
        where: { id: lessonId },
        data: { title, type, content, videoUrl, duration, order, isFree, isPreview },
    });
    res.json({ status: "success", data: updated });
});
exports.deleteLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } },
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    if (req.user.role !== "ADMIN" && lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.lesson.delete({ where: { id: lessonId } });
    res.json({ status: "success", message: "Lesson deleted successfully" });
});
exports.reorderLessons = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
        throw new errors_1.AppError("orderedIds must be an array", 400);
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.lesson.update({
        where: { id },
        data: { order: index },
    })));
    res.json({ status: "success", message: "Lessons reordered successfully" });
});
// ─── RUBRICS ──────────────────────────────────────────────────────────────────
exports.getCourseRubrics = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const rubrics = await prisma_1.prisma.rubric.findMany({
        where: { courseId },
        include: {
            criteria: {
                include: { levels: { orderBy: { order: "asc" } } },
                orderBy: { order: "asc" },
            },
            _count: { select: { assignments: true, quizzes: true } }
        },
        orderBy: { createdAt: "desc" },
    });
    res.json({ status: "success", data: rubrics });
});
exports.createRubric = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const { title, description, totalPoints, criteria } = req.body;
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role !== "ADMIN" && course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const rubric = await prisma_1.prisma.rubric.create({
        data: {
            courseId,
            title,
            description,
            totalPoints,
            criteria: {
                create: criteria?.map((c, cIdx) => ({
                    title: c.title,
                    description: c.description,
                    maxPoints: c.maxPoints,
                    order: c.order ?? cIdx,
                    levels: {
                        create: c.levels?.map((l, lIdx) => ({
                            label: l.label,
                            description: l.description,
                            points: l.points,
                            order: l.order ?? lIdx,
                        })) || []
                    }
                })) || []
            }
        },
        include: {
            criteria: { include: { levels: true } }
        }
    });
    res.status(201).json({ status: "success", data: rubric });
});
// ─── CURRICULUM ─────────────────────────────────────────────────────────────
exports.getCurriculum = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    let curriculum = await prisma_1.prisma.curriculum.findUnique({
        where: { courseId },
    });
    if (!curriculum) {
        // Return empty structure if none exists
        return res.json({ status: "success", data: null });
    }
    res.json({ status: "success", data: curriculum });
});
exports.updateCurriculum = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id: courseId } = req.params;
    const { overview, objectives, weeklyPlan, assessmentPlan } = req.body;
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (req.user.role !== "ADMIN" && course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const curriculum = await prisma_1.prisma.curriculum.upsert({
        where: { courseId },
        create: {
            courseId,
            overview,
            objectives: objectives ? JSON.stringify(objectives) : "[]",
            weeklyPlan: weeklyPlan ? JSON.stringify(weeklyPlan) : "[]",
            assessmentPlan: assessmentPlan ? JSON.stringify(assessmentPlan) : null,
        },
        update: {
            overview,
            objectives: objectives ? JSON.stringify(objectives) : undefined,
            weeklyPlan: weeklyPlan ? JSON.stringify(weeklyPlan) : undefined,
            assessmentPlan: assessmentPlan ? JSON.stringify(assessmentPlan) : undefined,
        },
    });
    res.json({ status: "success", data: curriculum });
});
// ─── VIDEO UPLOAD ─────────────────────────────────────────────────────────────
exports.uploadVideoToLesson = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const file = req.file;
    if (!file)
        throw new errors_1.AppError("Video file is required", 400);
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } },
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    if (req.user.role !== "ADMIN" && lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const { videoId, uploadUrl } = await video_service_1.VideoService.createBunnyVideo(lesson.title);
    // Note: For real large files, we should stream directly to Bunny or use client-side upload.
    // This is a buffer upload (suitable for small files or chunked via multer)
    await video_service_1.VideoService.uploadVideoToBunny(uploadUrl, file.buffer);
    const streamUrl = video_service_1.VideoService.getBunnyStreamUrl(videoId);
    const updated = await prisma_1.prisma.lesson.update({
        where: { id: lessonId },
        data: {
            bunnyVideoId: videoId,
            videoUrl: streamUrl,
        },
    });
    res.json({
        status: "success",
        data: {
            videoId,
            streamUrl,
            status: "processing",
            lesson: updated
        }
    });
});
exports.getLessonVideoStatus = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } },
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    // We can let instructors or enrolled students view this status, but for now just check instructor/admin
    // Or just allow if lesson exists and is free/enrolled. For now, strict auth as requested.
    if (req.user.role !== "ADMIN" && lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    if (!lesson.bunnyVideoId) {
        throw new errors_1.AppError("No video attached to this lesson", 400);
    }
    const status = await video_service_1.VideoService.getBunnyVideoStatus(lesson.bunnyVideoId);
    // If status indicates finished, we could update the duration in DB
    if (status.status === 2 || status.status === "Mock Finished") {
        await prisma_1.prisma.lesson.update({
            where: { id: lessonId },
            data: { duration: status.duration },
        });
    }
    res.json({ status: "success", data: status });
});
// ─── READING MATERIALS ───────────────────────────────────────────────────────
exports.createReadingMaterial = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, description } = req.body;
    const file = req.file;
    if (!file)
        throw new errors_1.AppError("File is required", 400);
    if (!title)
        throw new errors_1.AppError("Title is required", 400);
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Upload to R2
    const ext = file.originalname.split('.').pop() || '';
    const fileKey = storage_service_1.StorageService.generateUploadKey(`reading-materials/${moduleId}`, file.originalname);
    const { url } = await storage_service_1.StorageService.uploadFile(file.buffer, fileKey, file.mimetype);
    const lastMat = await prisma_1.prisma.readingMaterial.findFirst({
        where: { sectionId: moduleId },
        orderBy: { order: 'desc' }
    });
    const order = lastMat ? lastMat.order + 1 : 0;
    const readingMaterial = await prisma_1.prisma.readingMaterial.create({
        data: {
            sectionId: moduleId,
            title,
            description,
            fileUrl: url,
            fileKey,
            fileType: ext.toLowerCase(),
            fileSize: file.size,
            order
        }
    });
    res.status(201).json({ status: "success", data: readingMaterial });
});
exports.getReadingMaterials = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const materials = await prisma_1.prisma.readingMaterial.findMany({
        where: { sectionId: moduleId },
        orderBy: { order: "asc" },
    });
    res.json({ status: "success", data: materials });
});
exports.updateReadingMaterial = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, description, order } = req.body;
    const material = await prisma_1.prisma.readingMaterial.findUnique({
        where: { id },
        include: { section: { include: { course: true } } },
    });
    if (!material)
        throw new errors_1.AppError("Reading material not found", 404);
    if (req.user.role !== "ADMIN" && material.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const updated = await prisma_1.prisma.readingMaterial.update({
        where: { id },
        data: { title, description, order },
    });
    res.json({ status: "success", data: updated });
});
exports.deleteReadingMaterial = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const material = await prisma_1.prisma.readingMaterial.findUnique({
        where: { id },
        include: { section: { include: { course: true } } },
    });
    if (!material)
        throw new errors_1.AppError("Reading material not found", 404);
    if (req.user.role !== "ADMIN" && material.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Delete from R2
    await storage_service_1.StorageService.deleteFile(material.fileKey);
    // Delete from DB
    await prisma_1.prisma.readingMaterial.delete({ where: { id } });
    res.json({ status: "success", message: "Reading material deleted successfully" });
});
exports.reorderReadingMaterials = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
        throw new errors_1.AppError("orderedIds must be an array", 400);
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.readingMaterial.update({
        where: { id },
        data: { order: index },
    })));
    res.json({ status: "success", message: "Reading materials reordered successfully" });
});
// ─── QUIZZES ─────────────────────────────────────────────────────────────────
exports.createQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, instructions, passingScore, timeLimit, maxAttempts } = req.body;
    if (!title)
        throw new errors_1.AppError("Title is required", 400);
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const lastLesson = await prisma_1.prisma.lesson.findFirst({
        where: { sectionId: moduleId },
        orderBy: { order: 'desc' }
    });
    const order = lastLesson ? lastLesson.order + 1 : 0;
    // Run in transaction: Create Lesson + Quiz
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const lesson = await tx.lesson.create({
            data: {
                sectionId: moduleId,
                title,
                type: "QUIZ",
                content: instructions,
                order,
            }
        });
        const quiz = await tx.quiz.create({
            data: {
                lessonId: lesson.id,
                title,
                passingScore: passingScore ?? 70,
                timeLimit: timeLimit ? timeLimit * 60 : null, // Convert mins to secs
                maxAttempts: maxAttempts ?? 3,
            }
        });
        return { lesson, quiz };
    });
    res.status(201).json({ status: "success", data: result });
});
exports.getQuizzes = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const lessonsWithQuizzes = await prisma_1.prisma.lesson.findMany({
        where: { sectionId: moduleId, type: "QUIZ" },
        orderBy: { order: "asc" },
        include: {
            quiz: {
                include: {
                    questions: {
                        include: { answers: true },
                        orderBy: { order: "asc" }
                    },
                    _count: { select: { questions: true, attempts: true } }
                }
            }
        }
    });
    res.json({ status: "success", data: lessonsWithQuizzes });
});
exports.updateQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const { title, instructions, passingScore, timeLimit, maxAttempts } = req.body;
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    if (req.user.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const updatedQuiz = await prisma_1.prisma.quiz.update({
        where: { id: quizId },
        data: { title, passingScore, timeLimit, maxAttempts },
    });
    if (title || instructions !== undefined) {
        await prisma_1.prisma.lesson.update({
            where: { id: quiz.lessonId },
            data: {
                title: title || undefined,
                content: instructions !== undefined ? instructions : undefined,
            }
        });
    }
    res.json({ status: "success", data: updatedQuiz });
});
exports.deleteQuiz = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    if (req.user.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Deleting the lesson cascades to quiz, questions, answers, etc.
    await prisma_1.prisma.lesson.delete({ where: { id: quiz.lessonId } });
    res.json({ status: "success", message: "Quiz deleted successfully" });
});
exports.createQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const { text, type, points, order, scriptureRef, answers } = req.body;
    if (!text)
        throw new errors_1.AppError("Question text is required", 400);
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    if (req.user.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    let nextOrder = order;
    if (nextOrder === undefined) {
        const lastQ = await prisma_1.prisma.question.findFirst({
            where: { quizId },
            orderBy: { order: 'desc' }
        });
        nextOrder = lastQ ? lastQ.order + 1 : 0;
    }
    try {
        const question = await prisma_1.prisma.question.create({
            data: {
                quizId,
                text,
                type: type || "MCQ",
                points: points !== undefined ? Number(points) : 1,
                order: nextOrder !== undefined ? Number(nextOrder) : 0,
                scriptureRef,
                answers: answers && answers.length > 0 ? {
                    create: answers.map((a) => ({
                        text: a.text,
                        isCorrect: Boolean(a.isCorrect)
                    }))
                } : undefined
            },
            include: { answers: true }
        });
        res.status(201).json({ status: "success", data: question });
    }
    catch (error) {
        console.error("PRISMA CREATE QUESTION ERROR:", error);
        res.status(500).json({ status: "error", message: error.message || "Failed to create question in database", error });
    }
});
// Updates question and overwrites answers completely if provided
exports.updateQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
    const { text, type, points, scriptureRef, answers } = req.body;
    const question = await prisma_1.prisma.question.findUnique({
        where: { id: questionId },
        include: { quiz: { include: { lesson: { include: { section: { include: { course: true } } } } } } },
    });
    if (!question)
        throw new errors_1.AppError("Question not found", 404);
    if (req.user.role !== "ADMIN" && question.quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // If answers are provided, delete old and create new
    const updateData = { text, type, points, scriptureRef };
    if (answers) {
        updateData.answers = {
            deleteMany: {},
            create: answers.map((a) => ({
                text: a.text,
                isCorrect: a.isCorrect
            }))
        };
    }
    const updated = await prisma_1.prisma.question.update({
        where: { id: questionId },
        data: updateData,
        include: { answers: true }
    });
    res.json({ status: "success", data: updated });
});
exports.deleteQuestion = (0, errors_1.asyncHandler)(async (req, res) => {
    const { questionId } = req.params;
    const question = await prisma_1.prisma.question.findUnique({
        where: { id: questionId },
        include: { quiz: { include: { lesson: { include: { section: { include: { course: true } } } } } } },
    });
    if (!question)
        throw new errors_1.AppError("Question not found", 404);
    if (req.user.role !== "ADMIN" && question.quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.question.delete({ where: { id: questionId } });
    res.json({ status: "success", message: "Question deleted successfully" });
});
exports.reorderQuestions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { quizId } = req.params;
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
        throw new errors_1.AppError("orderedIds must be an array", 400);
    const quiz = await prisma_1.prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    if (req.user.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    await prisma_1.prisma.$transaction(orderedIds.map((id, index) => prisma_1.prisma.question.update({
        where: { id },
        data: { order: index },
    })));
    res.json({ status: "success", message: "Questions reordered successfully" });
});
// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────
exports.createAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;
    if (!title || !description)
        throw new errors_1.AppError("Title and description required", 400);
    const section = await prisma_1.prisma.section.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });
    if (!section)
        throw new errors_1.AppError("Module not found", 404);
    if (req.user.role !== "ADMIN" && section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const lastLesson = await prisma_1.prisma.lesson.findFirst({
        where: { sectionId: moduleId },
        orderBy: { order: 'desc' }
    });
    const order = lastLesson ? lastLesson.order + 1 : 0;
    const result = await prisma_1.prisma.$transaction(async (tx) => {
        const lesson = await tx.lesson.create({
            data: {
                sectionId: moduleId,
                title,
                type: "ASSIGNMENT",
                order,
            }
        });
        const assignment = await tx.assignment.create({
            data: {
                lessonId: lesson.id,
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                maxScore: maxScore ?? 100,
            }
        });
        return { lesson, assignment };
    });
    res.status(201).json({ status: "success", data: result });
});
exports.getAssignments = (0, errors_1.asyncHandler)(async (req, res) => {
    const { moduleId } = req.params;
    const lessonsWithAssignments = await prisma_1.prisma.lesson.findMany({
        where: { sectionId: moduleId, type: "ASSIGNMENT" },
        orderBy: { order: "asc" },
        include: {
            assignment: {
                include: {
                    _count: { select: { submissions: true } }
                }
            }
        }
    });
    res.json({ status: "success", data: lessonsWithAssignments });
});
exports.updateAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (req.user.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const updated = await prisma_1.prisma.assignment.update({
        where: { id: assignmentId },
        data: {
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : null,
            maxScore,
        },
    });
    if (title) {
        await prisma_1.prisma.lesson.update({
            where: { id: assignment.lessonId },
            data: { title }
        });
    }
    res.json({ status: "success", data: updated });
});
exports.deleteAssignment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (req.user.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    // Deleting lesson cascades to assignment and submissions
    await prisma_1.prisma.lesson.delete({ where: { id: assignment.lessonId } });
    res.json({ status: "success", message: "Assignment deleted successfully" });
});
exports.uploadAssignmentAttachment = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const file = req.file;
    if (!file)
        throw new errors_1.AppError("File is required", 400);
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (req.user.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const fileKey = storage_service_1.StorageService.generateUploadKey(`assignments/${assignmentId}`, file.originalname);
    const { url } = await storage_service_1.StorageService.uploadFile(file.buffer, fileKey, file.mimetype);
    const updated = await prisma_1.prisma.assignment.update({
        where: { id: assignmentId },
        data: { attachmentUrl: url }
    });
    res.json({ status: "success", data: updated });
});
exports.getAssignmentSubmissions = (0, errors_1.asyncHandler)(async (req, res) => {
    const { assignmentId } = req.params;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { section: { include: { course: true } } } } },
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (req.user.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const submissions = await prisma_1.prisma.submission.findMany({
        where: { assignmentId },
        include: {
            student: { select: { id: true, name: true, avatar: true, church: true, location: true } }
        },
        orderBy: { submittedAt: 'desc' }
    });
    res.json({ status: "success", data: submissions });
});
exports.gradeSubmission = (0, errors_1.asyncHandler)(async (req, res) => {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const submission = await prisma_1.prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
            assignment: { include: { lesson: { include: { section: { include: { course: true } } } } } },
            student: true
        },
    });
    if (!submission)
        throw new errors_1.AppError("Submission not found", 404);
    if (req.user.role !== "ADMIN" && submission.assignment.lesson.section.course.instructorId !== req.user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    if (grade > submission.assignment.maxScore || grade < 0) {
        throw new errors_1.AppError(`Grade must be between 0 and ${submission.assignment.maxScore}`, 400);
    }
    const updated = await prisma_1.prisma.submission.update({
        where: { id: submissionId },
        data: {
            grade,
            feedback,
            isGraded: true,
            gradedAt: new Date(),
        }
    });
    // Create Notification for student
    await prisma_1.prisma.notification.create({
        data: {
            userId: submission.studentId,
            type: "ASSIGNMENT_GRADED",
            title: "Your assignment has been graded",
            body: `You scored ${grade}/${submission.assignment.maxScore} on '${submission.assignment.title}'`,
            link: `/student/assignments/${submission.assignmentId}`
        }
    });
    res.json({ status: "success", data: updated });
});
