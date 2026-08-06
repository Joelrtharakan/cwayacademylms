import { prisma } from "../utils/prisma";
import { redis } from "../utils/redis";

export class NotificationService {
  /**
   * Create a notification for a single user
   */
  public static async createNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    link?: string
  ) {
    const notification = await prisma.notification.create({
      data: { userId, type, title, body, link },
    });
    // Invalidate the recipient's cached notifications so the new one (and the
    // unread badge) shows immediately instead of after the 60s cache TTL.
    await redis.del(`notifications:${userId}`).catch(() => {});
    return notification;
  }

  /**
   * Broadcast notification to all users matching a role (or ALL)
   */
  public static async createBroadcastNotification(
    targetRole: "ALL" | "ADMIN" | "INSTRUCTOR" | "STUDENT",
    title: string,
    body: string,
    link?: string,
    targetUserIds?: string[]
  ) {
    let userIds: string[] = [];

    if (targetUserIds && targetUserIds.length > 0) {
      userIds = targetUserIds;
    } else if (targetRole === "ALL") {
      const users = await prisma.user.findMany({ select: { id: true } });
      userIds = users.map((u) => u.id);
    } else {
      const users = await prisma.user.findMany({
        where: { role: targetRole as any },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    if (userIds.length === 0) return { count: 0 };

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, type: "BROADCAST", title, body, link })),
    });

    // Invalidate cached notifications for every recipient.
    await Promise.all(
      userIds.map((userId) => redis.del(`notifications:${userId}`).catch(() => {}))
    );

    return { count: userIds.length };
  }
}
