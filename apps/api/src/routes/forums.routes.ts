import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getLessonForums, createForumPost, createForumReply } from "../controllers/forums.controller";

const router = Router();

router.use(authenticate);

router.get("/lessons/:lessonId", getLessonForums);
router.post("/lessons/:lessonId", createForumPost);
router.post("/discussions/:discussionId/replies", createForumReply);

export default router;
