import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getLessonForums, createForumPost, createForumReply, gradeDiscussion } from "../controllers/forums.controller";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/lessons/:lessonId", getLessonForums);
router.post("/lessons/:lessonId", createForumPost);
router.post("/discussions/:discussionId/replies", createForumReply);
router.post("/discussions/:discussionId/grade", authorize("INSTRUCTOR", "ADMIN"), gradeDiscussion);

export default router;
