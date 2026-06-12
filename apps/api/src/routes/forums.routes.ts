import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { getLessonForums, createForumPost, createForumReply, gradeDiscussion, updateDiscussion, deleteDiscussion, updateReply, deleteReply } from "../controllers/forums.controller";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/lessons/:lessonId", getLessonForums);
router.post("/lessons/:lessonId", createForumPost);
router.post("/discussions/:discussionId/replies", createForumReply);
router.post("/discussions/:discussionId/grade", authorize("INSTRUCTOR", "ADMIN"), gradeDiscussion);
router.put("/discussions/:discussionId", updateDiscussion);
router.delete("/discussions/:discussionId", deleteDiscussion);

router.put("/replies/:replyId", updateReply);
router.delete("/replies/:replyId", deleteReply);

export default router;
