"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../utils/prisma");
class NotificationService {
    /**
     * Create a notification for a single user
     */
    static async createNotification(userId, type, title, body, link) {
        return prisma_1.prisma.notification.create({
            data: { userId, type, title, body, link },
        });
    }
    /**
     * Broadcast notification to all users matching a role (or ALL)
     */
    static async createBroadcastNotification(targetRole, title, body, link, targetUserIds) {
        let userIds = [];
        if (targetUserIds && targetUserIds.length > 0) {
            userIds = targetUserIds;
        }
        else if (targetRole === "ALL") {
            const users = await prisma_1.prisma.user.findMany({ select: { id: true } });
            userIds = users.map((u) => u.id);
        }
        else {
            const users = await prisma_1.prisma.user.findMany({
                where: { role: targetRole },
                select: { id: true },
            });
            userIds = users.map((u) => u.id);
        }
        if (userIds.length === 0)
            return { count: 0 };
        await prisma_1.prisma.notification.createMany({
            data: userIds.map((userId) => ({ userId, type: "BROADCAST", title, body, link })),
        });
        return { count: userIds.length };
    }
}
exports.NotificationService = NotificationService;
