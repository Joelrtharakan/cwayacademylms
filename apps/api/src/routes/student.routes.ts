import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import * as studentCtrl from "../controllers/student.controller";
import multer from "multer";

const router = Router();
const upload = multer(); // Mock multer since S3 integration handles real uploads elsewhere, or use it for parsing multipart forms

router.use(authenticate);

// Progress
router.post("/enrollments", studentCtrl.enrollInCourse);
router.get("/courses/:courseId/learn", studentCtrl.getCourseEnrollment);
router.get("/enrollments/:enrollmentId/progress", studentCtrl.getProgress);
router.post("/enrollments/:enrollmentId/lessons/:lessonId/complete", studentCtrl.completeLesson);
router.post("/enrollments/:enrollmentId/lessons/:lessonId/progress", studentCtrl.saveWatchProgress);
router.post("/enrollments/:enrollmentId/reading-materials/:materialId/complete", studentCtrl.completeReadingMaterial);

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

export default router;
