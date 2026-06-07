import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import * as CC from "../controllers/courses.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.get("/courses", (req, res, next) => { try { authenticate(req, res, () => next()); } catch { next(); } }, CC.listCourses);
router.get("/courses/:id", (req, res, next) => { try { authenticate(req, res, () => next()); } catch { next(); } }, CC.getCourse);
router.get("/categories", CC.getPublicCategories);

// ── INSTRUCTOR / ADMIN ───────────────────────────────────────────────────────
router.post("/courses", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createCourse);
router.put("/courses/:id", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateCourse);
router.delete("/courses/:id", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.deleteCourseInstructor);
router.post("/courses/:id/submit-review", authenticate, authorize("INSTRUCTOR"), CC.submitForReview);
router.post("/courses/:id/duplicate", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.duplicateCourse);

// Uploads
router.post("/courses/:id/upload-thumbnail", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("thumbnail"), CC.uploadThumbnail);
router.post("/courses/:id/upload-promo-video", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("video"), CC.uploadPromoVideo);

// Sections
router.post("/courses/:id/sections", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createSection);
router.put("/courses/:id/sections/:sectionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateSection);
router.delete("/courses/:id/sections/:sectionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.deleteSection);
router.put("/courses/:id/sections/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.reorderSections);

// Lessons
router.post("/sections/:sectionId/lessons", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createLesson);
router.put("/lessons/:lessonId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateLesson);
router.delete("/lessons/:lessonId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.deleteLesson);
router.put("/sections/:sectionId/lessons/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.reorderLessons);
router.post("/lessons/:lessonId/upload-video", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("video"), CC.uploadLessonVideo);
router.get("/lessons/:lessonId/video-status", authenticate, CC.getLessonVideoStatus);
router.post("/lessons/:lessonId/upload-attachment", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("attachment"), CC.uploadLessonAttachment);

// Quiz
router.post("/lessons/:lessonId/quiz", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createQuiz);
router.put("/quizzes/:quizId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateQuiz);
router.post("/quizzes/:quizId/questions", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.addQuestion);
router.put("/questions/:questionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateQuestion);
router.delete("/questions/:questionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.deleteQuestion);
router.put("/quizzes/:quizId/questions/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.reorderQuestions);
router.get("/quizzes/:quizId/attempts", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getQuizAttempts);
router.get("/quizzes/:quizId/stats", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getQuizStats);

// Assignment
router.post("/lessons/:lessonId/assignment", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createAssignment);
router.put("/assignments/:assignmentId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.updateAssignment);
router.get("/assignments/:assignmentId/submissions", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.gradeSubmission);

// Forum
router.get("/courses/:id/forum/posts", authenticate, CC.getForumPosts);
router.post("/courses/:id/forum/posts", authenticate, CC.createForumPost);
router.put("/forum/posts/:postId/pin", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.pinForumPost);
router.delete("/forum/posts/:postId", authenticate, CC.deleteForumPost);
router.post("/forum/posts/:postId/replies", authenticate, CC.createForumReply);
router.delete("/forum/replies/:replyId", authenticate, CC.deleteForumReply);

// Instructor-specific
router.get("/instructor/stats", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getInstructorStats);
router.get("/instructor/courses/:id/analytics", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getCourseAnalytics);
router.get("/instructor/assignments", authenticate, authorize("INSTRUCTOR"), CC.getInstructorAssignments);
router.get("/instructor/revenue", authenticate, authorize("INSTRUCTOR"), CC.getInstructorRevenue);
router.post("/instructor/payouts/request", authenticate, authorize("INSTRUCTOR"), CC.requestPayout);
router.get("/instructor/payouts/history", authenticate, authorize("INSTRUCTOR"), CC.getPayoutHistory);

// Messages
router.get("/messages", authenticate, CC.getConversations);
router.get("/messages/:userId", authenticate, CC.getMessageThread);
router.post("/messages", authenticate, CC.sendMessage);

// User profile
router.put("/users/me/profile", authenticate, CC.updateMyProfile);
router.post("/users/me/upload-avatar", authenticate, upload.single("avatar"), CC.uploadAvatar);

export default router;
