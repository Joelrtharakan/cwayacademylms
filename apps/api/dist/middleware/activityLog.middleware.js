"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = auditLog;
exports.errorLog = errorLog;
const prisma_1 = require("../utils/prisma");
// ─── Helpers ─────────────────────────────────────────────────────────────────
/**
 * Derives a human-readable action label from the HTTP method + URL path.
 */
function deriveAction(method, path) {
    const lowerPath = path.toLowerCase();
    if (method === "DELETE") {
        if (lowerPath.includes("/students"))
            return "UNENROLL";
        return "DELETE";
    }
    if (method === "POST") {
        if (lowerPath.includes("/approve"))
            return "APPROVE";
        if (lowerPath.includes("/reject"))
            return "REJECT";
        if (lowerPath.includes("/ban"))
            return "BAN";
        if (lowerPath.includes("/unban"))
            return "UNBAN";
        if (lowerPath.includes("/refund"))
            return "REFUND";
        if (lowerPath.includes("/broadcast"))
            return "BROADCAST";
        if (lowerPath.includes("/impersonate"))
            return "IMPERSONATE";
        if (lowerPath.includes("/assign-instructor"))
            return "UPDATE";
        if (lowerPath.includes("/feature"))
            return "UPDATE";
        if (lowerPath.includes("/link"))
            return "UPDATE";
        if (lowerPath.includes("/attempt"))
            return "QUIZ_ATTEMPT";
        if (lowerPath.includes("/submit") && lowerPath.includes("/quizzes"))
            return "QUIZ_SUBMIT";
        if (lowerPath.includes("/submit") && lowerPath.includes("/assignments"))
            return "ASSIGNMENT_SUBMIT";
        if (lowerPath.includes("/unsubmit") && lowerPath.includes("/assignments"))
            return "ASSIGNMENT_UNSUBMIT";
        if (lowerPath.includes("/complete") && lowerPath.includes("/lessons"))
            return "LESSON_COMPLETE";
        if (lowerPath.includes("/grade"))
            return "GRADE";
        if (lowerPath.includes("/submit-review"))
            return "SUBMIT_REVIEW";
        if (lowerPath.includes("/enrollments"))
            return "ENROLL";
        if (lowerPath.includes("/discussions"))
            return "DISCUSSION_POST";
        if (lowerPath.includes("/replies"))
            return "DISCUSSION_REPLY";
        return "CREATE";
    }
    if (method === "PUT" || method === "PATCH")
        return "UPDATE";
    return method;
}
/**
 * Derives the resource type from the URL path segment.
 * e.g. /api/v1/admin/users/123 -> "user"
 */
function deriveResource(path) {
    // Strip query string
    const cleanPath = path.split("?")[0];
    // Remove /api/v1/admin/ prefix
    const segments = cleanPath.replace(/^\/api\/v\d+\/admin\/?/, "").split("/").filter(Boolean);
    if (segments.length === 0)
        return { resource: null, resourceId: null };
    if (cleanPath.includes("/courses/") && cleanPath.includes("/students/")) {
        const studentId = segments[segments.length - 1];
        return { resource: "student", resourceId: studentId };
    }
    const resourceMap = {
        users: "user",
        courses: "course",
        categories: "category",
        payments: "payment",
        sponsorships: "sponsorship",
        coupons: "coupon",
        "certificate-templates": "certificate_template",
        "email-templates": "email_template",
        notifications: "notification",
        settings: "settings",
        programs: "program",
        applications: "application",
        instructors: "instructor",
        blog: "blog_post",
        certificates: "certificate",
        modules: "module",
        lessons: "lesson",
        quizzes: "quiz",
        assignments: "assignment",
        submissions: "submission",
        discussions: "discussion",
        enrollments: "enrollment",
        "reading-materials": "reading_material",
        rubrics: "rubric",
        announcements: "announcement",
    };
    // Determine the primary resource type from path segments
    // For nested routes like /courses/1/modules, we want "module" not "course"
    // E.g., /api/v1/courses/1/modules -> segments: ["courses", "1", "modules"]
    let resourceSegment = segments[0];
    let idSegmentIndex = 1;
    for (let i = segments.length - 1; i >= 0; i--) {
        const s = segments[i];
        // skip action keywords
        if (["reorder", "approve", "reject", "ban", "unban", "refund", "broadcast", "impersonate", "feature", "link", "assign-instructor", "export", "preview", "test", "students", "grades", "courses", "download", "attempt", "submit", "unsubmit", "complete", "grade", "submit-review", "replies", "progress", "my-attempts", "my-submission", "my-notes", "my-attendance", "my", "read-all", "read", "upload-video", "upload-attachment", "upload-avatar", "accept", "decline", "status", "request", "my-requests", "upload-thumbnail", "upload-promo-video"].includes(s)) {
            continue;
        }
        // If it looks like a CUID or UUID or number, it's an ID
        const isId = s.length >= 24 || !isNaN(Number(s)) || s.startsWith('c');
        if (!isId) {
            resourceSegment = s;
            idSegmentIndex = i + 1;
            break;
        }
    }
    const resource = resourceMap[resourceSegment] ?? resourceSegment;
    const maybeId = segments[idSegmentIndex];
    const isId = maybeId &&
        !["reorder", "approve", "reject", "ban", "unban", "refund", "broadcast", "impersonate", "feature", "link", "assign-instructor", "export", "preview", "test", "students", "grades", "courses", "download", "attempt", "submit", "unsubmit", "complete", "grade", "submit-review", "replies", "progress", "my-attempts", "my-submission", "my-notes", "my-attendance", "my", "read-all", "read", "upload-video", "upload-attachment", "upload-avatar", "accept", "decline", "status", "request", "my-requests", "upload-thumbnail", "upload-promo-video"].includes(maybeId);
    return {
        resource,
        resourceId: isId ? maybeId : null,
    };
}
function buildDescription(action, resource, resourceId) {
    const res = resource ? resource.replace(/_/g, " ") : "resource";
    const id = resourceId ? ` (${resourceId.slice(0, 8)}…)` : "";
    const labels = {
        CREATE: `Created ${res}${id}`,
        UPDATE: `Updated ${res}${id}`,
        DELETE: `Deleted ${res}${id}`,
        APPROVE: `Approved ${res}${id}`,
        REJECT: `Rejected ${res}${id}`,
        BAN: `Banned user${id}`,
        UNBAN: `Unbanned user${id}`,
        REFUND: `Issued refund for payment${id}`,
        BROADCAST: `Broadcast notification`,
        IMPERSONATE: `Impersonated user${id}`,
        QUIZ_ATTEMPT: `Started quiz attempt${id}`,
        QUIZ_SUBMIT: `Submitted quiz${id}`,
        ASSIGNMENT_SUBMIT: `Submitted assignment${id}`,
        ASSIGNMENT_UNSUBMIT: `Unsubmitted assignment${id}`,
        LESSON_COMPLETE: `Completed lesson${id}`,
        GRADE: `Graded submission${id}`,
        SUBMIT_REVIEW: `Submitted course for review${id}`,
        ENROLL: `Enrolled in course`,
        UNENROLL: `Unenrolled student${id} from course`,
        DISCUSSION_POST: `Posted discussion`,
        DISCUSSION_REPLY: `Replied to discussion`,
        ERROR: `API Error`,
    };
    return labels[action] ?? `${action} on ${res}${id}`;
}
// ─── Middleware ───────────────────────────────────────────────────────────────
/**
 * Attach this middleware to admin mutation routes.
 * It logs the action *after* the response finishes so it never blocks the request.
 */
function auditLog(req, res, next) {
    // Only log mutating methods
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        return next();
    }
    res.on("finish", async () => {
        try {
            // Only log successful (2xx) responses
            if (res.statusCode < 200 || res.statusCode >= 300)
                return;
            const actor = req.user;
            if (!actor)
                return; // nothing to attribute to
            const action = deriveAction(req.method, req.originalUrl);
            const { resource, resourceId } = deriveResource(req.originalUrl);
            const description = buildDescription(action, resource, resourceId);
            // Fetch actor name (fire-and-forget, we already have id + email from token)
            const actorUser = await prisma_1.prisma.user.findUnique({
                where: { id: actor.id },
                select: { name: true },
            });
            // @ts-ignore: activityLog exists at runtime; ts-node type cache lag after db push
            await prisma_1.prisma.activityLog.create({
                data: {
                    userId: actor.id,
                    actorEmail: actor.email,
                    actorName: actorUser?.name ?? null,
                    actorRole: actor.role,
                    action,
                    resource,
                    resourceId,
                    description,
                    ipAddress: (req.ip ?? "").replace("::ffff:", ""),
                    userAgent: req.headers["user-agent"] ?? null,
                    status: "SUCCESS",
                },
            });
        }
        catch (_err) {
            // Never let logging crash the server
        }
    });
    next();
}
/**
 * Middleware for logging unhandled API errors.
 */
function errorLog(err, req, res, next) {
    if (req.user) {
        const { resource } = deriveResource(req.originalUrl);
        // @ts-ignore
        prisma_1.prisma.activityLog.create({
            data: {
                userId: req.user.id,
                actorEmail: req.user.email,
                actorRole: req.user.role,
                action: "ERROR",
                resource: resource,
                description: `${req.method} ${req.originalUrl} → ${err.message}`,
                ipAddress: (req.ip ?? "").replace("::ffff:", ""),
                status: "FAILED",
            }
        }).catch(() => { });
    }
    next(err);
}
