import { Router } from "express";
import { getReferenceByToken, submitReference } from "../controllers/references.controller";

const router = Router();

router.get("/:token", getReferenceByToken);
router.post("/:token", submitReference);

export default router;
