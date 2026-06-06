import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import * as AdminController from "../controllers/admin.controller";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, authorize("ADMIN"));

// ─── STATS ───────────────────────────────────────────────────────────────────
router.get("/stats", AdminController.getStats);

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
router.get("/analytics/revenue", AdminController.getRevenueAnalytics);
router.get("/analytics/users", AdminController.getUserAnalytics);
router.get("/analytics/courses", AdminController.getCourseAnalytics);
router.get("/analytics/enrollments", AdminController.getEnrollmentAnalytics);

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
router.get("/users/export", AdminController.exportUsers);
router.get("/users", AdminController.getUsers);
router.get("/users/:id", AdminController.getUserById);
router.put("/users/:id", AdminController.updateUser);
router.post("/users/:id/ban", AdminController.banUser);
router.post("/users/:id/unban", AdminController.unbanUser);
router.delete("/users/:id", AdminController.deleteUser);
router.post("/users/:id/impersonate", AdminController.impersonateUser);

// ─── INSTRUCTORS ─────────────────────────────────────────────────────────────
router.get("/instructors", AdminController.getInstructors);
router.post("/instructors", AdminController.createInstructor);
router.put("/instructors/:id/payout-percentage", AdminController.updateInstructorPayout);

// ─── COURSE MANAGEMENT ───────────────────────────────────────────────────────
router.get("/courses", AdminController.getCourses);
router.post("/courses/:id/approve", AdminController.approveCourse);
router.post("/courses/:id/reject", AdminController.rejectCourse);
router.put("/courses/:id/feature", AdminController.featureCourse);
router.delete("/courses/:id", AdminController.deleteCourse);

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────────────────────
router.get("/categories", AdminController.getCategories);
router.post("/categories", AdminController.createCategory);
router.put("/categories/reorder", AdminController.reorderCategories);
router.put("/categories/:id", AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

// ─── PAYMENTS ────────────────────────────────────────────────────────────────
router.get("/payments", AdminController.getPayments);
router.post("/payments/:id/refund", AdminController.refundPayment);

// ─── SPONSORSHIPS ────────────────────────────────────────────────────────────
router.get("/sponsorships", AdminController.getSponsorships);
router.put("/sponsorships/:id/link", AdminController.linkSponsorship);

// ─── COUPONS ─────────────────────────────────────────────────────────────────
router.get("/coupons", AdminController.getCoupons);
router.post("/coupons", AdminController.createCoupon);
router.put("/coupons/:id", AdminController.updateCoupon);
router.delete("/coupons/:id", AdminController.deleteCoupon);

// ─── CERTIFICATE TEMPLATES ───────────────────────────────────────────────────
router.get("/certificate-templates", AdminController.getCertificateTemplates);
router.post("/certificate-templates", AdminController.createCertificateTemplate);
router.put("/certificate-templates/:id", AdminController.updateCertificateTemplate);
router.delete("/certificate-templates/:id", AdminController.deleteCertificateTemplate);
router.get("/certificate-templates/:id/preview", AdminController.previewCertificateTemplate);

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────
router.get("/email-templates", AdminController.getEmailTemplates);
router.post("/email-templates", AdminController.createEmailTemplate);
router.put("/email-templates/:id", AdminController.updateEmailTemplate);
router.post("/email-templates/:id/preview", AdminController.previewEmailTemplate);
router.post("/email-templates/:id/test", AdminController.testEmailTemplate);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get("/notifications", AdminController.getNotifications);
router.post("/notifications/broadcast", AdminController.broadcastNotification);

// ─── SETTINGS ────────────────────────────────────────────────────────────────
router.get("/settings", AdminController.getSettings);
router.put("/settings", AdminController.updateSettings);

export default router;
