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

export const gradeDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { score, feedback } = req.body;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    include: { course: true }
  });

  if (!discussion) throw new AppError("Discussion not found", 404);
  if (req.user!.role !== "ADMIN" && discussion.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized to grade", 403);
  }

  const updated = await prisma.discussion.update({
    where: { id: discussionId },
    data: { score: score !== undefined ? Number(score) : null, feedback },
    include: {
      author: { select: { id: true, name: true, role: true } },
      replies: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  res.json({ status: "success", data: updated });
});

export const updateDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { content } = req.body;

  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion) throw new AppError("Discussion not found", 404);
  if (discussion.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new AppError("Not authorized", 403);
  }

  const updated = await prisma.discussion.update({
    where: { id: discussionId },
    data: { content },
    include: {
      author: { select: { id: true, name: true, role: true } },
      replies: {
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  res.json({ status: "success", data: updated });
});

export const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { discussionId } = req.params;

  const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } });
  if (!discussion) throw new AppError("Discussion not found", 404);
  if (discussion.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new AppError("Not authorized", 403);
  }

  await prisma.discussion.delete({ where: { id: discussionId } });

  res.json({ status: "success", message: "Discussion deleted" });
});

export const updateReply = asyncHandler(async (req: Request, res: Response) => {
  const { replyId } = req.params;
  const { content } = req.body;

  const reply = await prisma.discussionReply.findUnique({ where: { id: replyId } });
  if (!reply) throw new AppError("Reply not found", 404);
  if (reply.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new AppError("Not authorized", 403);
  }

  const updated = await prisma.discussionReply.update({
    where: { id: replyId },
    data: { content },
    include: { author: { select: { id: true, name: true, role: true } } }
  });

  res.json({ status: "success", data: updated });
});

export const deleteReply = asyncHandler(async (req: Request, res: Response) => {
  const { replyId } = req.params;

  const reply = await prisma.discussionReply.findUnique({ where: { id: replyId } });
  if (!reply) throw new AppError("Reply not found", 404);
  if (reply.authorId !== req.user!.id && req.user!.role !== "ADMIN") {
    throw new AppError("Not authorized", 403);
  }

  await prisma.discussionReply.delete({ where: { id: replyId } });

  res.json({ status: "success", message: "Reply deleted" });
});
