import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { analyzeCall, getInsights, sendAnalysisEmail } from "./ai.controller.js";

const router = express.Router();

// Protected Routes - Require Authentication
// POST - Analyze call and generate AI insights
router.post("/analyze/:callId", authMiddleware, analyzeCall);

// GET - Retrieve AI insights
router.get("/insights/:callId", authMiddleware, getInsights);

// POST - Send generated follow-up email to customer
router.post("/send-email/:callId", authMiddleware, sendAnalysisEmail);

export default router;
