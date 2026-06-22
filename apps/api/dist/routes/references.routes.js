"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const references_controller_1 = require("../controllers/references.controller");
const router = (0, express_1.Router)();
router.get("/:token", references_controller_1.getReferenceByToken);
router.post("/:token", references_controller_1.submitReference);
exports.default = router;
