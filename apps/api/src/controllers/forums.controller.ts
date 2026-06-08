import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";

export const getLessonForums = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  
  const discussions = await prisma.discussion.findMany({
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

export const createForumPost = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { title, content } = req.body;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } }
  });

  if (!lesson) throw new AppError("Lesson not found", 404);

  const post = await prisma.discussion.create({
    data: {
      lessonId,
      courseId: lesson.section.course.id,
      sectionId: lesson.sectionId,
      authorId: req.user!.id,
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

export const createForumReply = asyncHandler(async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { content } = req.body;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId }
  });

  if (!discussion) throw new AppError("Discussion not found", 404);

  const isInstructor = req.user!.role === "ADMIN" || req.user!.role === "INSTRUCTOR"; // simplified

  const reply = await prisma.discussionReply.create({
    data: {
      discussionId,
      authorId: req.user!.id,
      content,
      isInstructor
    },
    include: {
      author: { select: { id: true, name: true, role: true } }
    }
  });

  res.status(201).json({ status: "success", data: reply });
});
