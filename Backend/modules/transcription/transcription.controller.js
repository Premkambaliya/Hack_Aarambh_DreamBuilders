import CallModel from "../audio/audio.model.js";
import { transcribeAudio } from "./transcription.service.js";

export const transcribeCall = async (req, res) => {
  try {
    const { callId } = req.params;

    // Find the call/audio record
    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    // Check if file exists
    if (!call.filePath) {
      return res.status(400).json({
        message: "No audio file associated with this call",
        callId,
      });
    }

    // Transcribe audio
    const transcript = await transcribeAudio(call.filePath);

    // Update the call record with transcript
    await CallModel.updateOne(callId, {
      transcript,
      status: "transcribed",
    });

    res.status(200).json({
      message: "Transcription successful",
      callId,
      transcript,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({
      error: error.message,
      message: "Transcription failed",
    });
  }
};

export const getTranscript = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    if (!call.transcript) {
      return res.status(404).json({
        message: "Transcript not found. Please transcribe the audio first.",
        callId,
      });
    }

    res.status(200).json({
      callId,
      transcript: call.transcript,
      createdAt: call.createdAt,
    });
  } catch (error) {
    console.error("Error retrieving transcript:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve transcript",
    });
  }
};
