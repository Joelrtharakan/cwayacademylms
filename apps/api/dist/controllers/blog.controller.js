"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCover = exports.deletePost = exports.updatePost = exports.createPost = exports.getPostBySlug = exports.getPosts = void 0;
const prisma_1 = require("../utils/prisma");
const errors_1 = require("../utils/errors");
const storage_service_1 = require("../services/storage.service");
// Helper to generate slug from title
const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
};
// Helper to calculate reading time
const calculateReadingTime = (content) => {
    const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    return Math.ceil(words / 200);
};
exports.getPosts = (0, errors_1.asyncHandler)(async (req, res) => {
    const { published } = req.query;
    const where = {};
    if (published === 'true')
        where.isPublished = true;
    const posts = await prisma_1.prisma.blogPost.findMany({
        where,
        include: {
            author: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ status: "success", data: posts });
});
exports.getPostBySlug = (0, errors_1.asyncHandler)(async (req, res) => {
    const { slug } = req.params;
    const post = await prisma_1.prisma.blogPost.findUnique({
        where: { slug },
        include: {
            author: { select: { id: true, name: true, avatar: true, bio: true } }
        }
    });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    res.json({ status: "success", data: post });
});
exports.createPost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { title, excerpt, content, isPublished } = req.body;
    const authorId = req.user.id;
    let slug = generateSlug(title);
    // Ensure unique slug
    let exists = await prisma_1.prisma.blogPost.findUnique({ where: { slug } });
    if (exists) {
        slug = `${slug}-${Date.now()}`;
    }
    const readingTime = calculateReadingTime(content || "");
    const post = await prisma_1.prisma.blogPost.create({
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
exports.updatePost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { slug } = req.params;
    const { title, excerpt, content, isPublished } = req.body;
    const user = req.user;
    const post = await prisma_1.prisma.blogPost.findUnique({ where: { slug } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    if (user.role !== "ADMIN" && post.authorId !== user.id) {
        throw new errors_1.AppError("Not authorized to update this post", 403);
    }
    let newSlug = post.slug;
    if (title && title !== post.title) {
        newSlug = generateSlug(title);
        const exists = await prisma_1.prisma.blogPost.findFirst({ where: { slug: newSlug, id: { not: post.id } } });
        if (exists)
            newSlug = `${newSlug}-${Date.now()}`;
    }
    const readingTime = content ? calculateReadingTime(content) : post.readingTime;
    const updated = await prisma_1.prisma.blogPost.update({
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
exports.deletePost = (0, errors_1.asyncHandler)(async (req, res) => {
    const { slug } = req.params;
    const user = req.user;
    const post = await prisma_1.prisma.blogPost.findUnique({ where: { slug } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    if (user.role !== "ADMIN" && post.authorId !== user.id) {
        throw new errors_1.AppError("Not authorized to delete this post", 403);
    }
    if (post.coverKey) {
        await (0, storage_service_1.deleteFromR2)(post.coverKey);
    }
    await prisma_1.prisma.blogPost.delete({ where: { slug } });
    res.json({ status: "success", message: "Post deleted" });
});
exports.uploadCover = (0, errors_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!req.file)
        throw new errors_1.AppError("No file uploaded", 400);
    const post = await prisma_1.prisma.blogPost.findUnique({ where: { id } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    const user = req.user;
    if (user.role !== "ADMIN" && post.authorId !== user.id) {
        throw new errors_1.AppError("Not authorized", 403);
    }
    const fileKey = (0, storage_service_1.generateKey)("blog", req.file.originalname);
    const { url } = await (0, storage_service_1.uploadToR2)(req.file.buffer, fileKey, req.file.mimetype);
    if (post.coverKey) {
        try {
            await (0, storage_service_1.deleteFromR2)(post.coverKey);
        }
        catch (e) { /* ignore */ }
    }
    const updated = await prisma_1.prisma.blogPost.update({
        where: { id },
        data: { coverImage: url, coverKey: fileKey }
    });
    res.json({ status: "success", data: { coverImageUrl: url } });
});
