import { Router } from "express";
import * as PC from "../controllers/programs.controller";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", PC.getPublicPrograms);
router.get("/:id", PC.getProgram);

router.post(
  "/:id/apply",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "certificates", maxCount: 5 }
  ]),
  PC.applyForProgram
);

export default router;
