"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
class ExportService {
    /**
     * Convert array of user objects to a CSV string
     */
    static exportUsersCSV(users) {
        const headers = ["Name", "Email", "Role", "Church", "Location", "Language", "Enrolled Courses", "Joined Date", "Status"];
        const rows = users.map((u) => [
            `"${(u.name || "").replace(/"/g, '""')}"`,
            `"${(u.email || "").replace(/"/g, '""')}"`,
            u.role || "",
            `"${(u.church || "").replace(/"/g, '""')}"`,
            `"${(u.location || "").replace(/"/g, '""')}"`,
            u.preferredLanguage || "",
            u._count?.enrollments ?? 0,
            u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "",
            u.isBanned ? "Banned" : u.isVerified ? "Active" : "Unverified",
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
    /**
     * Convert array of payment objects to a CSV string
     */
    static exportPaymentsCSV(payments) {
        const headers = ["ID", "Student Name", "Student Email", "Course", "Amount", "Currency", "Status", "Sponsored", "Date"];
        const rows = payments.map((p) => [
            p.id || "",
            `"${(p.student?.name || "").replace(/"/g, '""')}"`,
            `"${(p.student?.email || "").replace(/"/g, '""')}"`,
            `"${(p.course?.title || "").replace(/"/g, '""')}"`,
            p.amount ?? 0,
            p.currency || "INR",
            p.status || "",
            p.isSponsored ? "Yes" : "No",
            p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : "",
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }
}
exports.ExportService = ExportService;
