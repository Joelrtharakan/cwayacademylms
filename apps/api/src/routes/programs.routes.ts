import { Router } from "express";
import * as PC from "../controllers/programs.controller";
import multer from "multer";
import { cacheRoute } from "../middleware/cache.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", cacheRoute(300), PC.getPublicPrograms);
router.get("/:id", cacheRoute(300), PC.getProgram);

router.post(
  "/:id/apply",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "certificates", maxCount: 5 }
  ]),
  PC.applyForProgram
);

export default router;
