# AI Sales Conversation Intelligence Platform

## Backend Development Guide — Pipeline 2 (Audio → Text Transcription)

Stack: Node.js + Express.js + MongoDB
Architecture: **Feature / Module Based Architecture**

Goal: Convert uploaded **audio recordings into text transcripts** using **OpenAI Whisper**

---

# 1. Objective of Pipeline 2

Pipeline 2 is responsible for **speech-to-text transcription**.

Responsibilities:

* Retrieve uploaded audio using `callId`
* Send the audio file to Whisper
* Receive transcript
* Store transcript in MongoDB
* Return transcript to client

Pipeline 2 depends on **Pipeline 1**.

Pipeline relationship:

```text
Pipeline 1 → audio upload
Pipeline 2 → transcription
Pipeline 3 → AI conversation intelligence
Pipeline 4 → dashboard insights
```

---

# 2. Updated Backend Folder Structure

Your module structure should now include **transcription module**.

```text
backend/
│
├── config/
│   └── db.js
│
├── middlewares/
│   └── upload.middleware.js
│
├── modules/
│
│   ├── audio/
│   │   ├── audio.routes.js
│   │   ├── audio.controller.js
│   │   ├── audio.service.js
│   │   └── audio.model.js
│   │
│   ├── transcription/
│   │   ├── transcription.routes.js
│   │   ├── transcription.controller.js
│   │   └── transcription.service.js
│   │
│   ├── ai-analysis/
│   │
│   └── dashboard/
│
├── uploads/
├── utils/
├── app.js
├── server.js
└── .env
```

---

# 3. Install OpenAI SDK

Install OpenAI SDK:

```bash
npm install openai
```

This allows backend integration with **Whisper API**.

---

# 4. Environment Variables

Add your API key in `.env`.

```env
OPENAI_API_KEY=your_openai_api_key
```

---

# 5. OpenAI Configuration

Create OpenAI client inside the transcription service.

Example initialization:

```javascript
const OpenAI = require("openai");

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});
```

---

# 6. Transcription Service

## modules/transcription/transcription.service.js

This layer contains **core transcription logic**.

```javascript
const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
});

exports.transcribeAudio = async (filePath) => {

 const transcription = await openai.audio.transcriptions.create({
   file: fs.createReadStream(filePath),
   model: "whisper-1"
 });

 return transcription.text;

};
```

---

# 7. Transcription Controller

## modules/transcription/transcription.controller.js

Controller responsibilities:

* receive API request
* find audio file
* call transcription service
* save transcript

```javascript
const Call = require("../audio/audio.model");
const transcriptionService = require("./transcription.service");

exports.transcribeCall = async (req, res) => {

 try {

   const { callId } = req.params;

   const call = await Call.findOne({ callId });

   if (!call) {
     return res.status(404).json({
       message: "Call not found"
     });
   }

   const transcript = await transcriptionService.transcribeAudio(call.filePath);

   call.transcript = transcript;

   await call.save();

   res.status(200).json({
     message: "Transcription successful",
     transcript
   });

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};
```

---

# 8. Transcription Routes

## modules/transcription/transcription.routes.js

```javascript
const express = require("express");
const router = express.Router();

const transcriptionController = require("./transcription.controller");

router.post(
 "/transcribe/:callId",
 transcriptionController.transcribeCall
);

module.exports = router;
```

Endpoint:

```text
POST /api/transcription/transcribe/:callId
```

---

# 9. Register Routes in app.js

Update `app.js` to include transcription routes.

```javascript
const transcriptionRoutes = require("./modules/transcription/transcription.routes");

app.use("/api/transcription", transcriptionRoutes);
```

---

# 10. Example Request

Request:

```text
POST /api/transcription/transcribe/12345
```

Where `12345` is the **callId** returned from Pipeline 1.

---

# 11. Example Response

```json
{
 "message": "Transcription successful",
 "transcript": "Hello thank you for joining this sales call..."
}
```

---

# 12. Database Update

After transcription, your MongoDB document will look like:

```json
{
 "callId": "12345",
 "fileName": "salescall.mp3",
 "filePath": "uploads/17238394-salescall.mp3",
 "transcript": "Hello thank you for joining this sales call...",
 "aiInsights": null,
 "createdAt": "2026-03-10"
}
```

---

# 13. Pipeline 2 Workflow

```text
Audio File Uploaded
        ↓
API Request
POST /transcribe/:callId
        ↓
Backend retrieves audio file
        ↓
Send audio to Whisper API
        ↓
Receive transcript
        ↓
Save transcript to MongoDB
        ↓
Return transcript to client
```

---

# 14. Testing Pipeline 2

Test using **Postman**.

Step 1:

Upload audio using pipeline 1.

Step 2:

Copy returned `callId`.

Step 3:

Request:

```text
POST http://localhost:5000/api/transcription/transcribe/{callId}
```

Expected result:

* transcript generated
* transcript stored in database
* response returned

---

# 15. Completion Criteria

Pipeline 2 is complete when:

✔ audio file successfully sent to Whisper
✔ transcript returned
✔ transcript stored in MongoDB
✔ endpoint returns transcript response

---

# 16. Next Pipeline

Next pipeline:

```text
Pipeline 3 → AI Conversation Intelligence
```

This pipeline will use **GPT-4o** to analyze the transcript and extract insights like:

* conversation summary
* objections
* buying signals
* competitor mentions
* deal probability
* follow-up email
