"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCourseOwner = verifyCourseOwner;
exports.verifySectionOwner = verifySectionOwner;
exports.verifyLessonOwner = verifyLessonOwner;
exports.verifyQuizOwner = verifyQuizOwner;
exports.verifyQuestionOwner = verifyQuestionOwner;
exports.verifyAssignmentOwner = verifyAssignmentOwner;
exports.verifySubmissionOwner = verifySubmissionOwner;
exports.verifyForumAccess = verifyForumAccess;
exports.verifyForumPostOwnerOrInstructor = verifyForumPostOwnerOrInstructor;
exports.verifyForumReplyOwnerOrInstructor = verifyForumReplyOwnerOrInstructor;
exports.verifyForumAccessFromPost = verifyForumAccessFromPost;
const prisma_1 = require("./prisma");
const errors_1 = require("./errors");
/**
 * Authorization Helpers to prevent IDOR
 */
async function verifyCourseOwner(courseId, user) {
    if (user.role === "ADMIN")
        return;
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this course", 403);
}
async function verifySectionOwner(sectionId, user) {
    if (user.role === "ADMIN")
        return;
    const section = await prisma_1.prisma.section.findUnique({ where: { id: sectionId }, select: { course: { select: { instructorId: true } } } });
    if (!section)
        throw new errors_1.AppError("Section not found", 404);
    if (section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this section", 403);
}
async function verifyLessonOwner(lessonId, user) {
    if (user.role === "ADMIN")
        return;
    const lesson = await prisma_1.prisma.lesson.findUnique({ where: { id: lessonId }, select: { section: { select: { course: { select: { instructorId: true } } } } } });
    if (!lesson)
        throw new errors_1.AppError("Lesson not found", 404);
    if (lesson.section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this lesson", 403);
}
async function verifyQuizOwner(quizId, user) {
    if (user.role === "ADMIN")
        return;
    const quiz = await prisma_1.prisma.quiz.findUnique({ where: { id: quizId }, select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } });
    if (!quiz)
        throw new errors_1.AppError("Quiz not found", 404);
    if (quiz.lesson.section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this quiz", 403);
}
async function verifyQuestionOwner(questionId, user) {
    if (user.role === "ADMIN")
        return;
    const question = await prisma_1.prisma.question.findUnique({
        where: { id: questionId },
        select: {
            quiz: { select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } }
        }
    });
    if (!question)
        throw new errors_1.AppError("Question not found", 404);
    if (question.quiz.lesson.section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this question", 403);
}
async function verifyAssignmentOwner(assignmentId, user) {
    if (user.role === "ADMIN")
        return;
    const assignment = await prisma_1.prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
            lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } }
        }
    });
    if (!assignment)
        throw new errors_1.AppError("Assignment not found", 404);
    if (assignment.lesson.section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to modify this assignment", 403);
}
async function verifySubmissionOwner(submissionId, user) {
    if (user.role === "ADMIN")
        return;
    const submission = await prisma_1.prisma.submission.findUnique({
        where: { id: submissionId },
        select: {
            assignment: { select: { lesson: { select: { section: { select: { course: { select: { instructorId: true } } } } } } } }
        }
    });
    if (!submission)
        throw new errors_1.AppError("Submission not found", 404);
    if (submission.assignment.lesson.section.course.instructorId !== user.id)
        throw new errors_1.AppError("Not authorized to grade this submission", 403);
}
async function verifyForumAccess(courseId, user) {
    if (user.role === "ADMIN")
        return;
    const course = await prisma_1.prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
    if (!course)
        throw new errors_1.AppError("Course not found", 404);
    if (course.instructorId === user.id)
        return; // Instructor has access
    // Check if student is enrolled
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: user.id, courseId } }
    });
    if (!enrollment)
        throw new errors_1.AppError("You must be enrolled to participate in the forum", 403);
}
async function verifyForumPostOwnerOrInstructor(postId, user) {
    if (user.role === "ADMIN")
        return;
    const post = await prisma_1.prisma.forumPost.findUnique({ where: { id: postId }, select: { authorId: true, forum: { select: { course: { select: { instructorId: true } } } } } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    if (post.authorId !== user.id && post.forum.course.instructorId !== user.id) {
        throw new errors_1.AppError("Not authorized to modify this post", 403);
    }
}
async function verifyForumReplyOwnerOrInstructor(replyId, user) {
    if (user.role === "ADMIN")
        return;
    const reply = await prisma_1.prisma.forumReply.findUnique({ where: { id: replyId }, select: { authorId: true, post: { select: { forum: { select: { course: { select: { instructorId: true } } } } } } } });
    if (!reply)
        throw new errors_1.AppError("Reply not found", 404);
    if (reply.authorId !== user.id && reply.post.forum.course.instructorId !== user.id) {
        throw new errors_1.AppError("Not authorized to modify this reply", 403);
    }
}
async function verifyForumAccessFromPost(postId, user) {
    if (user.role === "ADMIN")
        return;
    const post = await prisma_1.prisma.forumPost.findUnique({ where: { id: postId }, select: { forum: { select: { courseId: true } } } });
    if (!post)
        throw new errors_1.AppError("Post not found", 404);
    await verifyForumAccess(post.forum.courseId, user);
}
