"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const CC = __importStar(require("../controllers/courses.controller"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// ── PUBLIC ──────────────────────────────────────────────────────────────────
router.get("/courses", (req, res, next) => { try {
    (0, authenticate_1.authenticate)(req, res, () => next());
}
catch {
    next();
} }, CC.listCourses);
router.get("/courses/:id", (req, res, next) => { try {
    (0, authenticate_1.authenticate)(req, res, () => next());
}
catch {
    next();
} }, CC.getCourse);
router.get("/categories", CC.getPublicCategories);
// ── INSTRUCTOR / ADMIN ───────────────────────────────────────────────────────
router.post("/courses", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.createCourse);
router.put("/courses/:id", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateCourse);
router.delete("/courses/:id", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.deleteCourseInstructor);
router.post("/courses/:id/submit-review", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR"), CC.submitForReview);
router.post("/courses/:id/duplicate", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.duplicateCourse);
// Uploads
router.post("/courses/:id/upload-thumbnail", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), upload.single("thumbnail"), CC.uploadThumbnail);
router.post("/courses/:id/upload-promo-video", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), upload.single("video"), CC.uploadPromoVideo);
// Sections
router.post("/courses/:id/sections", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.createSection);
router.put("/courses/:id/sections/:sectionId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateSection);
router.delete("/courses/:id/sections/:sectionId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.deleteSection);
router.put("/courses/:id/sections/reorder", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.reorderSections);
// Lessons
router.post("/sections/:sectionId/lessons", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.createLesson);
router.put("/lessons/:lessonId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateLesson);
router.delete("/lessons/:lessonId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.deleteLesson);
router.put("/sections/:sectionId/lessons/reorder", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.reorderLessons);
router.post("/lessons/:lessonId/upload-video", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), upload.single("video"), CC.uploadLessonVideo);
router.get("/lessons/:lessonId/video-status", authenticate_1.authenticate, CC.getLessonVideoStatus);
router.post("/lessons/:lessonId/upload-attachment", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), upload.single("attachment"), CC.uploadLessonAttachment);
// Quiz
router.post("/lessons/:lessonId/quiz", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.createQuiz);
router.put("/quizzes/:quizId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateQuiz);
router.post("/quizzes/:quizId/questions", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.addQuestion);
router.put("/questions/:questionId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateQuestion);
router.delete("/questions/:questionId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.deleteQuestion);
router.put("/quizzes/:quizId/questions/reorder", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.reorderQuestions);
router.get("/quizzes/:quizId/attempts", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.getQuizAttempts);
router.get("/quizzes/:quizId/stats", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.getQuizStats);
// Assignment
router.post("/lessons/:lessonId/assignment", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.createAssignment);
router.put("/assignments/:assignmentId", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.updateAssignment);
router.get("/assignments/:assignmentId/submissions", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.gradeSubmission);
// Forum
router.get("/courses/:id/forum/posts", authenticate_1.authenticate, CC.getForumPosts);
router.post("/courses/:id/forum/posts", authenticate_1.authenticate, CC.createForumPost);
router.put("/forum/posts/:postId/pin", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.pinForumPost);
router.delete("/forum/posts/:postId", authenticate_1.authenticate, CC.deleteForumPost);
router.post("/forum/posts/:postId/replies", authenticate_1.authenticate, CC.createForumReply);
router.delete("/forum/replies/:replyId", authenticate_1.authenticate, CC.deleteForumReply);
// Instructor-specific
router.get("/instructor/stats", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.getInstructorStats);
router.get("/instructor/courses/:id/analytics", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR", "ADMIN"), CC.getCourseAnalytics);
router.get("/instructor/assignments", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR"), CC.getInstructorAssignments);
router.get("/instructor/revenue", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR"), CC.getInstructorRevenue);
router.post("/instructor/payouts/request", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR"), CC.requestPayout);
router.get("/instructor/payouts/history", authenticate_1.authenticate, (0, authorize_1.authorize)("INSTRUCTOR"), CC.getPayoutHistory);
// Messages
router.get("/messages", authenticate_1.authenticate, CC.getConversations);
router.get("/messages/:userId", authenticate_1.authenticate, CC.getMessageThread);
router.post("/messages", authenticate_1.authenticate, CC.sendMessage);
// User profile
router.put("/users/me/profile", authenticate_1.authenticate, CC.updateMyProfile);
router.post("/users/me/upload-avatar", authenticate_1.authenticate, upload.single("avatar"), CC.uploadAvatar);
exports.default = router;
