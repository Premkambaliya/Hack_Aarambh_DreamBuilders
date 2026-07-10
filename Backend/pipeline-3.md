# AI Sales Conversation Intelligence Platform

## Backend Development Guide — Pipeline 3 (AI Conversation Intelligence)

Stack: Node.js + Express.js + MongoDB
Architecture: **Feature / Module Based Architecture**

Goal: Convert **transcripts into structured sales insights** using an LLM such as **Llama 3**.

---

# 1. Objective of Pipeline 3

Pipeline 3 is responsible for **AI-driven analysis of the transcript** produced in Pipeline 2.

Responsibilities:

* Retrieve transcript using `callId`
* Send transcript to an LLM
* Extract structured insights
* Store AI insights in MongoDB
* Return insights to the frontend

This is the **core intelligence layer** of the platform.

Pipeline relationship:

```text id="p3flow"
Pipeline 1 → Audio Upload
Pipeline 2 → Audio → Text (Transcription)
Pipeline 3 → AI Conversation Intelligence
Pipeline 4 → Dashboard Visualization
```

---

# 2. What Pipeline 3 Should Detect

Your AI model should extract the following information:

| Feature                  | Description                               |
| ------------------------ | ----------------------------------------- |
| Conversation Summary     | Short summary of the call                 |
| Objections               | Pricing concerns, hesitation              |
| Buying Signals           | Customer interest indicators              |
| Competitor Mentions      | Mention of other products                 |
| Sentiment                | Customer tone (positive/neutral/negative) |
| Deal Probability         | Likelihood of closing                     |
| Follow-up Recommendation | Suggested next action                     |

Example output:

```json id="p3output"
{
 "summary": "Customer interested but concerned about pricing",
 "objections": ["pricing too high"],
 "buyingSignals": ["asked for demo"],
 "competitors": ["HubSpot"],
 "sentiment": "neutral-positive",
 "dealProbability": 65,
 "followUp": "Send pricing breakdown and demo scheduling email"
}
```

---

# 3. Updated Backend Folder Structure

Pipeline 3 introduces a new module.

```text id="p3structure"
backend/
│
├── modules/
│
│   ├── audio/
│
│   ├── transcription/
│
│   ├── ai-analysis/
│   │   ├── ai.routes.js
│   │   ├── ai.controller.js
│   │   └── ai.service.js
│
│   └── dashboard/
```

---

# 4. Install Groq SDK

Pipeline 3 will call an LLM hosted by **Groq**.

Install SDK:

```bash id="groqinstall"
npm install groq-sdk
```

---

# 5. Environment Variables

Add your API key.

```env id="groqenv"
GROQ_API_KEY=your_groq_api_key
```

---

# 6. AI Analysis Service

## modules/ai-analysis/ai.service.js

This file contains the logic for sending the transcript to the LLM.

```javascript id="p3service"
const Groq = require("groq-sdk");

const groq = new Groq({
 apiKey: process.env.GROQ_API_KEY
});

exports.analyzeConversation = async (transcript) => {

 const completion = await groq.chat.completions.create({

   model: "llama3-70b-8192",

   messages: [
     {
       role: "system",
       content: `
You are a sales conversation intelligence system.

Analyze the transcript and return JSON with:

summary
objections
buyingSignals
competitors
sentiment
dealProbability
followUpRecommendation
`
     },
     {
       role: "user",
       content: transcript
     }
   ]

 });

 return completion.choices[0].message.content;

};
```

---

# 7. AI Controller

## modules/ai-analysis/ai.controller.js

Controller responsibilities:

* receive API request
* fetch transcript
* call AI service
* store insights

```javascript id="p3controller"
const Call = require("../audio/audio.model");
const aiService = require("./ai.service");

exports.analyzeCall = async (req, res) => {

 try {

   const { callId } = req.params;

   const call = await Call.findOne({ callId });

   if (!call) {
     return res.status(404).json({
       message: "Call not found"
     });
   }

   if (!call.transcript) {
     return res.status(400).json({
       message: "Transcript not available"
     });
   }

   const aiInsights = await aiService.analyzeConversation(call.transcript);

   call.aiInsights = aiInsights;

   await call.save();

   res.status(200).json({
     message: "AI analysis completed",
     insights: aiInsights
   });

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};
```

---

# 8. AI Routes

## modules/ai-analysis/ai.routes.js

```javascript id="p3routes"
const express = require("express");
const router = express.Router();

const aiController = require("./ai.controller");

router.post(
 "/analyze/:callId",
 aiController.analyzeCall
);

module.exports = router;
```

Endpoint:

```text id="p3endpoint"
POST /api/ai/analyze/:callId
```

---

# 9. Register Routes in app.js

Update `app.js`.

```javascript id="p3app"
const aiRoutes = require("./modules/ai-analysis/ai.routes");

app.use("/api/ai", aiRoutes);
```

---

# 10. Example Request

```text id="p3req"
POST /api/ai/analyze/12345
```

Where `12345` is the `callId`.

---

# 11. Example Response

```json id="p3response"
{
 "message": "AI analysis completed",
 "insights": {
   "summary": "...",
   "objections": [],
   "buyingSignals": [],
   "competitors": [],
   "sentiment": "...",
   "dealProbability": 70,
   "followUpRecommendation": "..."
 }
}
```

---

# 12. Database Structure After Pipeline 3

Your document now contains:

```json id="p3db"
{
 "callId": "12345",
 "fileName": "salescall.mp3",
 "filePath": "uploads/salescall.mp3",
 "transcript": "...",
 "aiInsights": {
   "summary": "...",
   "objections": [],
   "buyingSignals": [],
   "competitors": [],
   "sentiment": "...",
   "dealProbability": 70
 }
}
```

---

# 13. Pipeline 3 Workflow

```text id="p3workflow"
Transcript exists
       ↓
POST /api/ai/analyze/:callId
       ↓
Backend retrieves transcript
       ↓
Send transcript to LLM
       ↓
Receive structured insights
       ↓
Store insights in MongoDB
       ↓
Return insights to client
```

---

# 14. Testing Pipeline 3

Steps:

1. Upload audio
2. Run transcription
3. Copy `callId`
4. Request:

```text id="p3test"
POST http://localhost:5000/api/ai/analyze/{callId}
```

Expected result:

* AI insights generated
* Insights stored in MongoDB
* Response returned

---

# 15. Completion Criteria

Pipeline 3 is complete when:

✔ transcript successfully analyzed
✔ insights generated by LLM
✔ insights stored in MongoDB
✔ API endpoint returns insights

---

# 16. Next Pipeline

Final pipeline:

```text id="p4preview"
Pipeline 4 → Dashboard
```

Responsibilities:

* fetch calls
* display transcript
* display AI insights
* visualize deal intelligence
