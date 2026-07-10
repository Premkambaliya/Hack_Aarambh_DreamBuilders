import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const VALID_CALL_TYPES = new Set([
  "sales",
  "service",
  "enquiry",
  "complaint",
  "support",
  "renewal",
  "upsell",
  "other",
]);

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 20);
};

const normalizeCallType = (value) => {
  const normalized = String(value || "other").trim().toLowerCase();
  return VALID_CALL_TYPES.has(normalized) ? normalized : "other";
};

const clampScore = (val, fallback = 5) =>
  Math.max(1, Math.min(10, Number.parseInt(val ?? fallback, 10) || fallback));

const clampPct = (val, fallback = 50) =>
  Math.max(0, Math.min(100, Number.parseInt(val ?? fallback, 10) || fallback));

const toObjectArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).slice(0, 20);
};

const normalizeInsights = (rawInsights, fallbackSummary = "") => ({
  summary: String(rawInsights?.summary || fallbackSummary || "No summary generated").trim(),
  callTitle: String(rawInsights?.callTitle || rawInsights?.title || "Untitled Call").trim(),
  callType: normalizeCallType(rawInsights?.callType),
  objections: toStringArray(rawInsights?.objections),
  buyingSignals: toStringArray(rawInsights?.buyingSignals),
  positivePoints: toStringArray(rawInsights?.positivePoints),
  competitors: toStringArray(rawInsights?.competitors),
  competitorAdvantages: toStringArray(rawInsights?.competitorAdvantages),
  improvementsNeeded: toStringArray(rawInsights?.improvementsNeeded),
  productName: String(rawInsights?.productName || "Unknown").trim(),
  sentiment: String(rawInsights?.sentiment || "neutral").trim().toLowerCase(),
  dealProbability: Math.max(
    0,
    Math.min(100, Number.parseInt(rawInsights?.dealProbability ?? 50, 10) || 50)
  ),
  followUpRecommendation: String(
    rawInsights?.followUpRecommendation || "Follow up with customer"
  ).trim(),
  customer: {
    name: String(rawInsights?.customer?.name || "Unknown").trim(),
    email: String(rawInsights?.customer?.email || "").trim(),
    phone: String(rawInsights?.customer?.phone || "").trim(),
  },
  emailDraft: {
    subject: String(rawInsights?.emailDraft?.subject || "Follow-up on our call").trim(),
    body: String(
      rawInsights?.emailDraft?.body ||
        "Hello,\n\nThank you for your time today. Sharing a quick follow-up based on our conversation.\n\nBest regards"
    ).trim(),
    tone: String(rawInsights?.emailDraft?.tone || "professional").trim(),
    cta: String(rawInsights?.emailDraft?.cta || "Please share a suitable next step.").trim(),
  },
  confidence: {
    title: Number(rawInsights?.confidence?.title ?? 0.7),
    callType: Number(rawInsights?.confidence?.callType ?? 0.7),
    customer: Number(rawInsights?.confidence?.customer ?? 0.5),
  },
  // ── Salesperson Tone ──
  salespersonTone: {
    overall: String(rawInsights?.salespersonTone?.overall || "neutral").trim().toLowerCase(),
    breakdown: toStringArray(rawInsights?.salespersonTone?.breakdown),
    examples: toStringArray(rawInsights?.salespersonTone?.examples),
    toneShifts: toStringArray(rawInsights?.salespersonTone?.toneShifts),
    emotionalIntelligence: clampScore(rawInsights?.salespersonTone?.emotionalIntelligence),
  },
  // ── Salesperson Performance ──
  salespersonPerformance: {
    rating: clampScore(rawInsights?.salespersonPerformance?.rating),
    verdict: String(rawInsights?.salespersonPerformance?.verdict || "Average performance").trim(),
    strengths: toStringArray(rawInsights?.salespersonPerformance?.strengths),
    weaknesses: toStringArray(rawInsights?.salespersonPerformance?.weaknesses),
    tips: toStringArray(rawInsights?.salespersonPerformance?.tips),
    missedOpportunities: toStringArray(rawInsights?.salespersonPerformance?.missedOpportunities),
    skills: {
      communication: clampScore(rawInsights?.salespersonPerformance?.skills?.communication),
      productKnowledge: clampScore(rawInsights?.salespersonPerformance?.skills?.productKnowledge),
      objectionHandling: clampScore(rawInsights?.salespersonPerformance?.skills?.objectionHandling),
      rapport: clampScore(rawInsights?.salespersonPerformance?.skills?.rapport),
      closing: clampScore(rawInsights?.salespersonPerformance?.skills?.closing),
      listening: clampScore(rawInsights?.salespersonPerformance?.skills?.listening),
      negotiation: clampScore(rawInsights?.salespersonPerformance?.skills?.negotiation),
      empathy: clampScore(rawInsights?.salespersonPerformance?.skills?.empathy),
      pitching: clampScore(rawInsights?.salespersonPerformance?.skills?.pitching),
      urgencyCreation: clampScore(rawInsights?.salespersonPerformance?.skills?.urgencyCreation),
      questionAsking: clampScore(rawInsights?.salespersonPerformance?.skills?.questionAsking),
    },
    callPhases: {
      opening: clampScore(rawInsights?.salespersonPerformance?.callPhases?.opening),
      discovery: clampScore(rawInsights?.salespersonPerformance?.callPhases?.discovery),
      presentation: clampScore(rawInsights?.salespersonPerformance?.callPhases?.presentation),
      objectionHandling: clampScore(rawInsights?.salespersonPerformance?.callPhases?.objectionHandling),
      closing: clampScore(rawInsights?.salespersonPerformance?.callPhases?.closing),
    },
  },
  // ── Conversation Deep Dive ──
  conversationAnalysis: {
    talkRatioSalesperson: clampPct(rawInsights?.conversationAnalysis?.talkRatioSalesperson),
    talkRatioCustomer: clampPct(rawInsights?.conversationAnalysis?.talkRatioCustomer),
    longestMonologue: String(rawInsights?.conversationAnalysis?.longestMonologue || "salesperson").trim().toLowerCase(),
    questionsAskedBySalesperson: Math.max(0, Number.parseInt(rawInsights?.conversationAnalysis?.questionsAskedBySalesperson ?? 0, 10) || 0),
    questionsAskedByCustomer: Math.max(0, Number.parseInt(rawInsights?.conversationAnalysis?.questionsAskedByCustomer ?? 0, 10) || 0),
    keyTopics: toStringArray(rawInsights?.conversationAnalysis?.keyTopics),
    painPoints: toStringArray(rawInsights?.conversationAnalysis?.painPoints),
    actionItems: toStringArray(rawInsights?.conversationAnalysis?.actionItems),
    nextSteps: toStringArray(rawInsights?.conversationAnalysis?.nextSteps),
    pricingDiscussed: Boolean(rawInsights?.conversationAnalysis?.pricingDiscussed),
    pricingDetails: String(rawInsights?.conversationAnalysis?.pricingDetails || "").trim(),
    decisionMakers: toStringArray(rawInsights?.conversationAnalysis?.decisionMakers),
    urgencyLevel: String(rawInsights?.conversationAnalysis?.urgencyLevel || "medium").trim().toLowerCase(),
    customerEngagementScore: clampScore(rawInsights?.conversationAnalysis?.customerEngagementScore),
    objectionResponses: toObjectArray(rawInsights?.conversationAnalysis?.objectionResponses).map((o) => ({
      objection: String(o?.objection || "").trim(),
      response: String(o?.response || "").trim(),
      effectiveness: String(o?.effectiveness || "average").trim().toLowerCase(),
    })),
  },
  // ── Key Moments ──
  keyMoments: toObjectArray(rawInsights?.keyMoments).map((m) => ({
    moment: String(m?.moment || "").trim(),
    impact: String(m?.impact || "neutral").trim().toLowerCase(),
    description: String(m?.description || "").trim(),
  })),
  // ── Actionable Intelligence ──
  actionCenter: toObjectArray(rawInsights?.actionCenter).map((a) => ({
    priority: String(a?.priority || "medium").trim().toLowerCase(),
    action: String(a?.action || "").trim(),
    reason: String(a?.reason || "").trim(),
    template: String(a?.template || "").trim(),
    deadline: String(a?.deadline || "").trim(),
    owner: String(a?.owner || "rep").trim().toLowerCase(),
  })),
  objectionPlaybook: toObjectArray(rawInsights?.objectionPlaybook).map((o) => ({
    objection: String(o?.objection || "").trim(),
    severity: String(o?.severity || "medium").trim().toLowerCase(),
    suggestedResponse: String(o?.suggestedResponse || "").trim(),
    actionItems: toStringArray(o?.actionItems),
    responseTemplate: String(o?.responseTemplate || "").trim(),
  })),
  riskLevel: String(rawInsights?.riskLevel || "medium").trim().toLowerCase(),
  riskSummary: String(rawInsights?.riskSummary || "").trim(),
  dealRecoveryPlan: {
    currentProbability: Math.max(0, Math.min(100, Number.parseInt(rawInsights?.dealRecoveryPlan?.currentProbability ?? rawInsights?.dealProbability ?? 50, 10) || 50)),
    targetProbability: Math.max(0, Math.min(100, Number.parseInt(rawInsights?.dealRecoveryPlan?.targetProbability ?? 70, 10) || 70)),
    requiredActions: toStringArray(rawInsights?.dealRecoveryPlan?.requiredActions),
    timeline: String(rawInsights?.dealRecoveryPlan?.timeline || "").trim(),
  },
  competitiveBattleCard: {
    competitor: String(rawInsights?.competitiveBattleCard?.competitor || "").trim(),
    counterPoints: toStringArray(rawInsights?.competitiveBattleCard?.counterPoints),
    winStrategy: String(rawInsights?.competitiveBattleCard?.winStrategy || "").trim(),
    talkingPoints: toStringArray(rawInsights?.competitiveBattleCard?.talkingPoints),
  },
  coachingActions: {
    topSkillGap: String(rawInsights?.coachingActions?.topSkillGap || "").trim(),
    specificIssue: String(rawInsights?.coachingActions?.specificIssue || "").trim(),
    coachingTip: String(rawInsights?.coachingActions?.coachingTip || "").trim(),
    practiceExercise: String(rawInsights?.coachingActions?.practiceExercise || "").trim(),
    managerSummary: String(rawInsights?.coachingActions?.managerSummary || "").trim(),
  },
});

export const analyzeConversation = async (transcript) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an advanced conversation intelligence system. Analyze the transcript deeply and return ONLY valid JSON.

Return this exact schema:
{
  "summary": "detailed 3-5 sentence summary of the entire call",
  "callTitle": "short descriptive title (5-10 words)",
  "callType": "one of: sales, service, enquiry, complaint, support, renewal, upsell, other",
  "objections": ["each objection raised by the customer"],
  "buyingSignals": ["each buying signal detected"],
  "positivePoints": ["positive aspects of the conversation"],
  "competitors": ["competitor names mentioned"],
  "competitorAdvantages": ["advantages competitors have"],
  "improvementsNeeded": ["areas needing improvement"],
  "productName": "product or service discussed",
  "sentiment": "positive|neutral|negative",
  "dealProbability": 0,
  "followUpRecommendation": "specific actionable follow-up recommendation",
  "customer": {
    "name": "string or Unknown",
    "email": "string if present else empty",
    "phone": "string if present else empty"
  },
  "emailDraft": {
    "subject": "string",
    "body": "professional follow-up email body referencing specific call details",
    "tone": "professional|friendly|urgent|neutral",
    "cta": "single call-to-action line"
  },
  "confidence": { "title": 0.0, "callType": 0.0, "customer": 0.0 },
  "salespersonTone": {
    "overall": "confident|friendly|aggressive|nervous|professional|passive|empathetic|neutral",
    "breakdown": ["2-4 observations about tone patterns and shifts during the call"],
    "examples": ["2-3 direct quotes or paraphrases illustrating the tone"],
    "toneShifts": ["describe each noticeable tone shift, e.g. 'Shifted from confident to defensive when pricing objection arose'"],
    "emotionalIntelligence": 7
  },
  "salespersonPerformance": {
    "rating": 7,
    "verdict": "One-line overall performance summary",
    "strengths": ["2-4 specific things done well with examples"],
    "weaknesses": ["2-4 specific areas that fell short with examples"],
    "tips": ["2-4 actionable coaching suggestions"],
    "missedOpportunities": ["specific moments where the salesperson missed a chance to advance the deal"],
    "skills": {
      "communication": 7,
      "productKnowledge": 8,
      "objectionHandling": 5,
      "rapport": 6,
      "closing": 4,
      "listening": 7,
      "negotiation": 5,
      "empathy": 6,
      "pitching": 7,
      "urgencyCreation": 4,
      "questionAsking": 6
    },
    "callPhases": {
      "opening": 7,
      "discovery": 6,
      "presentation": 8,
      "objectionHandling": 5,
      "closing": 4
    }
  },
  "conversationAnalysis": {
    "talkRatioSalesperson": 55,
    "talkRatioCustomer": 45,
    "longestMonologue": "salesperson|customer",
    "questionsAskedBySalesperson": 8,
    "questionsAskedByCustomer": 5,
    "keyTopics": ["main topics discussed during the call"],
    "painPoints": ["customer pain points identified"],
    "actionItems": ["concrete action items agreed upon"],
    "nextSteps": ["agreed next steps"],
    "pricingDiscussed": true,
    "pricingDetails": "summary of any pricing/budget discussion or empty string",
    "decisionMakers": ["names or roles of decision makers mentioned"],
    "urgencyLevel": "high|medium|low",
    "customerEngagementScore": 7,
    "objectionResponses": [
      {
        "objection": "the specific objection",
        "response": "how the salesperson responded",
        "effectiveness": "strong|average|weak"
      }
    ]
  },
  "keyMoments": [
    {
      "moment": "brief label for the key moment",
      "impact": "positive|negative|neutral",
      "description": "what happened and why it matters"
    }
  ],
  "actionCenter": [
    {
      "priority": "critical|high|medium|low",
      "action": "specific action the rep should take immediately",
      "reason": "why this action matters for the deal",
      "template": "ready-to-use message/email template for this action",
      "deadline": "suggested timeframe like '24 hours' or '3 days'",
      "owner": "rep|manager"
    }
  ],
  "objectionPlaybook": [
    {
      "objection": "the specific objection raised",
      "severity": "high|medium|low",
      "suggestedResponse": "exactly what to say to handle this objection",
      "actionItems": ["concrete follow-up step 1", "step 2"],
      "responseTemplate": "ready-to-send email template addressing this objection"
    }
  ],
  "riskLevel": "critical|high|medium|low",
  "riskSummary": "1-2 sentence summary of why this deal is at risk and what is the biggest threat",
  "dealRecoveryPlan": {
    "currentProbability": 35,
    "targetProbability": 60,
    "requiredActions": ["specific step 1 to improve deal chances", "step 2"],
    "timeline": "timeframe within which actions must be taken"
  },
  "competitiveBattleCard": {
    "competitor": "primary competitor name or empty string if none mentioned",
    "counterPoints": ["counter-argument 1 against competitor advantage", "counter-argument 2"],
    "winStrategy": "overall strategy to win against this competitor",
    "talkingPoints": ["talking point 1 to use with customer", "talking point 2"]
  },
  "coachingActions": {
    "topSkillGap": "the weakest skill name",
    "specificIssue": "what specifically went wrong in THIS call related to that skill",
    "coachingTip": "specific advice on how to improve, with an example of what they should have said",
    "practiceExercise": "a concrete exercise to practice this skill",
    "managerSummary": "1-2 sentence summary for the manager about what coaching this rep needs"
  }
}

Rules:
- Analyze DEEPLY — extract every possible insight from the transcript.
- summary should be 3-5 sentences covering the call's purpose, key discussion points, and outcome.
- callTitle: concise and meaningful (5-10 words).
- dealProbability: integer 0-100, be precise based on actual buying signals and objections.
- All skill scores and phase scores are integers from 1 to 10.
- salespersonTone.toneShifts: identify each point where tone noticeably changed.
- salespersonTone.emotionalIntelligence: 1-10 score for how well the salesperson read and responded to customer emotions.
- salespersonPerformance.missedOpportunities: specific moments where the salesperson could have done better.
- salespersonPerformance.callPhases: rate each phase of the sales call separately (opening/discovery/presentation/objectionHandling/closing).
- conversationAnalysis.talkRatioSalesperson + talkRatioCustomer should sum to ~100.
- conversationAnalysis.questionsAskedBySalesperson/ByCustomer: count actual questions from the transcript.
- conversationAnalysis.painPoints: customer problems, frustrations, needs expressed.
- conversationAnalysis.actionItems: things both parties agreed to do after the call.
- conversationAnalysis.nextSteps: explicit next steps discussed.
- conversationAnalysis.decisionMakers: anyone mentioned who has buying authority.
- conversationAnalysis.urgencyLevel: high/medium/low based on timeline pressure in the conversation.
- conversationAnalysis.customerEngagementScore: 1-10, how engaged/interested the customer seemed.
- conversationAnalysis.objectionResponses: pair each objection with how it was handled and rate effectiveness.
- keyMoments: 3-6 pivotal moments (breakthroughs, rapport builders, deal risks, commitment signals).

ACTIONABLE INTELLIGENCE RULES:
- For every objection, provide a specific "suggestedResponse" the rep can say word-for-word, and an "actionItems" array of concrete steps.
- For every buying signal, estimate urgency and give a specific action with deadline.
- Generate an "actionCenter" array of 3-5 prioritized actions (critical/high/medium/low) the rep should take immediately. Each action must have a reason, a ready-to-use template, and a deadline.
- Classify overall "riskLevel" as critical/high/medium/low based on deal probability, sentiment, and objection severity.
- If competitors are mentioned, generate a "competitiveBattleCard" with counter-arguments and talking points.
- For the lowest-scoring skill, provide a specific coaching tip with an example from THIS call in "coachingActions".
- All follow-up recommendations must include a specific deadline.
- Every insight must answer: "So what? What should the human DO with this information?"
- Do not add markdown, comments, or extra text — return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Please analyze this conversation transcript:\n\n${transcript}`,
        },
      ],
    });


    const responseText = completion.choices[0].message.content;
    
    // Parse the JSON response from the LLM
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: responseText };

    return normalizeInsights(parsed, responseText);
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};
