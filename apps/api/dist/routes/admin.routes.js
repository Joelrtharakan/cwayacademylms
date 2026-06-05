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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const AdminController = __importStar(require("../controllers/admin.controller"));
const router = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
router.use(authenticate_1.authenticate, (0, authorize_1.authorize)("ADMIN"));
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
router.put("/email-templates/:id", AdminController.updateEmailTemplate);
router.post("/email-templates/:id/preview", AdminController.previewEmailTemplate);
router.post("/email-templates/:id/test", AdminController.testEmailTemplate);
// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
router.get("/notifications", AdminController.getNotifications);
router.post("/notifications/broadcast", AdminController.broadcastNotification);
// ─── SETTINGS ────────────────────────────────────────────────────────────────
router.get("/settings", AdminController.getSettings);
router.put("/settings", AdminController.updateSettings);
exports.default = router;
