"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCurriculum = exports.getCurriculum = exports.createRubric = exports.getCourseRubrics = exports.reorderLessons = exports.deleteLesson = exports.updateLesson = exports.createLesson = exports.reorderModules = exports.deleteModule = exports.updateModule = exports.getModules = exports.createModule = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
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
            _count: {
                select: { lessons: true },
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
