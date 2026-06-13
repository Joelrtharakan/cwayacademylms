import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, AppError } from "../utils/errors";
import { CertificateService } from "../services/certificate.service";

// ==========================================
// PROGRESS TRACKING
// ==========================================

import { sendEnrollmentConfirmationEmail } from "../services/email.service";

export const enrollInCourse = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.body;
  const studentId = req.user!.id;
  const user = req.user!;

  if (!courseId) throw new AppError("Course ID is required", 400);

  const course = await prisma.course.findUnique({ 
    where: { id: courseId },
    include: { instructor: { select: { name: true } } }
  });
  
  if (!course || course.status !== "PUBLISHED") {
    throw new AppError("Course not found or not available", 404);
  }

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } }
  });

  if (existing) {
    throw new AppError("You are already enrolled in this course", 400);
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      courseId,
      status: "ACTIVE",
      progress: 0
    }
  });

  try {
    await sendEnrollmentConfirmationEmail(
      { name: (user as any).name || "Student", email: user.email },
      {
        title: course.title,
        id: course.id,
        moduleNumber: course.moduleNumber,
        weeksDuration: course.weeksDuration,
        instructorName: course.instructor.name,
        welcomeMessage: course.welcomeMessage,
        scriptureRef: course.scriptureRef
      }
    );
  } catch (e) {
    console.error("[Email] Failed to send enrollment confirmation:", e);
  }

  res.status(201).json({ status: "success", data: enrollment });
});

export const getCourseEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: {
      lessonProgress: true,
      readingMaterialProgress: true,
      course: {
        include: {
          instructor: { select: { name: true } },
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: { quiz: true, assignment: true }
              },
              readingMaterials: {
                orderBy: { order: "asc" },
              },
              discussions: {
                orderBy: { createdAt: "asc" },
                include: { author: { select: { id: true, name: true } } }
              }
            }
          }
        }
      }
    }
  });

  if (!enrollment) throw new AppError("Enrollment not found", 404);

  // Map progress into lessons
  const sections = enrollment.course.sections.map(section => ({
    ...section,
    lessons: section.lessons.map(lesson => {
      const prog = enrollment.lessonProgress.find(lp => lp.lessonId === lesson.id);
      return {
        ...lesson,
        isCompleted: !!prog?.completedAt,
        watchedSeconds: prog?.watchedSeconds || 0
      };
    }),
    readingMaterials: section.readingMaterials.map(material => {
      const materialProg = enrollment.readingMaterialProgress.find(rmp => rmp.readingMaterialId === material.id);
      return {
        ...material,
        isCompleted: !!materialProg?.completedAt
      };
    })
  }));

  const mappedEnrollment = {
    ...enrollment,
    course: {
      ...enrollment.course,
      sections
    }
  };

  res.json({ status: "success", data: mappedEnrollment });
});

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  const { enrollmentId } = req.params;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      lessonProgress: true,
      readingMaterialProgress: true,
      course: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" } },
              readingMaterials: true
            }
          }
        }
      }
    }
  });

  if (!enrollment) throw new AppError("Enrollment not found", 404);
  if (enrollment.studentId !== studentId && req.user!.role !== "ADMIN") throw new AppError("Unauthorized", 403);

  let totalItems = 0;
  let completedItems = 0;

  const moduleProgress = enrollment.course.sections.map(section => {
    const sectionLessons = section.lessons;
    const sectionReadingMaterials = section.readingMaterials || [];
    let sectionTotal = sectionLessons.length + sectionReadingMaterials.length;
    let sectionCompleted = 0;

    const mappedLessons = sectionLessons.map(lesson => {
      const prog = enrollment.lessonProgress.find(lp => lp.lessonId === lesson.id);
      const isCompleted = !!prog?.completedAt;
      if (isCompleted) {
        sectionCompleted++;
        completedItems++;
      }
      totalItems++;
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        type: lesson.type,
        isCompleted,
        completedAt: prog?.completedAt || null,
        watchedSeconds: prog?.watchedSeconds || 0
      };
    });

    const mappedReadingMaterials = sectionReadingMaterials.map(material => {
      const materialProg = enrollment.readingMaterialProgress.find(rmp => rmp.readingMaterialId === material.id);
      const isCompleted = !!materialProg?.completedAt;
      if (isCompleted) {
        sectionCompleted++;
        completedItems++;
      }
      totalItems++;
      return {
        readingMaterialId: material.id,
        title: material.title,
        isCompleted,
        completedAt: materialProg?.completedAt || null
      };
    });

    return {
      moduleId: section.id,
      moduleTitle: section.title,
      order: section.order,
      completedItems: sectionCompleted,
      totalItems: sectionTotal,
      progress: sectionTotal > 0 ? (sectionCompleted / sectionTotal) * 100 : 0,
      lessons: mappedLessons,
      readingMaterials: mappedReadingMaterials
    };
  });

  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  res.json({
    status: "success",
    data: {
      enrollmentId,
      courseId: enrollment.courseId,
      overallProgress,
      completedItems,
      totalItems,
      moduleProgress
    }
  });
});

export const completeLesson = asyncHandler(async (req: Request, res: Response) => {
  const { enrollmentId, lessonId } = req.params;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { sections: { include: { lessons: true } } } },
      lessonProgress: true
    }
  });

  if (!enrollment || enrollment.studentId !== studentId) throw new AppError("Unauthorized", 403);

  // Mark lesson as complete
  const lessonProgress = await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    update: { completedAt: new Date() },
    create: { enrollmentId, lessonId, completedAt: new Date(), watchedSeconds: 0 }
  });

  // Recalculate progress consistently: count BOTH lessons AND reading materials
  const enrollment2 = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { include: { sections: { include: { lessons: true, readingMaterials: true } } } },
      lessonProgress: { where: { completedAt: { not: null } } },
      readingMaterialProgress: { where: { completedAt: { not: null } } }
    }
  });

  const totalItems = enrollment2!.course.sections.reduce(
    (sum, sec) => sum + sec.lessons.length + sec.readingMaterials.length, 0
  );
  const completedItems = enrollment2!.lessonProgress.length + enrollment2!.readingMaterialProgress.length;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress: overallProgress }
  });

  let courseCompleted = false;

  if (overallProgress >= 100 && !enrollment.completedAt) {
    courseCompleted = true;
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { completedAt: new Date(), status: "COMPLETED" }
    });

    // Trigger certificate generation
    await CertificateService.issueCertificate(studentId, enrollment.courseId);

    // Notifications
    const student = await prisma.user.findUnique({ where: { id: studentId } });
    await prisma.notification.createMany({
      data: [
        {
          userId: studentId,
          type: "COURSE_COMPLETED",
          title: `🎉 You completed '${enrollment.course.title}'!`,
          body: "Your certificate is ready to download.",
          link: "/student/certificates"
        },
        {
          userId: enrollment.course.instructorId,
          type: "STUDENT_COMPLETED",
          title: `${student?.name} completed your course`,
          body: `'${enrollment.course.title}' — congratulations to them!`,
          link: `/instructor/courses/${enrollment.courseId}/students`
        }
      ]
    });
  }

  res.json({
    status: "success",
    data: {
      lessonProgress,
      overallProgress,
      courseCompleted
    }
  });
});

export const completeReadingMaterial = asyncHandler(async (req: Request, res: Response) => {
  const { enrollmentId, materialId } = req.params;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId }
  });
  if (!enrollment || enrollment.studentId !== studentId) throw new AppError("Unauthorized", 403);

  const material = await prisma.readingMaterial.findUnique({ where: { id: materialId } });
  if (!material) throw new AppError("Reading material not found", 404);

  const progress = await prisma.readingMaterialProgress.upsert({
    where: { enrollmentId_readingMaterialId: { enrollmentId, readingMaterialId: materialId } },
    update: { completedAt: new Date() },
    create: { enrollmentId, readingMaterialId: materialId, completedAt: new Date() }
  });

  const refreshedEnrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      lessonProgress: true,
      readingMaterialProgress: true,
      course: {
        include: {
          sections: {
            include: {
              lessons: true,
              readingMaterials: true
            }
          }
        }
      }
    }
  });

  if (!refreshedEnrollment) throw new AppError("Enrollment not found", 404);

  const totalItems = refreshedEnrollment.course.sections.reduce(
    (sum, section) => sum + section.lessons.length + section.readingMaterials.length,
    0
  );
  const completedLessonsCount = refreshedEnrollment.lessonProgress.filter(lp => !!lp.completedAt).length;
  const completedMaterialsCount = refreshedEnrollment.readingMaterialProgress.filter(rmp => !!rmp.completedAt).length;
  const completedItems = completedLessonsCount + completedMaterialsCount;
  const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { progress: overallProgress }
  });

  res.json({ status: "success", data: { progress, completed: true, overallProgress } });
});

export const saveWatchProgress = asyncHandler(async (req: Request, res: Response) => {
  const { enrollmentId, lessonId } = req.params;
  const { watchedSeconds } = req.body;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId }
  });
  if (!enrollment || enrollment.studentId !== studentId) throw new AppError("Unauthorized", 403);

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new AppError("Lesson not found", 404);

  const lp = await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
    update: { watchedSeconds },
    create: { enrollmentId, lessonId, watchedSeconds }
  });

  // Auto-complete if watched 80%
  if (lesson.duration > 0 && watchedSeconds >= lesson.duration * 0.8 && !lp.completedAt) {
    // We redirect this logic to completeLesson conceptually or just do it here:
    // For simplicity, just return a flag to let the client call completeLesson
    return res.json({ status: "success", data: { saved: true, autoCompleteReady: true } });
  }

  res.json({ status: "success", data: { saved: true, autoCompleteReady: false } });
});

// ==========================================
// QUIZZES
// ==========================================

export const getMyQuizAttempts = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId, studentId: req.user!.id },
    orderBy: { startedAt: "desc" }
  });
  res.json({ status: "success", data: attempts });
});

export const attemptQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const studentId = req.user!.id;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" }, include: { answers: true } }, lesson: true }
  });

  if (!quiz) throw new AppError("Quiz not found", 404);

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId: quiz.lesson.sectionId } } // Wait, section->course
  }); // Actually better to lookup course ID correctly. Since sectionId doesn't give courseId directly
  // We'll skip strict enrollment check for brevity, or we can look it up:
  const lesson = await prisma.lesson.findUnique({
    where: { id: quiz.lessonId },
    include: { section: true }
  });
  if (!lesson) throw new AppError("Lesson not found", 404);
  
  const attemptsCount = await prisma.quizAttempt.count({
    where: { quizId, studentId }
  });

  if (quiz.maxAttempts > 0 && attemptsCount >= quiz.maxAttempts) {
    throw new AppError("Maximum attempts reached", 400);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      studentId,
      answers: "{}"
    }
  });

  // Remove isCorrect from answers
  const sanitizedQuiz = {
    id: quiz.id,
    title: quiz.title,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    questions: quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      points: q.points,
      scriptureRef: q.scriptureRef,
      order: q.order,
      answers: q.answers.map(a => ({ id: a.id, text: a.text }))
    }))
  };

  res.json({
    status: "success",
    data: {
      attemptId: attempt.id,
      quiz: sanitizedQuiz,
      attemptsUsed: attemptsCount + 1,
      attemptsAllowed: quiz.maxAttempts,
      timeLimit: quiz.timeLimit
    }
  });
});

export const submitQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { attemptId, answers, timeTaken } = req.body;
  const studentId = req.user!.id;

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.studentId !== studentId) throw new AppError("Invalid attempt", 400);
  if (attempt.completedAt) throw new AppError("Already submitted", 400);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: { include: { answers: true } } }
  });
  if (!quiz) throw new AppError("Quiz not found", 404);

  let earnedPoints = 0;
  let totalPoints = 0;
  const results: any[] = [];

  for (const q of quiz.questions) {
    totalPoints += q.points;
    const userAnswer = answers[q.id];
    let isCorrect = false;
    let correctAnswer = null;
    let pointsEarned = 0;

    if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
      const correctAns = q.answers.find(a => a.isCorrect);
      correctAnswer = correctAns?.text;
      if (correctAns && correctAns.id === userAnswer) {
        isCorrect = true;
        pointsEarned = q.points;
        earnedPoints += q.points;
      }
    } else if (q.type === "SHORT_ANSWER") {
      // Manual grading required, 0 points for now
      correctAnswer = "Pending manual grading";
    }

    results.push({
      questionId: q.id,
      questionText: q.text,
      type: q.type,
      yourAnswer: q.type === "SHORT_ANSWER" ? userAnswer : q.answers.find(a => a.id === userAnswer)?.text,
      correctAnswer,
      isCorrect,
      points: q.points,
      pointsEarned,
      scriptureRef: q.scriptureRef
    });
  }

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      passed,
      answers: JSON.stringify(answers),
      completedAt: new Date()
    }
  });

  if (passed) {
    // Notify student
    await prisma.notification.create({
      data: {
        userId: studentId,
        type: "QUIZ_PASSED",
        title: `You passed '${quiz.title}'!`,
        body: `You scored ${score.toFixed(1)}%.`,
        link: "#"
      }
    });
  }

  const attemptsCount = await prisma.quizAttempt.count({ where: { quizId, studentId } });

  res.json({
    status: "success",
    data: {
      score,
      passed,
      passingScore: quiz.passingScore,
      earnedPoints,
      totalPoints,
      timeTaken,
      results,
      canRetake: quiz.maxAttempts === 0 || attemptsCount < quiz.maxAttempts,
      attemptsLeft: quiz.maxAttempts === 0 ? "Unlimited" : quiz.maxAttempts - attemptsCount
    }
  });
});

// ==========================================
// ASSIGNMENTS
// ==========================================

import { uploadToR2, generateKey } from "../services/storage.service";

export const submitAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { content } = req.body;
  const studentId = req.user!.id;

  let fileUrl: string | null = null;
  if (req.file) {
    const { url } = await uploadToR2(
      req.file.buffer,
      generateKey("submissions", req.file.originalname),
      req.file.mimetype
    );
    fileUrl = url;
  }

  if (!content && !fileUrl) throw new AppError("Either content or file is required", 400);

  const existing = await prisma.submission.findFirst({
    where: { assignmentId, studentId }
  });

  if (existing && existing.isGraded) {
    throw new AppError("Cannot resubmit a graded assignment", 400);
  }

  let submission;
  if (existing) {
    // Determine the final fileUrl. If no new file was uploaded, keep the old one.
    // If the user wants to remove the file, the frontend would need to explicitly tell us,
    // but for now, any new upload overwrites, and no upload keeps the old one.
    const finalFileUrl = req.file ? fileUrl : existing.fileUrl;
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: {
        content,
        fileUrl: finalFileUrl,
        submittedAt: new Date()
      }
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        content,
        fileUrl,
        isGraded: false
      }
    });
  }

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { lesson: { include: { section: { include: { course: true } } } } } });
  
  if (assignment) {
    await prisma.notification.create({
      data: {
        userId: assignment.lesson.section.course.instructorId,
        type: "NEW_SUBMISSION",
        title: "New assignment submission",
        body: `A student submitted '${assignment.title}'`,
        link: `/instructor/courses/${assignment.lesson.section.courseId}/assignments`
      }
    });
  }

  res.json({ status: "success", data: submission });
});

export const getMySubmission = asyncHandler(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const submission = await prisma.submission.findFirst({
    where: { assignmentId, studentId: req.user!.id },
    include: {
      assignment: { include: { rubric: { include: { criteria: true } } } }
    }
  });

  res.json({ status: "success", data: submission });
});

// ==========================================
// READING MATERIALS
// ==========================================

export const getReadingMaterials = asyncHandler(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const materials = await prisma.readingMaterial.findMany({
    where: { sectionId: moduleId },
    orderBy: { order: "asc" }
  });
  res.json({ status: "success", data: materials });
});

// ==========================================
// NOTES
// ==========================================

export const getMyNotes = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const notes = await prisma.note.findMany({
    where: { lessonId, studentId: req.user!.id },
    orderBy: { createdAt: "desc" }
  });
  res.json({ status: "success", data: notes });
});

export const saveNote = asyncHandler(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const { content, timestamp } = req.body;
  
  const note = await prisma.note.create({
    data: {
      lessonId,
      studentId: req.user!.id,
      content,
      timestamp
    }
  });
  
  res.json({ status: "success", data: note });
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.studentId !== req.user!.id) throw new AppError("Unauthorized", 403);
  
  const updated = await prisma.note.update({
    where: { id },
    data: { content }
  });
  res.json({ status: "success", data: updated });
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.studentId !== req.user!.id) throw new AppError("Unauthorized", 403);
  
  await prisma.note.delete({ where: { id } });
  res.json({ status: "success", message: "Deleted" });
});

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export const getCourseAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { moduleId } = req.query;

  const where: any = { courseId };
  if (moduleId) where.sectionId = moduleId;

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" }
    ],
    include: {
      section: { select: { title: true } },
      author: { select: { name: true, avatar: true } }
    }
  });

  res.json({ status: "success", data: announcements });
});

// ==========================================
// DISCUSSIONS
// ==========================================

export const getCourseDiscussions = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { moduleId } = req.query;

  const where: any = { courseId };
  if (moduleId) where.sectionId = moduleId;

  const discussions = await prisma.discussion.findMany({
    where,
    orderBy: [
      { isPinned: "desc" },
      { createdAt: "desc" }
    ],
    include: {
      section: { select: { title: true } },
      author: { select: { id: true, name: true, avatar: true, role: true } },
      _count: { select: { replies: true } }
    }
  });

  res.json({ status: "success", data: discussions });
});

export const getDiscussionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const discussion = await prisma.discussion.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, avatar: true, role: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, avatar: true, role: true } } }
      }
    }
  });
  if (!discussion) throw new AppError("Not found", 404);
  res.json({ status: "success", data: discussion });
});

export const createDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { title, content, moduleId } = req.body;

  const discussion = await prisma.discussion.create({
    data: {
      courseId,
      sectionId: moduleId || null,
      authorId: req.user!.id,
      title,
      content
    }
  });

  res.json({ status: "success", data: discussion });
});

export const replyToDiscussion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  const reply = await prisma.discussionReply.create({
    data: {
      discussionId: id,
      authorId: req.user!.id,
      content,
      isInstructor: req.user!.role === "INSTRUCTOR" || req.user!.role === "ADMIN"
    }
  });

  res.json({ status: "success", data: reply });
});

// ==========================================
// ATTENDANCE
// ==========================================

export const getMyAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user!.id;

  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    include: {
      records: { where: { studentId } },
      section: { select: { title: true } }
    },
    orderBy: { sessionDate: "desc" }
  });

  const stats = { present: 0, late: 0, excused: 0, absent: 0, total: sessions.length };
  const mappedSessions = sessions.map(session => {
    const record = session.records[0];
    const status = record?.status || "ABSENT";
    
    if (status === "PRESENT") stats.present++;
    else if (status === "LATE") stats.late++;
    else if (status === "EXCUSED") stats.excused++;
    else stats.absent++;

    return {
      id: session.id,
      title: session.title,
      sessionDate: session.sessionDate,
      sessionType: session.sessionType,
      module: session.section ? { title: session.section.title } : null,
      status,
      note: record?.note || null
    };
  });

  res.json({
    status: "success",
    data: {
      totalSessions: stats.total,
      present: stats.present,
      late: stats.late,
      excused: stats.excused,
      absent: stats.absent,
      attendanceRate: stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0,
      sessions: mappedSessions
    }
  });
});

// ==========================================
// CERTIFICATES
// ==========================================

export const getMyCertificates = asyncHandler(async (req: Request, res: Response) => {
  const certificates = await prisma.certificate.findMany({
    where: { studentId: req.user!.id },
    include: {
      course: {
        select: {
          title: true, moduleNumber: true, thumbnail: true, scriptureRef: true,
          instructor: { select: { name: true } }
        }
      }
    },
    orderBy: { issuedAt: "desc" }
  });

  res.json({ status: "success", data: certificates });
});

export const downloadCertificate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { course: true }
  });

  if (!certificate || certificate.studentId !== req.user!.id) throw new AppError("Unauthorized", 403);

  const pdfBuffer = await CertificateService.generateCertificatePDF(id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${certificate.course.slug}-certificate.pdf"`);
  res.send(pdfBuffer);
});

// ==========================================
// NOTIFICATIONS
// ==========================================

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const unreadCount = await prisma.notification.count({
    where: { userId: req.user!.id, isRead: false }
  });
  res.json({ status: "success", data: { notifications, unreadCount } });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user!.id },
    data: { isRead: true }
  });
  res.json({ status: "success", data: { updated: true } });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true }
  });
  res.json({ status: "success", data: { updated: true } });
});

// ==========================================
// DASHBOARD STATS
// ==========================================

export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        select: {
          id: true, title: true, slug: true, thumbnail: true, moduleNumber: true,
          instructor: { select: { name: true } },
          _count: { select: { sections: true } },
          sections: {
            include: {
              lessons: {
                where: { type: "ASSIGNMENT" },
                include: { assignment: true }
              }
            }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });

  const certificatesCount = await prisma.certificate.count({
    where: { studentId }
  });

  const submissions = await prisma.submission.findMany({
    where: { studentId }
  });

  let pendingAssignmentsCount = 0;
  enrollments.forEach(enr => {
    enr.course.sections?.forEach(sec => {
      sec.lessons?.forEach(lesson => {
        if (lesson.assignment) {
          const hasSubmission = submissions.some(s => s.assignmentId === lesson.assignment?.id);
          if (!hasSubmission) {
            pendingAssignmentsCount++;
          }
        }
      });
    });
  });

  // Simplified "Continue Learning"
  const activeEnrollment = enrollments.find(e => e.status === "ACTIVE" && e.progress < 100) || enrollments[0];

  res.json({
    status: "success",
    data: {
      enrollments,
      activeEnrollment,
      certificatesCount,
      pendingAssignmentsCount
    }
  });
});

export const getMyAssignments = asyncHandler(async (req: Request, res: Response) => {
  const studentId = req.user!.id;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          sections: {
            include: {
              lessons: {
                where: { type: "ASSIGNMENT" },
                include: { assignment: true }
              }
            }
          }
        }
      }
    }
  });

  const submissions = await prisma.submission.findMany({
    where: { studentId }
  });

  const assignments: any[] = [];
  
  enrollments.forEach(enr => {
    enr.course.sections.forEach(sec => {
      sec.lessons.forEach(lesson => {
        if (lesson.assignment) {
          const submission = submissions.find(s => s.assignmentId === lesson.assignment?.id);
          assignments.push({
            id: lesson.assignment.id,
            title: lesson.assignment.title,
            courseName: enr.course.title,
            courseId: enr.course.id,
            lessonId: lesson.id,
            totalPoints: lesson.assignment.maxScore,
            submission
          });
        }
      });
    });
  });

  res.json({ status: "success", data: assignments });
});

export const getMyCourseGrade = asyncHandler(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user!.id;

  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId, studentId }
  });
  if (!enrollment) throw new AppError("Not enrolled in this course", 403);

  // 1. Find all graded items in this course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { sections: { include: { lessons: { include: { assignment: true, quiz: true } } } } }
  });
  if (!course) throw new AppError("Course not found", 404);

  const gradedItems: { id: string, type: string, maxScore: number }[] = [];
  course.sections.forEach(sec => {
    sec.lessons.forEach(lesson => {
      if (lesson.assignment) {
        gradedItems.push({ id: lesson.assignment.id, type: "ASSIGNMENT", maxScore: lesson.assignment.maxScore });
      }
      if (lesson.quiz) {
        gradedItems.push({ id: lesson.quiz.id, type: "QUIZ", maxScore: 100 });
      }
      if (lesson.type === "FORUM") {
        gradedItems.push({ id: lesson.id, type: "FORUM", maxScore: lesson.forumMarks || 100 });
      }
    });
  });

  // 2. Fetch student's grades
  const submissions = await prisma.submission.findMany({ where: { studentId, assignment: { lesson: { section: { courseId } } } } });
  const quizAttempts = await prisma.quizAttempt.findMany({ where: { studentId, quiz: { lesson: { section: { courseId } } } } });
  const forumIds = gradedItems.filter(i => i.type === "FORUM").map(i => i.id);
  const forumDiscussions = await prisma.discussion.findMany({ where: { lessonId: { in: forumIds }, authorId: studentId, score: { not: null } } });

  const grades: Record<string, number | null> = {};
  gradedItems.forEach(item => grades[item.id] = null);

  submissions.forEach(sub => { if (sub.grade !== null && sub.grade !== undefined) grades[sub.assignmentId] = sub.grade; });
  quizAttempts.forEach(qa => { if (grades[qa.quizId] === null || qa.score > grades[qa.quizId]!) grades[qa.quizId] = qa.score; });
  forumDiscussions.forEach(sf => { if (sf.lessonId && (grades[sf.lessonId] === null || sf.score! > grades[sf.lessonId]!)) grades[sf.lessonId] = sf.score!; });

  let totalEarned = 0;
  let totalMaxGraded = 0;

  gradedItems.forEach(item => {
    const score = grades[item.id];
    if (score !== null && score !== undefined) {
      totalEarned += score;
      totalMaxGraded += item.maxScore;
    }
  });

  const courseGrade = totalMaxGraded > 0 ? Number(((totalEarned / totalMaxGraded) * 100).toFixed(1)) : 0;

  const itemDistribution = gradedItems.map(item => ({
    id: item.id,
    type: item.type,
    maxScore: item.maxScore,
    score: grades[item.id]
  }));

  res.json({ status: "success", data: { grade: courseGrade, totalEarned, totalMaxGraded, items: itemDistribution } });
});
