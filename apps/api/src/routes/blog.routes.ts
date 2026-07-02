import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { upload } from "../middleware/upload.middleware";
import { cacheRoute } from "../middleware/cache.middleware";
import * as BC from "../controllers/blog.controller";

const router = Router();

// Public
router.get("/posts", cacheRoute(300), BC.getPosts);
router.get("/posts/:slug", cacheRoute(300), BC.getPostBySlug);

// Admin / Instructor
router.post("/posts", authenticate, authorize("ADMIN", "INSTRUCTOR"), BC.createPost);
router.put("/posts/:slug", authenticate, authorize("ADMIN", "INSTRUCTOR"), BC.updatePost);
router.delete("/posts/:slug", authenticate, authorize("ADMIN", "INSTRUCTOR"), BC.deletePost);

// Upload Cover
router.post("/posts/:id/upload-cover", authenticate, authorize("ADMIN", "INSTRUCTOR"), upload.single("cover"), BC.uploadCover);

export default router;
