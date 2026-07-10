import express from "express";
import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware.js";
import { overviewHandler, intelligenceHandler } from "./ei.controller.js";

const router = express.Router();

// Admin only
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/overview", overviewHandler);
router.get("/:employeeId", intelligenceHandler);

export default router;
