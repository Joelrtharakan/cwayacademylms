import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { StorageService } from "../services/storage.service";
import { VideoService } from "../services/video.service";
import { NotificationService } from "../services/notification.service";

// ─── Helpers ───────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function uniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let count = 0;
  while (await prisma.course.findUnique({ where: { slug } })) {
    count++;
    slug = `${slugify(title)}-${count}`;
  }
  return slug;
}

function parseJson(val: string | null | undefined, fallback: any = []): any {
  try { return JSON.parse(val || "[]"); } catch { return fallback; }
}

// ─── PUBLIC: LIST COURSES ───────────────────────────────────────────────────

export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, level, language, isFree, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query as any;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  // Public users only see published
  if (!req.user || req.user.role === "STUDENT") {
    where.status = "PUBLISHED";
  }
  if (search) where.OR = [{ title: { contains: search } }, { subtitle: { contains: search } }];
  if (category) where.categoryId = category;
  if (level) where.level = level;
  if (language) where.language = language;
  if (isFree !== undefined) where.isFree = isFree === "true";
  if (minPrice) where.price = { gte: Number(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: Number(maxPrice) };

  // Instructor can only see own courses
  if (req.user?.role === "INSTRUCTOR") where.instructorId = req.user.id;

  const orderBy: any =
    sortBy === "popular" ? { enrollments: { _count: "desc" } } :
    sortBy === "rating" ? { createdAt: "desc" } :
    sortBy === "moduleOrder" ? { moduleNumber: "asc" } :
    { createdAt: "desc" };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where, skip, take: Number(limit), orderBy,
      include: {
        instructor: { select: { id: true, name: true, avatar: true } },
        category: { select: { name: true } },
        _count: { select: { enrollments: true } },
        reviews: { select: { rating: true } },
      },
    }),
    prisma.course.count({ where }),
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

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const { title, subtitle, description, categoryId, level = "BEGINNER", language = "ENGLISH",
    moduleNumber, weeksDuration = 6, totalLectures = 0, scriptureRef, isFree = true,
    price = 0, currency = "INR", requirements, outcomes, targetAudience,
    welcomeMessage, congratsMessage, tags, instructorId } = req.body;

  if (!title) throw new AppError("Title is required", 400);

  const instId = (req.user!.role === "ADMIN" && instructorId) ? instructorId : req.user!.id;
  const slug = await uniqueSlug(title);

  const course = await prisma.course.create({
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

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      instructor: { select: { id: true, name: true, avatar: true, bio: true, church: true } },
      category: { select: { id: true, name: true, slug: true } },
      sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      reviews: { select: { rating: true } },
      _count: { select: { enrollments: true } },
      curriculum: true,
    },
  });

  if (!course) throw new AppError("Course not found", 404);

  // Non-published courses only accessible by owner/admin
  if (course.status !== "PUBLISHED") {
    if (!req.user) throw new AppError("Course not found", 404);
    if (req.user.role === "STUDENT") throw new AppError("Course not found", 404);
    if (req.user.role === "INSTRUCTOR" && course.instructorId !== req.user.id) throw new AppError("Not authorized", 403);
  }

  let isEnrolled = false;
  if (req.user?.role === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
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

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new AppError("Course not found", 404);
  if (req.user!.role === "INSTRUCTOR" && course.instructorId !== req.user!.id) throw new AppError("Not authorized", 403);

  const { title, subtitle, description, categoryId, level, language, moduleNumber,
    weeksDuration, totalLectures, scriptureRef, isFree, price, currency,
    requirements, outcomes, targetAudience, welcomeMessage, congratsMessage, tags, status } = req.body;

  const data: any = {};
  if (title !== undefined) { data.title = title; data.slug = await uniqueSlug(title); }
  if (subtitle !== undefined) data.subtitle = subtitle;
  if (description !== undefined) data.description = description;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (level !== undefined) data.level = level;
  if (language !== undefined) data.language = language;
  if (moduleNumber !== undefined) data.moduleNumber = moduleNumber ? Number(moduleNumber) : null;
  if (weeksDuration !== undefined) data.weeksDuration = Number(weeksDuration);
  if (totalLectures !== undefined) data.totalLectures = Number(totalLectures);
  if (scriptureRef !== undefined) data.scriptureRef = scriptureRef;
  if (isFree !== undefined) data.isFree = Boolean(isFree);
  if (price !== undefined) data.price = Number(price);
  if (currency !== undefined) data.currency = currency;
  if (requirements !== undefined) data.requirements = JSON.stringify(requirements);
  if (outcomes !== undefined) data.outcomes = JSON.stringify(outcomes);
  if (targetAudience !== undefined) data.targetAudience = JSON.stringify(targetAudience);
  if (welcomeMessage !== undefined) data.welcomeMessage = welcomeMessage;
  if (congratsMessage !== undefined) data.congratsMessage = congratsMessage;
  if (tags !== undefined) data.tags = JSON.stringify(tags);

  if (status !== undefined) {
    if (req.user!.role === "ADMIN") {
      data.status = status;
    } else if (req.user!.role === "INSTRUCTOR" && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
      data.status = status;
    }
  }

  const updated = await prisma.course.update({ where: { id }, data });
  res.json({ status: "success", data: updated });
});

// ─── DELETE COURSE ──────────────────────────────────────────────────────────

export const deleteCourseInstructor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({ where: { id }, include: { _count: { select: { enrollments: true } } } });
  if (!course) throw new AppError("Course not found", 404);
  if (req.user!.role === "INSTRUCTOR" && course.instructorId !== req.user!.id) throw new AppError("Not authorized", 403);
  if (course._count.enrollments > 0) throw new AppError(`This course has ${course._count.enrollments} active enrollments. Archive instead of deleting.`, 400);

  await prisma.course.delete({ where: { id } });
  res.json({ status: "success", message: "Course deleted" });
});

// ─── SUBMIT FOR REVIEW ──────────────────────────────────────────────────────

export const submitForReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({ where: { id }, include: { instructor: true } });
  if (!course) throw new AppError("Course not found", 404);
  if (course.instructorId !== req.user!.id) throw new AppError("Not authorized", 403);
  if (course.status !== "DRAFT" && course.status !== "REJECTED") throw new AppError("Only DRAFT or REJECTED courses can be submitted", 400);

  await prisma.course.update({ where: { id }, data: { status: "PENDING" } });

  // Notify all admins
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((admin) =>
    NotificationService.createNotification(admin.id, "COURSE_PENDING_REVIEW",
      `${course.instructor.name} submitted a course for review`,
      `'${course.title}' is awaiting your approval`,
      `/admin/courses?status=PENDING`
    )
  ));

  res.json({ status: "success", message: "Course submitted for review" });
});

// ─── DUPLICATE COURSE ────────────────────────────────────────────────────────

export const duplicateCourse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const original = await prisma.course.findUnique({
    where: { id }, include: { sections: { include: { lessons: true } } },
  });
  if (!original) throw new AppError("Course not found", 404);
  if (req.user!.role === "INSTRUCTOR" && original.instructorId !== req.user!.id) throw new AppError("Not authorized", 403);

  const slug = await uniqueSlug(`${original.title} Copy`);
  const newCourse = await prisma.course.create({
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

  await prisma.forum.create({ data: { courseId: newCourse.id } });

  for (const section of original.sections) {
    const newSection = await prisma.section.create({ data: { courseId: newCourse.id, title: section.title, order: section.order } });
    for (const lesson of section.lessons) {
      await prisma.lesson.create({
        data: { sectionId: newSection.id, title: lesson.title, type: lesson.type, content: lesson.content, videoUrl: lesson.videoUrl, duration: lesson.duration, order: lesson.order, isFree: lesson.isFree, isPreview: lesson.isPreview },
      });
    }
  }

  res.status(201).json({ status: "success", data: { newCourseId: newCourse.id } });
});

// ─── THUMBNAIL UPLOAD ────────────────────────────────────────────────────────

export const uploadThumbnail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.file) throw new AppError("No file uploaded", 400);
  const ext = req.file.mimetype.split("/")[1];
  const key = StorageService.generateUploadKey("thumbnails", `${id}-${Date.now()}.${ext}`);
  const { url } = await StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
  await prisma.course.update({ where: { id }, data: { thumbnail: url } });
  res.json({ status: "success", data: { thumbnailUrl: url } });
});

// ─── PROMO VIDEO UPLOAD ──────────────────────────────────────────────────────

export const uploadPromoVideo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.file) throw new AppError("No file uploaded", 400);
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw new AppError("Course not found", 404);

  const { videoId, uploadUrl } = await VideoService.createBunnyVideo(course.title);
  await VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
  const streamUrl = VideoService.getBunnyStreamUrl(videoId);
  await prisma.course.update({ where: { id }, data: { promoVideoUrl: streamUrl } });
  res.json({ status: "success", data: { videoUrl: streamUrl, videoId } });
});

// ─── SECTIONS ────────────────────────────────────────────────────────────────

export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, order } = req.body;
  if (!title) throw new AppError("Title required", 400);

  let sectionOrder = Number(order);
  if (!order) {
    const last = await prisma.section.findFirst({ where: { courseId: id }, orderBy: { order: "desc" } });
    sectionOrder = last ? last.order + 1 : 0;
  }
  const section = await prisma.section.create({ data: { courseId: id, title, order: sectionOrder } });
  res.status(201).json({ status: "success", data: section });
});

export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { title, order } = req.body;
  const section = await prisma.section.update({ where: { id: sectionId }, data: { ...(title && { title }), ...(order !== undefined && { order: Number(order) }) } });
  res.json({ status: "success", data: section });
});

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  await prisma.section.delete({ where: { id: sectionId } });
  res.json({ status: "success", message: "Section deleted" });
});

export const reorderSections = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await prisma.$transaction(orderedIds.map((sid, idx) => prisma.section.update({ where: { id: sid }, data: { order: idx } })));
  res.json({ status: "success", message: "Sections reordered" });
});

// ─── LESSONS ─────────────────────────────────────────────────────────────────

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { title, type = "VIDEO", content, videoUrl, duration, order, isFree = false, isPreview = false } = req.body;
  if (!title) throw new AppError("Title required", 400);

  let lessonOrder = Number(order);
  if (!order) {
    const last = await prisma.lesson.findFirst({ where: { sectionId }, orderBy: { order: "desc" } });
    lessonOrder = last ? last.order + 1 : 0;
  }
  const lesson = await prisma.lesson.create({ data: { sectionId, title, type, content, videoUrl, duration: duration ? Number(duration) : 0, order: lessonOrder, isFree: Boolean(isFree), isPreview: Boolean(isPreview) } });
  res.status(201).json({ status: "success", data: lesson });
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { title, type, content, videoUrl, duration, order, isFree, isPreview } = req.body;
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (type !== undefined) data.type = type;
  if (content !== undefined) data.content = content;
  if (videoUrl !== undefined) data.videoUrl = videoUrl;
  if (duration !== undefined) data.duration = Number(duration);
  if (order !== undefined) data.order = Number(order);
  if (isFree !== undefined) data.isFree = Boolean(isFree);
  if (isPreview !== undefined) data.isPreview = Boolean(isPreview);

  const lesson = await prisma.lesson.update({ where: { id: lessonId }, data });
  res.json({ status: "success", data: lesson });
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  await prisma.lesson.delete({ where: { id: lessonId } });
  res.json({ status: "success", message: "Lesson deleted" });
});

export const reorderLessons = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await prisma.$transaction(orderedIds.map((lid, idx) => prisma.lesson.update({ where: { id: lid }, data: { order: idx } })));
  res.json({ status: "success", message: "Lessons reordered" });
});

export const uploadLessonVideo = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  if (!req.file) throw new AppError("No file uploaded", 400);
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", 404);

  const { videoId, uploadUrl } = await VideoService.createBunnyVideo(lesson.title);
  await VideoService.uploadVideoToBunny(uploadUrl, req.file.buffer);
  const streamUrl = VideoService.getBunnyStreamUrl(videoId);

  await prisma.lesson.update({ where: { id: lessonId }, data: { videoUrl: streamUrl, bunnyVideoId: videoId } });
  res.json({ status: "success", data: { videoId, streamUrl, status: "processing" } });
});

export const getLessonVideoStatus = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", 404);
  if (!lesson.bunnyVideoId) throw new AppError("No video attached to this lesson", 400);

  const status = await VideoService.getBunnyVideoStatus(lesson.bunnyVideoId);
  res.json({ status: "success", data: status });
});

export const uploadLessonAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  if (!req.file) throw new AppError("No file uploaded", 400);
  const key = StorageService.generateUploadKey("attachments", req.file.originalname);
  const { url } = await StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
  // Update assignment attachmentUrl
  await prisma.assignment.updateMany({ where: { lessonId }, data: { attachmentUrl: url } });
  res.json({ status: "success", data: { attachmentUrl: url } });
});

// ─── QUIZ ─────────────────────────────────────────────────────────────────────

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { title, passingScore = 70, timeLimit, maxAttempts = 3 } = req.body;
  const quiz = await prisma.quiz.create({ data: { lessonId, title, passingScore: Number(passingScore), timeLimit: timeLimit ? Number(timeLimit) : null, maxAttempts: Number(maxAttempts) } });
  res.status(201).json({ status: "success", data: { ...quiz, questions: [] } });
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { title, passingScore, timeLimit, maxAttempts } = req.body;
  const data: any = {};
  if (title) data.title = title;
  if (passingScore !== undefined) data.passingScore = Number(passingScore);
  if (timeLimit !== undefined) data.timeLimit = timeLimit ? Number(timeLimit) : null;
  if (maxAttempts !== undefined) data.maxAttempts = Number(maxAttempts);
  const quiz = await prisma.quiz.update({ where: { id: quizId }, data });
  res.json({ status: "success", data: quiz });
});

export const addQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { text, type = "MCQ", points = 1, order, scriptureRef, answers = [] } = req.body;
  if (!text) throw new AppError("Question text required", 400);
  if (type === "MCQ" && answers.filter((a: any) => a.isCorrect).length !== 1) throw new AppError("MCQ must have exactly 1 correct answer", 400);

  let qOrder = Number(order);
  if (!order) {
    const last = await prisma.question.findFirst({ where: { quizId }, orderBy: { order: "desc" } });
    qOrder = last ? last.order + 1 : 0;
  }
  const question = await prisma.question.create({
    data: { quizId, text, type, points: Number(points), order: qOrder, scriptureRef, answers: { create: answers.map((a: any) => ({ text: a.text, isCorrect: Boolean(a.isCorrect) })) } },
    include: { answers: true },
  });
  res.status(201).json({ status: "success", data: question });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { text, type, points, scriptureRef, answers } = req.body;
  const data: any = {};
  if (text) data.text = text;
  if (type) data.type = type;
  if (points !== undefined) data.points = Number(points);
  if (scriptureRef !== undefined) data.scriptureRef = scriptureRef;

  if (answers) {
    await prisma.answer.deleteMany({ where: { questionId } });
    data.answers = { create: answers.map((a: any) => ({ text: a.text, isCorrect: Boolean(a.isCorrect) })) };
  }
  const question = await prisma.question.update({ where: { id: questionId }, data, include: { answers: true } });
  res.json({ status: "success", data: question });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  await prisma.question.delete({ where: { id: questionId } });
  res.json({ status: "success", message: "Question deleted" });
});

export const reorderQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = req.body as { orderedIds: string[] };
  await prisma.$transaction(orderedIds.map((qid, idx) => prisma.question.update({ where: { id: qid }, data: { order: idx } })));
  res.json({ status: "success", message: "Questions reordered" });
});

// ─── ASSIGNMENT ───────────────────────────────────────────────────────────────

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { title, description, dueDate, maxScore = 100 } = req.body;
  const assignment = await prisma.assignment.create({ data: { lessonId, title, description, dueDate: dueDate ? new Date(dueDate) : null, maxScore: Number(maxScore) } });
  res.status(201).json({ status: "success", data: assignment });
});

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;
  const data: any = {};
  if (title) data.title = title;
  if (description) data.description = description;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
  if (maxScore !== undefined) data.maxScore = Number(maxScore);
  const assignment = await prisma.assignment.update({ where: { id: assignmentId }, data });
  res.json({ status: "success", data: assignment });
});

// ─── GRADING ──────────────────────────────────────────────────────────────────

export const getInstructorAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { courseId, isGraded, page = 1, limit = 20 } = req.query as any;
  const skip = (Number(page) - 1) * Number(limit);

  // Get all course IDs for this instructor
  const courses = await prisma.course.findMany({ where: { instructorId: req.user!.id }, select: { id: true } });
  const courseIds = courses.map((c) => c.id);

  const where: any = { assignment: { lesson: { section: { courseId: { in: courseIds } } } } };
  if (courseId) where.assignment.lesson.section.courseId = courseId;
  if (isGraded !== undefined) where.isGraded = isGraded === "true";

  const submissions = await prisma.submission.findMany({
    where, skip, take: Number(limit), orderBy: { submittedAt: "desc" },
    include: { student: { select: { name: true, avatar: true } }, assignment: { include: { lesson: { include: { section: { include: { course: { select: { title: true } } } } } } } } },
  });
  res.json({ status: "success", data: submissions });
});

export const getAssignmentSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { isGraded } = req.query as any;
  const where: any = { assignmentId };
  if (isGraded !== undefined) where.isGraded = isGraded === "true";
  const submissions = await prisma.submission.findMany({ where, include: { student: { select: { name: true, avatar: true, church: true } } } });
  res.json({ status: "success", data: submissions });
});

export const gradeSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { assignment: true } });
  if (!submission) throw new AppError("Submission not found", 404);
  if (grade < 0 || grade > submission.assignment.maxScore) throw new AppError(`Grade must be 0–${submission.assignment.maxScore}`, 400);

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { grade: Number(grade), feedback, isGraded: true, gradedAt: new Date() },
  });

  await NotificationService.createNotification(
    submission.studentId, "ASSIGNMENT_GRADED",
    "Your assignment has been graded",
    `You scored ${grade}/${submission.assignment.maxScore} on '${submission.assignment.title}'`,
    "/student/assignments"
  );

  res.json({ status: "success", data: updated });
});

// ─── QUIZ RESULTS ────────────────────────────────────────────────────────────

export const getQuizAttempts = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId }, orderBy: { startedAt: "desc" },
    include: { student: { select: { name: true, avatar: true } } },
  });
  res.json({ status: "success", data: attempts });
});

export const getQuizStats = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const attempts = await prisma.quizAttempt.findMany({ where: { quizId, completedAt: { not: null } } });
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

export const getForumPosts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 20, isPinned } = req.query as any;
  const skip = (Number(page) - 1) * Number(limit);

  const forum = await prisma.forum.findUnique({ where: { courseId: id } });
  if (!forum) throw new AppError("Forum not found", 404);

  const where: any = { forumId: forum.id };
  if (isPinned !== undefined) where.isPinned = isPinned === "true";

  const posts = await prisma.forumPost.findMany({
    where, skip, take: Number(limit),
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { author: { select: { id: true, name: true, avatar: true, role: true } }, _count: { select: { replies: true } } },
  });
  res.json({ status: "success", data: posts });
});

export const createForumPost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const forum = await prisma.forum.findUnique({ where: { courseId: id } });
  if (!forum) throw new AppError("Forum not found", 404);
  const post = await prisma.forumPost.create({ data: { forumId: forum.id, authorId: req.user!.id, title, content }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });
  res.status(201).json({ status: "success", data: post });
});

export const pinForumPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Post not found", 404);
  const updated = await prisma.forumPost.update({ where: { id: postId }, data: { isPinned: !post.isPinned } });
  res.json({ status: "success", data: updated });
});

export const deleteForumPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  await prisma.forumPost.delete({ where: { id: postId } });
  res.json({ status: "success", message: "Post deleted" });
});

export const createForumReply = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Post not found", 404);

  const reply = await prisma.forumReply.create({ data: { postId, authorId: req.user!.id, content }, include: { author: { select: { id: true, name: true, avatar: true, role: true } } } });

  // Notify post author
  if (post.authorId !== req.user!.id) {
    await NotificationService.createNotification(post.authorId, "FORUM_REPLY", "Your question received a reply", `Someone replied to your post: '${post.title}'`, `/courses/${postId}/forum`);
  }

  res.status(201).json({ status: "success", data: reply });
});

export const deleteForumReply = asyncHandler(async (req: Request, res: Response) => {
  const { replyId } = req.params;
  await prisma.forumReply.delete({ where: { id: replyId } });
  res.json({ status: "success", message: "Reply deleted" });
});

// ─── INSTRUCTOR STATS ────────────────────────────────────────────────────────

export const getMyCourses = asyncHandler(async (req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: req.user!.id },
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

export const getInstructorStats = asyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user!.id;

  const courses = await prisma.course.findMany({ where: { instructorId }, select: { id: true, status: true } });
  const courseIds = courses.map((c) => c.id);
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;

  const [enrollments, payments, reviews, completions, pendingSubmissions] = await Promise.all([
    prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
    prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED" }, select: { amount: true } }),
    prisma.review.findMany({ where: { courseId: { in: courseIds } }, select: { rating: true } }),
    prisma.enrollment.count({ where: { courseId: { in: courseIds }, status: "COMPLETED" } }),
    prisma.submission.count({ where: { assignment: { lesson: { section: { courseId: { in: courseIds } } } }, isGraded: false } }),
  ]);

  const instructor = await prisma.user.findUnique({ where: { id: instructorId }, select: { payoutPercentage: true } });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount * ((instructor?.payoutPercentage || 70) / 100), 0);
  const ratings = reviews.map((r) => r.rating);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthPayments = await prisma.payment.findMany({ where: { courseId: { in: courseIds }, status: "COMPLETED", createdAt: { gte: monthStart } }, select: { amount: true } });
  const revenueThisMonth = monthPayments.reduce((sum, p) => sum + p.amount * ((instructor?.payoutPercentage || 70) / 100), 0);

  res.json({ status: "success", data: { totalStudents: enrollments, totalRevenue, revenueThisMonth, avgRating, totalCompletions: completions, pendingSubmissions, publishedCourses } });
});

// ─── COURSE ANALYTICS ────────────────────────────────────────────────────────

export const getCourseAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await prisma.course.findUnique({ where: { id }, include: { sections: { include: { lessons: true } } } });
  if (!course) throw new AppError("Course not found", 404);

  const enrollments = await prisma.enrollment.findMany({ where: { courseId: id }, include: { lessonProgress: { select: { lessonId: true } } } });
  const total = enrollments.length;
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const notStarted = enrollments.filter((e) => e.progress === 0).length;

  // Enrollments over time (last 6 months)
  const enrollmentsOverTime: any[] = [];
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

export const getInstructorRevenue = asyncHandler(async (req: Request, res: Response) => {
  const instructorId = req.user!.id;
  const user = await prisma.user.findUnique({ where: { id: instructorId }, select: { payoutPercentage: true } });
  const pct = (user?.payoutPercentage || 70) / 100;

  const courses = await prisma.course.findMany({ where: { instructorId }, select: { id: true } });
  const courseIds = courses.map((c) => c.id);

  const payments = await prisma.payment.findMany({
    where: { courseId: { in: courseIds }, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true } }, course: { select: { title: true } } },
  });

  const payouts = await prisma.payoutRequest.findMany({ where: { instructorId } });
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

export const requestPayout = asyncHandler(async (req: Request, res: Response) => {
  const { amount, bankDetails, note } = req.body;
  if (!amount || Number(amount) <= 0) throw new AppError("Invalid amount", 400);

  const payout = await prisma.payoutRequest.create({ data: { instructorId: req.user!.id, amount: Number(amount), bankDetails, note } });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((a) => NotificationService.createNotification(a.id, "PAYOUT_REQUEST", "New payout request", `An instructor has requested a payout of ₹${amount}`, "/admin/payouts")));

  res.status(201).json({ status: "success", data: payout });
});

export const getPayoutHistory = asyncHandler(async (req: Request, res: Response) => {
  const payouts = await prisma.payoutRequest.findMany({ where: { instructorId: req.user!.id }, orderBy: { requestedAt: "desc" } });
  res.json({ status: "success", data: payouts });
});

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { sentAt: "desc" },
    include: { sender: { select: { id: true, name: true, avatar: true, role: true } }, receiver: { select: { id: true, name: true, avatar: true, role: true } } },
  });

  const convoMap = new Map<string, any>();
  for (const m of messages) {
    const other = m.senderId === userId ? m.receiver : m.sender;
    if (!convoMap.has(other.id)) {
      const unread = await prisma.message.count({ where: { senderId: other.id, receiverId: userId, readAt: null } });
      convoMap.set(other.id, { otherUser: other, lastMessage: { content: m.content, sentAt: m.sentAt, isRead: !!m.readAt }, unreadCount: unread });
    }
  }

  res.json({ status: "success", data: Array.from(convoMap.values()) });
});

export const getMessageThread = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const otherId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId, receiverId: otherId }, { senderId: otherId, receiverId: userId }] },
    orderBy: { sentAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  // Mark as read
  await prisma.message.updateMany({ where: { senderId: otherId, receiverId: userId, readAt: null }, data: { readAt: new Date() } });

  res.json({ status: "success", data: messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { receiverId, content } = req.body;
  if (!content || content.length > 2000) throw new AppError("Message must be 1-2000 characters", 400);

  const message = await prisma.message.create({
    data: { senderId: req.user!.id, receiverId, content },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  const sender = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
  await NotificationService.createNotification(receiverId, "NEW_MESSAGE", `New message from ${sender?.name}`, content.slice(0, 80), `/messages/${req.user!.id}`);

  res.status(201).json({ status: "success", data: message });
});

// ─── AVATAR UPLOAD ────────────────────────────────────────────────────────────

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const key = StorageService.generateUploadKey("avatars", `${req.user!.id}.${req.file.mimetype.split("/")[1]}`);
  const { url } = await StorageService.uploadFile(req.file.buffer, key, req.file.mimetype);
  await prisma.user.update({ where: { id: req.user!.id }, data: { avatar: url } });
  res.json({ status: "success", data: { avatarUrl: url } });
});

// ─── USER PROFILE UPDATE ──────────────────────────────────────────────────────

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, bio, church, location, phone, socialLinks, title, credentials, yearsExperience, expertise, notificationPrefs } = req.body;
  const data: any = {};
  if (name) data.name = name;
  if (bio !== undefined) data.bio = bio;
  if (church !== undefined) data.church = church;
  if (location !== undefined) data.location = location;
  if (phone !== undefined) data.phone = phone;
  if (socialLinks !== undefined) data.socialLinks = JSON.stringify(socialLinks);
  if (title !== undefined) data.title = title;
  if (credentials !== undefined) data.credentials = credentials;
  if (yearsExperience !== undefined) data.yearsExperience = Number(yearsExperience);
  if (expertise !== undefined) data.expertise = JSON.stringify(expertise);
  if (notificationPrefs !== undefined) data.notificationPrefs = JSON.stringify(notificationPrefs);

  const user = await prisma.user.update({ where: { id: req.user!.id }, data, select: { id: true, name: true, email: true, bio: true, church: true, location: true, phone: true, avatar: true, role: true, title: true, credentials: true, yearsExperience: true, expertise: true, notificationPrefs: true, socialLinks: true } });
  res.json({ status: "success", data: user });
});

// ─── CATEGORIES (public) ─────────────────────────────────────────────────────

export const getPublicCategories = asyncHandler(async (_req: Request, res: Response) => {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  res.json({ status: "success", data: cats });
});
