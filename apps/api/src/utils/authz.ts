import { prisma } from "./prisma";
import { AppError } from "./errors";

/**
 * Authorization Helpers to prevent IDOR
 */

export async function verifyCourseOwner(courseId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) throw new AppError("Course not found", 404);
  if (course.instructorId !== user.id) throw new AppError("Not authorized to modify this course", 403);
}

export async function verifySectionOwner(sectionId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const section = await prisma.section.findUnique({ where: { id: sectionId }, select: { course: { select: { instructorId: true } } } });
  if (!section) throw new AppError("Section not found", 404);
  if (section.course.instructorId !== user.id) throw new AppError("Not authorized to modify this section", 403);
}

export async function verifyLessonOwner(lessonId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { section: { select: { course: { select: { instructorId: true } } } } } });
  if (!lesson) throw new AppError("Lesson not found", 404);
  if (lesson.section.course.instructorId !== user.id) throw new AppError("Not authorized to modify this lesson", 403);
}

export async function verifyQuizOwner(quizId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } });
  if (!quiz) throw new AppError("Quiz not found", 404);
  if (quiz.lesson.section.course.instructorId !== user.id) throw new AppError("Not authorized to modify this quiz", 403);
}

export async function verifyQuestionOwner(questionId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      quiz: { select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } }
    }
  });
  if (!question) throw new AppError("Question not found", 404);
  if (question.quiz.lesson.section.course.instructorId !== user.id) throw new AppError("Not authorized to modify this question", 403);
}

export async function verifyAssignmentOwner(assignmentId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } }
    }
  });
  if (!assignment) throw new AppError("Assignment not found", 404);
  if (assignment.lesson.section.course.instructorId !== user.id) throw new AppError("Not authorized to modify this assignment", 403);
}

export async function verifySubmissionOwner(submissionId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      assignment: { select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } }
    }
  });
  if (!submission) throw new AppError("Submission not found", 404);
  if (submission.assignment.lesson.section.course.instructorId !== user.id) throw new AppError("Not authorized to grade this submission", 403);
}

export async function verifyForumAccess(courseId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) throw new AppError("Course not found", 404);
  
  if (course.instructorId === user.id) return; // Instructor has access
  
  // Check if student is enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: user.id, courseId } }
  });
  
  if (!enrollment) throw new AppError("You must be enrolled to participate in the forum", 403);
}

export async function verifyForumPostOwnerOrInstructor(postId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true, forum: { select: { course: { select: { instructorId: true } } } } } });
  if (!post) throw new AppError("Post not found", 404);
  
  if (post.authorId !== user.id && post.forum.course.instructorId !== user.id) {
    throw new AppError("Not authorized to modify this post", 403);
  }
}

export async function verifyForumReplyOwnerOrInstructor(replyId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const reply = await prisma.forumReply.findUnique({ where: { id: replyId }, select: { authorId: true, post: { select: { forum: { select: { course: { select: { instructorId: true } } } } } } } });
  if (!reply) throw new AppError("Reply not found", 404);
  
  if (reply.authorId !== user.id && reply.post.forum.course.instructorId !== user.id) {
    throw new AppError("Not authorized to modify this reply", 403);
  }
}

export async function verifyForumAccessFromPost(postId: string, user: { id: string; role: string }) {
  if (user.role === "ADMIN") return;
  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { forum: { select: { courseId: true } } } });
  if (!post) throw new AppError("Post not found", 404);
  await verifyForumAccess(post.forum.courseId, user);
}
