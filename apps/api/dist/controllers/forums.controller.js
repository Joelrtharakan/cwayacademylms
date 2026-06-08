"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForumReply = exports.createForumPost = exports.getLessonForums = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
exports.getLessonForums = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const discussions = await prisma_1.prisma.discussion.findMany({
        where: { lessonId },
        include: {
            author: { select: { id: true, name: true, role: true } },
            replies: {
                include: {
                    author: { select: { id: true, name: true, role: true } }
                },
                orderBy: { createdAt: "asc" }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: discussions });
});
exports.createForumPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { lessonId } = req.params;
    const { title, content } = req.body;
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { section: { include: { course: true } } }
    });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    const post = await prisma_1.prisma.discussion.create({
        data: {
            lessonId,
            courseId: lesson.section.course.id,
            sectionId: lesson.sectionId,
            authorId: req.user.id,
            title: title || "Discussion",
            content
        },
        include: {
            author: { select: { id: true, name: true, role: true } },
            replies: true
        }
    });
    res.status(201).json({ status: "success", data: post });
});
exports.createForumReply = (0, errors_1.asyncHandler)(async (req, res) => {
    const { discussionId } = req.params;
    const { content } = req.body;
    const discussion = await prisma_1.prisma.discussion.findUnique({
        where: { id: discussionId }
    });
    if (!discussion)
        throw new errors_1.AppError("Discussion not found", 404);
    const isInstructor = req.user.role === "ADMIN" || req.user.role === "INSTRUCTOR"; // simplified
    const reply = await prisma_1.prisma.discussionReply.create({
        data: {
            discussionId,
            authorId: req.user.id,
            content,
            isInstructor
        },
        include: {
            author: { select: { id: true, name: true, role: true } }
        }
    });
    res.status(201).json({ status: "success", data: reply });
});
