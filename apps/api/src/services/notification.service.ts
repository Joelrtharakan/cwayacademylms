import { prisma } from "../utils/prisma";

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
    return prisma.notification.create({
      data: { userId, type, title, body, link },
    });
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

    return { count: userIds.length };
  }
}
