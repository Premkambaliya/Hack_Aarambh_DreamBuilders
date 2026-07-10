import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  transcribeCall,
  getTranscript,
} from "./transcription.controller.js";

const router = express.Router();

// Protected Routes - Require Authentication
// POST - Transcribe audio
router.post("/transcribe/:callId", authMiddleware, transcribeCall);

// GET - Retrieve transcript
router.get("/transcript/:callId", authMiddleware, getTranscript);

export default router;
