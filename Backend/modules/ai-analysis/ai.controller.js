import CallModel from "../audio/audio.model.js";
import ProductModel from "../products/product.model.js";
import { analyzeConversation } from "./ai.service.js";
import { sendTemplateEmail } from "./mail.service.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const analyzeCall = async (req, res) => {
  try {
    const { callId } = req.params;

    // Find the call record
    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    // Check if transcript exists
    if (!call.transcript) {
      return res.status(400).json({
        message: "Transcript not available. Please transcribe the audio first.",
        callId,
      });
    }

    // Analyze conversation using AI
    const aiInsights = await analyzeConversation(call.transcript);

    // If AI detects a product but the call didn't have one selected natively, attempt to auto-link
    let targetProductId = call.productId || null;
    const aiDerivedProductName = aiInsights.productName || "Unknown";

    if (!targetProductId && aiDerivedProductName && aiDerivedProductName !== "Unknown") {
      try {
        // Find products for this company
        const companyProducts = await ProductModel.findByCompanyId(call.companyId);
        
        // Find the closest match (ignore casing/trimming)
        const matchedProduct = companyProducts.find(p => 
          p.productName?.toLowerCase().trim() === aiDerivedProductName.toLowerCase().trim() ||
          aiDerivedProductName.toLowerCase().includes(p.productName?.toLowerCase().trim())
        );

        if (matchedProduct) {
          targetProductId = matchedProduct._id.toString();
        }
      } catch (err) {
        console.error("Auto product linking failed silently:", err);
      }
    }

    // Update call record with AI insights and status
    await CallModel.updateOne(callId, {
      aiInsights,
      status: "analyzed",
      productId: targetProductId,
      product_name: aiInsights.productName || "Unknown",
      call_title: aiInsights.callTitle || "Untitled Call",
      call_type: aiInsights.callType || "other",
      customer_name: (call.customer_name && call.customer_name !== "Unknown") ? call.customer_name : (aiInsights.customer?.name || "Unknown"),
      customer_email: call.customer_email || aiInsights.customer?.email || "",
      customer_phone: call.customer_phone || aiInsights.customer?.phone || "",
      email_subject: aiInsights.emailDraft?.subject || "Follow-up on our call",
      salesperson_rating: aiInsights.salespersonPerformance?.rating || 5,
      salesperson_tone: aiInsights.salespersonTone?.overall || "neutral",
      customer_engagement: aiInsights.conversationAnalysis?.customerEngagementScore || 5,
      urgency_level: aiInsights.conversationAnalysis?.urgencyLevel || "medium",
    });

    res.status(200).json({
      message: "AI analysis completed successfully",
      callId,
      insights: aiInsights,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({
      error: error.message,
      message: "AI analysis failed",
    });
  }
};

export const getInsights = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    if (!call.aiInsights) {
      return res.status(404).json({
        message: "AI insights not found. Please analyze the call first.",
        callId,
      });
    }

    res.status(200).json({
      callId,
      insights: call.aiInsights,
      transcript: call.transcript,
      createdAt: call.createdAt,
    });
  } catch (error) {
    console.error("Error retrieving insights:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve insights",
    });
  }
};

export const sendAnalysisEmail = async (req, res) => {
  try {
    const { callId } = req.params;
    const {
      to,
      subject,
      body,
      forceResend = false,
    } = req.body || {};

    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
        callId,
      });
    }

    if (!call.aiInsights?.emailDraft) {
      return res.status(400).json({
        success: false,
        message: "Email template is not available. Please run analysis first.",
        callId,
      });
    }

    const existingDelivery = call.email_delivery || {};
    if (existingDelivery.status === "sent" && !forceResend) {
      return res.status(409).json({
        success: false,
        message: "Email already sent for this call. Set forceResend=true to send again.",
        callId,
        previousDelivery: {
          sentAt: existingDelivery.sentAt,
          to: existingDelivery.to,
          messageId: existingDelivery.messageId,
        },
      });
    }

    const finalTo = String(
      to || call.customer_email || call.aiInsights?.customer?.email || ""
    ).trim();
    const finalSubject = String(
      subject || call.email_subject || call.aiInsights?.emailDraft?.subject || "Follow-up from our conversation"
    ).trim();
    const finalBody = String(body || call.aiInsights?.emailDraft?.body || "").trim();

    if (!finalTo || !emailRegex.test(finalTo)) {
      return res.status(400).json({
        success: false,
        message: "Valid customer email is required",
        callId,
      });
    }

    if (!finalBody) {
      return res.status(400).json({
        success: false,
        message: "Email body is required",
        callId,
      });
    }

    const mailResult = await sendTemplateEmail({
      to: finalTo,
      subject: finalSubject,
      body: finalBody,
      metadata: {
        callId,
        triggeredBy: req.user?.id || req.user?.userId || "unknown",
      },
    });

    const deliveryPayload = {
      status: "sent",
      sentAt: new Date(),
      to: finalTo,
      subject: finalSubject,
      messageId: mailResult.messageId,
      accepted: mailResult.accepted,
      rejected: mailResult.rejected,
      response: mailResult.response,
      triggeredBy: req.user?.id || req.user?.userId || "unknown",
    };

    await CallModel.updateOne(callId, {
      email_delivery: deliveryPayload,
      email_subject: finalSubject,
      customer_email: finalTo,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      callId,
      delivery: deliveryPayload,
    });
  } catch (error) {
    console.error("Error sending analysis email:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};
