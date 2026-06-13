import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { uploadToR2, generateKey, deleteFromR2 } from "../services/storage.service";

// Helper to generate slug from title
const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
};

// Helper to calculate reading time
const calculateReadingTime = (content: string) => {
  const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  return Math.ceil(words / 200);
};

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { published } = req.query;
  const where: any = {};
  if (published === 'true') where.isPublished = true;

  const posts = await prisma.blogPost.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ status: "success", data: posts });
});

export const getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true, bio: true } }
    }
  });

  if (!post) throw new AppError("Post not found", 404);

  res.json({ status: "success", data: post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, excerpt, content, isPublished } = req.body;
  const authorId = req.user!.id;

  let slug = generateSlug(title);
  // Ensure unique slug
  let exists = await prisma.blogPost.findUnique({ where: { slug } });
  if (exists) {
    slug = `${slug}-${Date.now()}`;
  }

  const readingTime = calculateReadingTime(content || "");

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      isPublished: isPublished ?? false,
      readingTime,
      authorId
    }
  });

  res.json({ status: "success", data: post });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { title, excerpt, content, isPublished } = req.body;
  const user = req.user!;

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) throw new AppError("Post not found", 404);

  if (user.role !== "ADMIN" && post.authorId !== user.id) {
    throw new AppError("Not authorized to update this post", 403);
  }

  let newSlug = post.slug;
  if (title && title !== post.title) {
    newSlug = generateSlug(title);
    const exists = await prisma.blogPost.findFirst({ where: { slug: newSlug, id: { not: post.id } } });
    if (exists) newSlug = `${newSlug}-${Date.now()}`;
  }

  const readingTime = content ? calculateReadingTime(content) : post.readingTime;

  const updated = await prisma.blogPost.update({
    where: { slug },
    data: {
      title,
      slug: newSlug,
      excerpt,
      content,
      isPublished,
      readingTime
    }
  });

  res.json({ status: "success", data: updated });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const user = req.user!;

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) throw new AppError("Post not found", 404);

  if (user.role !== "ADMIN" && post.authorId !== user.id) {
    throw new AppError("Not authorized to delete this post", 403);
  }

  if (post.coverKey) {
    await deleteFromR2(post.coverKey);
  }

  await prisma.blogPost.delete({ where: { slug } });

  res.json({ status: "success", message: "Post deleted" });
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.file) throw new AppError("No file uploaded", 400);

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new AppError("Post not found", 404);

  const user = req.user!;
  if (user.role !== "ADMIN" && post.authorId !== user.id) {
    throw new AppError("Not authorized", 403);
  }

  const fileKey = generateKey("blog", req.file.originalname);
  const { url } = await uploadToR2(req.file.buffer, fileKey, req.file.mimetype);

  if (post.coverKey) {
    try { await deleteFromR2(post.coverKey); } catch (e) { /* ignore */ }
  }

  const updated = await prisma.blogPost.update({
    where: { id },
    data: { coverImage: url, coverKey: fileKey }
  });

  res.json({ status: "success", data: { coverImageUrl: url } });
});
