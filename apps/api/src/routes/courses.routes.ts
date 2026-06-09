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



// Removed duplicate Assignment routes; Phase 4 implementation below handles these.

// Forum
router.get("/courses/:id/forum/posts", authenticate, CC.getForumPosts);
router.post("/courses/:id/forum/posts", authenticate, CC.createForumPost);
router.put("/forum/posts/:postId/pin", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.pinForumPost);
router.delete("/forum/posts/:postId", authenticate, CC.deleteForumPost);
router.post("/forum/posts/:postId/replies", authenticate, CC.createForumReply);
router.delete("/forum/replies/:replyId", authenticate, CC.deleteForumReply);

// Instructor-specific
router.get("/instructor/courses", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getMyCourses);
router.get("/instructor/stats", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getInstructorStats);
router.get("/instructor/courses/:id/analytics", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getCourseAnalytics);
router.get("/instructor/assignments", authenticate, authorize("INSTRUCTOR"), CC.getInstructorAssignments);

import * as MC from "../controllers/modules.controller";

// ─── Phase 4: Modules & Content ──────────────────────────────────────────────
router.post("/courses/:id/modules", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createModule);
router.get("/courses/:id/modules", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getModules);
router.put("/courses/:id/modules/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.reorderModules);
router.put("/courses/:id/modules/:moduleId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateModule);
router.delete("/courses/:id/modules/:moduleId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteModule);

router.post("/modules/:moduleId/lessons", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createLesson);
router.put("/modules/:moduleId/lessons/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.reorderLessons);
router.put("/lessons/:lessonId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateLesson);
router.delete("/lessons/:lessonId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteLesson);

// Videos
router.post("/lessons/:lessonId/upload-video", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("video"), MC.uploadVideoToLesson);
router.get("/lessons/:lessonId/video-status", authenticate, MC.getLessonVideoStatus);

// Reading Materials
router.post("/modules/:moduleId/reading-materials", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("file"), MC.createReadingMaterial);
router.get("/modules/:moduleId/reading-materials", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getReadingMaterials);
router.put("/reading-materials/:id", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateReadingMaterial);
router.delete("/reading-materials/:id", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteReadingMaterial);
router.put("/modules/:moduleId/reading-materials/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.reorderReadingMaterials);

// Quizzes
router.post("/modules/:moduleId/quiz", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createQuiz);
router.get("/modules/:moduleId/quizzes", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getQuizzes);
router.put("/quizzes/:quizId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateQuiz);
router.delete("/quizzes/:quizId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteQuiz);

router.post("/quizzes/:quizId/questions", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createQuestion);
router.put("/questions/:questionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateQuestion);
router.delete("/questions/:questionId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteQuestion);
router.put("/quizzes/:quizId/questions/reorder", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.reorderQuestions);

// Assignments
router.post("/modules/:moduleId/assignment", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createAssignment);
router.get("/modules/:moduleId/assignments", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getAssignments);
router.put("/assignments/:assignmentId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateAssignment);
router.delete("/assignments/:assignmentId", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.deleteAssignment);
router.post("/assignments/:assignmentId/upload-attachment", authenticate, authorize("INSTRUCTOR", "ADMIN"), upload.single("file"), MC.uploadAssignmentAttachment);
router.get("/assignments/:assignmentId/submissions", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.gradeSubmission);

router.get("/courses/:id/rubrics", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getCourseRubrics);
router.post("/courses/:id/rubrics", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.createRubric);

router.get("/courses/:id/curriculum", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.getCurriculum);
router.put("/courses/:id/curriculum", authenticate, authorize("INSTRUCTOR", "ADMIN"), MC.updateCurriculum);
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

// Announcements
router.get("/courses/:id/announcements", authenticate, CC.getCourseAnnouncements);
router.get("/instructor/courses/:id/announcements", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.getInstructorAnnouncements);
router.post("/instructor/courses/:id/announcements", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.createAnnouncement);
router.delete("/instructor/courses/:id/announcements/:announcementId", authenticate, authorize("INSTRUCTOR", "ADMIN"), CC.deleteAnnouncement);

export default router;
