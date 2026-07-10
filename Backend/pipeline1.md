# AI Sales Conversation Intelligence Platform

## Backend Development Guide — Pipeline 1 (Audio Upload / Audio Ingestion)

Author: Backend Architecture Guide
Stack: Node.js + Express.js + MongoDB
Architecture: **Feature / Module Based Architecture**

---

# 1. Objective of Pipeline 1

Pipeline 1 is responsible for **audio ingestion** into the system.

Responsibilities of this pipeline:

* Receive audio recordings from the frontend
* Validate the audio file
* Store the file in the server
* Generate a unique `callId`
* Save metadata in the database
* Return the `callId` to the frontend

This pipeline **does not perform transcription**.
It only ensures **safe and structured audio upload**.

---

# 2. Backend Architecture Style

This project follows **Module / Feature Based Architecture**.

Why this approach:

* All logic related to one feature stays in one place
* Easier debugging
* Easier maintenance
* AI coding tools (Copilot, Cursor) understand context better
* Scales well when adding new features

Architecture pattern:

```text
backend
 ├─ config
 ├─ middlewares
 ├─ modules
 │   └─ feature modules
 ├─ utils
 ├─ uploads
 ├─ app.js
 └─ server.js
```

Each **pipeline corresponds to a module**.

Example modules:

```text
audio
transcription
ai-analysis
dashboard
```

---

# 3. Backend Folder Structure

Create the backend structure like this:

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
│   │
│   ├── ai-analysis/
│   │
│   └── dashboard/
│
├── utils/
│   └── fileValidator.js
│
├── uploads/
│
├── app.js
├── server.js
├── package.json
└── .env
```

Explanation:

| Folder      | Purpose                   |
| ----------- | ------------------------- |
| config      | database configuration    |
| middlewares | reusable middleware logic |
| modules     | feature-based modules     |
| utils       | helper functions          |
| uploads     | stores uploaded audio     |
| app.js      | express app configuration |
| server.js   | server entry point        |

---

# 4. Install Backend Dependencies

Initialize project:

```bash
npm init -y
```

Install dependencies:

```bash
npm install express multer cors dotenv mongodbnpm in uuid
```

Optional (for development):

```bash
npm install nodemon --save-dev
```

Dependency purpose:

| Package  | Purpose                      |
| -------- | ---------------------------- |
| express  | backend framework            |
| multer   | file uploads                 |
| cors     | allow frontend communication |
| dotenv   | environment variables        |
| mongoose | database ORM                 |
| uuid     | unique call ID               |

---

# 5. Server Entry Point

## server.js

```javascript
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

# 6. Express App Configuration

## app.js

```javascript
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const audioRoutes = require("./modules/audio/audio.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/audio", audioRoutes);

module.exports = app;
```

---

# 7. Upload Middleware

## middlewares/upload.middleware.js

This middleware handles **audio file uploads**.

```javascript
const multer = require("multer");

const storage = multer.diskStorage({

 destination: function(req, file, cb) {
   cb(null, "uploads/");
 },

 filename: function(req, file, cb) {
   const uniqueName = Date.now() + "-" + file.originalname;
   cb(null, uniqueName);
 }

});

const fileFilter = (req, file, cb) => {

 const allowedTypes = [
   "audio/mpeg",
   "audio/wav",
   "audio/mp3",
   "audio/webm",
   "audio/mp4"
 ];

 if (allowedTypes.includes(file.mimetype)) {
   cb(null, true);
 } else {
   cb(new Error("Unsupported audio format"), false);
 }

};

const upload = multer({
 storage,
 fileFilter,
 limits: { fileSize: 50 * 1024 * 1024 }
});

module.exports = upload;
```

Maximum file size: **50MB**

---

# 8. Audio Module — Database Model

## modules/audio/audio.model.js

```javascript
const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({

 callId: {
   type: String,
   required: true,
   unique: true
 },

 fileName: String,

 filePath: String,

 transcript: {
   type: String,
   default: null
 },

 aiInsights: {
   type: Object,
   default: null
 },

 createdAt: {
   type: Date,
   default: Date.now
 }

});

module.exports = mongoose.model("Call", callSchema);
```

---

# 9. Audio Module — Controller

## modules/audio/audio.controller.js

```javascript
const { v4: uuidv4 } = require("uuid");
const Call = require("./audio.model");

exports.uploadAudio = async (req, res) => {

 try {

   const file = req.file;

   if (!file) {
     return res.status(400).json({
       message: "Audio file required"
     });
   }

   const callId = uuidv4();

   const call = new Call({
     callId,
     fileName: file.filename,
     filePath: file.path
   });

   await call.save();

   res.status(200).json({
     message: "Audio uploaded successfully",
     callId
   });

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};
```

---

# 10. Audio Module — Service Layer

## modules/audio/audio.service.js

Service layer contains **business logic**.

Example placeholder:

```javascript
// Business logic can be moved here later
```

Currently minimal because upload logic is simple.

---

# 11. Audio Module — Routes

## modules/audio/audio.routes.js

```javascript
const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/upload.middleware");
const audioController = require("./audio.controller");

router.post(
 "/upload",
 upload.single("audio"),
 audioController.uploadAudio
);

module.exports = router;
```

Endpoint:

```text
POST /api/audio/upload
```

---

# 12. Example Request

Frontend sends:

```text
POST /api/audio/upload
Content-Type: multipart/form-data
```

Body:

```text
audio: sales_call.mp3
```

---

# 13. Example Response

```json
{
 "message": "Audio uploaded successfully",
 "callId": "7c9c6b88-55a8-4c7e-9f55"
}
```

The `callId` will be used in future pipelines.

---

# 14. Pipeline 1 Workflow

```text
User Upload
     ↓
React Frontend
     ↓
POST /api/audio/upload
     ↓
Multer stores file
     ↓
MongoDB stores metadata
     ↓
Return callId
```

---

# 15. Testing Pipeline 1

Use **Postman**.

Request:

```text
POST http://localhost:5000/api/audio/upload
```

Body type:

```text
form-data
```

Field:

```text
audio → file
```

Expected result:

* audio stored in `uploads/`
* call metadata stored in MongoDB
* API returns `callId`

---

# 16. Completion Criteria

Pipeline 1 is complete when:

✔ Audio uploads successfully
✔ File stored in uploads directory
✔ MongoDB stores call metadata
✔ API returns `callId`

---

# Next Pipeline

Pipeline 2:

```text
Audio File
   ↓
Speech-to-Text Transcription
   ↓
Transcript stored in database
```

This pipeline will integrate **Whisper transcription**.
