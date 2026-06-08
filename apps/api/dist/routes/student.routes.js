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
const authenticate_1 = require("../middleware/authenticate");
const studentCtrl = __importStar(require("../controllers/student.controller"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)(); // Mock multer since S3 integration handles real uploads elsewhere, or use it for parsing multipart forms
router.use(authenticate_1.authenticate);
// Progress
router.get("/courses/:courseId/learn", studentCtrl.getCourseEnrollment);
router.get("/enrollments/:enrollmentId/progress", studentCtrl.getProgress);
router.post("/enrollments/:enrollmentId/lessons/:lessonId/complete", studentCtrl.completeLesson);
router.post("/enrollments/:enrollmentId/lessons/:lessonId/progress", studentCtrl.saveWatchProgress);
// Quizzes
router.get("/quizzes/:quizId/my-attempts", studentCtrl.getMyQuizAttempts);
router.post("/quizzes/:quizId/attempt", studentCtrl.attemptQuiz);
router.post("/quizzes/:quizId/submit", studentCtrl.submitQuiz);
// Assignments
router.get("/assignments/:assignmentId/my-submission", studentCtrl.getMySubmission);
router.post("/assignments/:assignmentId/submit", upload.single("file"), studentCtrl.submitAssignment);
// Readings
router.get("/modules/:moduleId/reading-materials", studentCtrl.getReadingMaterials);
// Notes
router.get("/lessons/:lessonId/my-notes", studentCtrl.getMyNotes);
router.post("/lessons/:lessonId/notes", studentCtrl.saveNote);
router.put("/notes/:id", studentCtrl.updateNote);
router.delete("/notes/:id", studentCtrl.deleteNote);
// Announcements & Discussions
router.get("/courses/:courseId/announcements", studentCtrl.getCourseAnnouncements);
router.get("/courses/:courseId/discussions", studentCtrl.getCourseDiscussions);
router.post("/courses/:courseId/discussions", studentCtrl.createDiscussion);
router.get("/discussions/:id", studentCtrl.getDiscussionById);
router.post("/discussions/:id/replies", studentCtrl.replyToDiscussion);
// Attendance
router.get("/courses/:courseId/my-attendance", studentCtrl.getMyAttendance);
// Certificates
router.get("/certificates/my", studentCtrl.getMyCertificates);
router.get("/certificates/:id/download", studentCtrl.downloadCertificate);
// Notifications
router.get("/notifications", studentCtrl.getMyNotifications);
router.put("/notifications/read-all", studentCtrl.markAllNotificationsRead);
router.put("/notifications/:id/read", studentCtrl.markNotificationRead);
// Dashboard Dashboard
router.get("/dashboard", studentCtrl.getStudentDashboard);
exports.default = router;
