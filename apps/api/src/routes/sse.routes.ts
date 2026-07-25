import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/authenticate";
import { prisma } from "../utils/prisma";

/**
 * Server-Sent Events (SSE) for near-real-time notification delivery.
 *
 * Additive and backward-compatible: it does not touch any existing route or the
 * notification create-sites. Each open connection server-side-polls for new
 * notifications for the authenticated user and pushes them down the stream, so
 * clients hold a single connection instead of polling the REST endpoint.
 *
 * Streaming-safety:
 *  - `Cache-Control: no-transform` makes the compression middleware skip this
 *    response (otherwise it would buffer the stream).
 *  - `X-Accel-Buffering: no` disables nginx proxy buffering without config edits.
 */
const router = Router();

const POLL_MS = 8000;
const PING_MS = 25000;

router.get("/notifications", authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  let since = new Date();
  let closed = false;

  const send = (event: string, data: unknown) => {
    if (closed) return;
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send("ready", { at: since.toISOString() });

  const poll = async () => {
    if (closed) return;
    try {
      const items = await prisma.notification.findMany({
        where: { userId, createdAt: { gt: since } },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      if (items.length > 0) {
        since = items[items.length - 1].createdAt;
        for (const n of items) send("notification", n);
        const unreadCount = await prisma.notification.count({
          where: { userId, isRead: false },
        });
        send("unread", { unreadCount });
      }
    } catch {
      // Transient DB/redis hiccup — keep the connection and try next tick.
    }
  };

  const pollTimer = setInterval(poll, POLL_MS);
  const pingTimer = setInterval(() => {
    if (!closed) res.write(": ping\n\n");
  }, PING_MS);

  req.on("close", () => {
    closed = true;
    clearInterval(pollTimer);
    clearInterval(pingTimer);
  });
});

export default router;
