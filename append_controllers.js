const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/api/src/controllers/modules.controller.ts');
const content = fs.readFileSync(file, 'utf8');

const newContent = `
// ─── VIDEO UPLOAD ─────────────────────────────────────────────────────────────

export const uploadVideoToLesson = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const file = req.file;

  if (!file) throw new AppError("Video file is required", 400);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) throw new AppError("Lesson not found", 404);
  if (req.user!.role !== "ADMIN" && lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const { videoId, uploadUrl } = await VideoService.createBunnyVideo(lesson.title);
  
  // Note: For real large files, we should stream directly to Bunny or use client-side upload.
  // This is a buffer upload (suitable for small files or chunked via multer)
  await VideoService.uploadVideoToBunny(uploadUrl, file.buffer);

  const streamUrl = VideoService.getBunnyStreamUrl(videoId);

  const updated = await prisma.lesson.update({
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

export const getLessonVideoStatus = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { section: { include: { course: true } } },
  });
  if (!lesson) throw new AppError("Lesson not found", 404);
  
  // We can let instructors or enrolled students view this status, but for now just check instructor/admin
  // Or just allow if lesson exists and is free/enrolled. For now, strict auth as requested.
  if (req.user!.role !== "ADMIN" && lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  if (!lesson.bunnyVideoId) {
    throw new AppError("No video attached to this lesson", 400);
  }

  const status = await VideoService.getBunnyVideoStatus(lesson.bunnyVideoId);

  // If status indicates finished, we could update the duration in DB
  if (status.status === 2 || status.status === "Mock Finished") {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { duration: status.duration },
    });
  }

  res.json({ status: "success", data: status });
});

// ─── READING MATERIALS ───────────────────────────────────────────────────────

export const createReadingMaterial = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, description } = req.body;
  const file = req.file;

  if (!file) throw new AppError("File is required", 400);
  if (!title) throw new AppError("Title is required", 400);

  const section = await prisma.section.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!section) throw new AppError("Module not found", 404);
  if (req.user!.role !== "ADMIN" && section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  // Upload to R2
  const ext = file.originalname.split('.').pop() || '';
  const fileKey = StorageService.generateUploadKey(\`reading-materials/\${moduleId}\`, file.originalname);
  const { url } = await StorageService.uploadFile(file.buffer, fileKey, file.mimetype);

  const lastMat = await prisma.readingMaterial.findFirst({
    where: { sectionId: moduleId },
    orderBy: { order: 'desc' }
  });
  const order = lastMat ? lastMat.order + 1 : 0;

  const readingMaterial = await prisma.readingMaterial.create({
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

export const getReadingMaterials = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const materials = await prisma.readingMaterial.findMany({
    where: { sectionId: moduleId },
    orderBy: { order: "asc" },
  });

  res.json({ status: "success", data: materials });
});

export const updateReadingMaterial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, order } = req.body;

  const material = await prisma.readingMaterial.findUnique({
    where: { id },
    include: { section: { include: { course: true } } },
  });
  if (!material) throw new AppError("Reading material not found", 404);
  if (req.user!.role !== "ADMIN" && material.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const updated = await prisma.readingMaterial.update({
    where: { id },
    data: { title, description, order },
  });

  res.json({ status: "success", data: updated });
});

export const deleteReadingMaterial = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const material = await prisma.readingMaterial.findUnique({
    where: { id },
    include: { section: { include: { course: true } } },
  });
  if (!material) throw new AppError("Reading material not found", 404);
  if (req.user!.role !== "ADMIN" && material.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  // Delete from R2
  await StorageService.deleteFile(material.fileKey);

  // Delete from DB
  await prisma.readingMaterial.delete({ where: { id } });

  res.json({ status: "success", message: "Reading material deleted successfully" });
});

export const reorderReadingMaterials = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) throw new AppError("orderedIds must be an array", 400);

  const section = await prisma.section.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!section) throw new AppError("Module not found", 404);
  if (req.user!.role !== "ADMIN" && section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.readingMaterial.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  res.json({ status: "success", message: "Reading materials reordered successfully" });
});

// ─── QUIZZES ─────────────────────────────────────────────────────────────────

export const createQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, instructions, passingScore, timeLimit, maxAttempts } = req.body;

  if (!title) throw new AppError("Title is required", 400);

  const section = await prisma.section.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!section) throw new AppError("Module not found", 404);
  if (req.user!.role !== "ADMIN" && section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { sectionId: moduleId },
    orderBy: { order: 'desc' }
  });
  const order = lastLesson ? lastLesson.order + 1 : 0;

  // Run in transaction: Create Lesson + Quiz
  const result = await prisma.$transaction(async (tx) => {
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

export const getQuizzes = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const lessonsWithQuizzes = await prisma.lesson.findMany({
    where: { sectionId: moduleId, type: "QUIZ" },
    orderBy: { order: "asc" },
    include: {
      quiz: {
        include: {
          _count: { select: { questions: true, attempts: true } }
        }
      }
    }
  });

  res.json({ status: "success", data: lessonsWithQuizzes });
});

export const updateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { title, instructions, passingScore, timeLimit, maxAttempts } = req.body;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (req.user!.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: { title, passingScore, timeLimit, maxAttempts },
  });

  if (title || instructions !== undefined) {
    await prisma.lesson.update({
      where: { id: quiz.lessonId },
      data: {
        title: title || undefined,
        content: instructions !== undefined ? instructions : undefined,
      }
    });
  }

  res.json({ status: "success", data: updatedQuiz });
});

export const deleteQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (req.user!.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  // Deleting the lesson cascades to quiz, questions, answers, etc.
  await prisma.lesson.delete({ where: { id: quiz.lessonId } });

  res.json({ status: "success", message: "Quiz deleted successfully" });
});

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { text, type, points, order, scriptureRef, answers } = req.body;

  if (!text) throw new AppError("Question text is required", 400);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (req.user!.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  let nextOrder = order;
  if (nextOrder === undefined) {
    const lastQ = await prisma.question.findFirst({
      where: { quizId },
      orderBy: { order: 'desc' }
    });
    nextOrder = lastQ ? lastQ.order + 1 : 0;
  }

  const question = await prisma.question.create({
    data: {
      quizId,
      text,
      type: type || "MCQ",
      points: points ?? 1,
      order: nextOrder,
      scriptureRef,
      answers: answers && answers.length > 0 ? {
        create: answers.map((a: any) => ({
          text: a.text,
          isCorrect: a.isCorrect
        }))
      } : undefined
    },
    include: { answers: true }
  });

  res.status(201).json({ status: "success", data: question });
});

// Updates question and overwrites answers completely if provided
export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;
  const { text, type, points, scriptureRef, answers } = req.body;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { lesson: { include: { section: { include: { course: true } } } } } } },
  });
  if (!question) throw new AppError("Question not found", 404);
  if (req.user!.role !== "ADMIN" && question.quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  // If answers are provided, delete old and create new
  const updateData: any = { text, type, points, scriptureRef };
  
  if (answers) {
    updateData.answers = {
      deleteMany: {},
      create: answers.map((a: any) => ({
        text: a.text,
        isCorrect: a.isCorrect
      }))
    };
  }

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: updateData,
    include: { answers: true }
  });

  res.json({ status: "success", data: updated });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.params;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { lesson: { include: { section: { include: { course: true } } } } } } },
  });
  if (!question) throw new AppError("Question not found", 404);
  if (req.user!.role !== "ADMIN" && question.quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  await prisma.question.delete({ where: { id: questionId } });
  res.json({ status: "success", message: "Question deleted successfully" });
});

export const reorderQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) throw new AppError("orderedIds must be an array", 400);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (req.user!.role !== "ADMIN" && quiz.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.question.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  res.json({ status: "success", message: "Questions reordered successfully" });
});

// ─── ASSIGNMENTS ─────────────────────────────────────────────────────────────

export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  if (!title || !description) throw new AppError("Title and description required", 400);

  const section = await prisma.section.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!section) throw new AppError("Module not found", 404);
  if (req.user!.role !== "ADMIN" && section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const lastLesson = await prisma.lesson.findFirst({
    where: { sectionId: moduleId },
    orderBy: { order: 'desc' }
  });
  const order = lastLesson ? lastLesson.order + 1 : 0;

  const result = await prisma.$transaction(async (tx) => {
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

export const getAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const lessonsWithAssignments = await prisma.lesson.findMany({
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

export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { title, description, dueDate, maxScore } = req.body;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  if (req.user!.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      maxScore,
    },
  });

  if (title) {
    await prisma.lesson.update({
      where: { id: assignment.lessonId },
      data: { title }
    });
  }

  res.json({ status: "success", data: updated });
});

export const deleteAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  if (req.user!.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  // Deleting lesson cascades to assignment and submissions
  await prisma.lesson.delete({ where: { id: assignment.lessonId } });

  res.json({ status: "success", message: "Assignment deleted successfully" });
});

export const uploadAssignmentAttachment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const file = req.file;

  if (!file) throw new AppError("File is required", 400);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  if (req.user!.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const fileKey = StorageService.generateUploadKey(\`assignments/\${assignmentId}\`, file.originalname);
  const { url } = await StorageService.uploadFile(file.buffer, fileKey, file.mimetype);

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: { attachmentUrl: url }
  });

  res.json({ status: "success", data: updated });
});

export const getAssignmentSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { lesson: { include: { section: { include: { course: true } } } } },
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  if (req.user!.role !== "ADMIN" && assignment.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: {
      student: { select: { id: true, name: true, avatar: true, church: true, location: true } }
    },
    orderBy: { submittedAt: 'desc' }
  });

  res.json({ status: "success", data: submissions });
});

export const gradeSubmission = asyncHandler(async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  const { grade, feedback } = req.body;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: { include: { lesson: { include: { section: { include: { course: true } } } } } },
      student: true
    },
  });
  if (!submission) throw new AppError("Submission not found", 404);
  if (req.user!.role !== "ADMIN" && submission.assignment.lesson.section.course.instructorId !== req.user!.id) {
    throw new AppError("Not authorized", 403);
  }

  if (grade > submission.assignment.maxScore || grade < 0) {
    throw new AppError(\`Grade must be between 0 and \${submission.assignment.maxScore}\`, 400);
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade,
      feedback,
      isGraded: true,
      gradedAt: new Date(),
    }
  });

  // Create Notification for student
  await prisma.notification.create({
    data: {
      userId: submission.studentId,
      type: "ASSIGNMENT_GRADED",
      title: "Your assignment has been graded",
      body: \`You scored \${grade}/\${submission.assignment.maxScore} on '\${submission.assignment.title}'\`,
      link: \`/student/assignments/\${submission.assignmentId}\`
    }
  });

  res.json({ status: "success", data: updated });
});
`

fs.writeFileSync(file, content + '\n' + newContent);
console.log("Successfully appended to modules.controller.ts");
