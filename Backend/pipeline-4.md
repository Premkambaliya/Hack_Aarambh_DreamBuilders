# AI Sales Conversation Intelligence Platform

## Backend Development Guide — Pipeline 4 (Dashboard & Insights APIs)

Stack: Node.js + Express.js + MongoDB
Architecture: **Feature / Module Based Architecture**

Goal: Provide APIs that allow the frontend dashboard to **retrieve transcripts, AI insights, and analytics** generated from sales calls.

---

# 1. Objective of Pipeline-4

Pipeline-4 is responsible for **delivering analyzed data to the frontend dashboard**.

It does **not perform AI processing**.
Instead, it retrieves already processed information from MongoDB and provides it through REST APIs.

Responsibilities:

* Retrieve analyzed calls
* Fetch full call intelligence
* Provide analytics summary
* Allow filtering/searching calls

Pipeline architecture:

```text
Pipeline 1 → Audio Upload
Pipeline 2 → Speech-to-Text
Pipeline 3 → AI Conversation Intelligence
Pipeline 4 → Dashboard & Insights APIs
```

---

# 2. Data Required for Pipeline-4

Your database already contains:

```text
callId
product_name
status
fileName
filePath
callDuration
transcript
aiInsights
createdAt
updatedAt
```

Inside `aiInsights`:

```text
summary
objections
buyingSignals
competitors
competitorAdvantages
improvementsNeeded
productName
sentiment
dealProbability
followUpRecommendation
positivePoints
```

Pipeline-4 simply **queries this data**.

---

# 3. Folder Structure

Add a **dashboard module**.

```text
backend/
│
├── modules/
│
│   ├── audio/
│   ├── transcription/
│   ├── ai-analysis/
│
│   └── dashboard/
│       ├── dashboard.routes.js
│       ├── dashboard.controller.js
│       └── dashboard.service.js
```

---

# 4. Dashboard APIs Overview

Pipeline-4 should implement the following APIs:

| Endpoint                        | Purpose                           |
| ------------------------------- | --------------------------------- |
| GET /api/dashboard/calls        | Get list of analyzed calls        |
| GET /api/dashboard/call/:callId | Get full call details             |
| GET /api/dashboard/analytics    | Dashboard statistics              |
| GET /api/dashboard/filter       | Filter calls by product/sentiment |

---

# 5. Dashboard Service

## modules/dashboard/dashboard.service.js

Service layer contains **database queries and aggregation logic**.

```javascript
const Call = require("../audio/audio.model");

exports.getAllCalls = async () => {

 return await Call.find({ status: "analyzed" })
   .select(
     "callId product callDuration aiInsights.summary aiInsights.sentiment aiInsights.dealProbability createdAt"
   )
   .sort({ createdAt: -1 });

};

exports.getCallDetails = async (callId) => {

 return await Call.findOne({ callId });

};

exports.getAnalytics = async () => {

 const totalCalls = await Call.countDocuments({ status: "analyzed" });

 const positiveCalls = await Call.countDocuments({
   "aiInsights.sentiment": "positive"
 });

 const negativeCalls = await Call.countDocuments({
   "aiInsights.sentiment": "negative"
 });

 return {
   totalCalls,
   positiveCalls,
   negativeCalls
 };

};

exports.filterCalls = async (filters) => {

 return await Call.find(filters);

};
```

---

# 6. Dashboard Controller

## modules/dashboard/dashboard.controller.js

Controller handles **API requests and responses**.

```javascript
const dashboardService = require("./dashboard.service");

exports.getCalls = async (req, res) => {

 try {

   const calls = await dashboardService.getAllCalls();

   res.status(200).json({
     success: true,
     calls
   });

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};

exports.getCallDetails = async (req, res) => {

 try {

   const { callId } = req.params;

   const call = await dashboardService.getCallDetails(callId);

   if (!call) {
     return res.status(404).json({
       message: "Call not found"
     });
   }

   res.status(200).json(call);

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};

exports.getAnalytics = async (req, res) => {

 try {

   const analytics = await dashboardService.getAnalytics();

   res.status(200).json(analytics);

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};

exports.filterCalls = async (req, res) => {

 try {

   const filters = {};

   if (req.query.product) {
     filters.product = req.query.product;
   }

   if (req.query.sentiment) {
     filters["aiInsights.sentiment"] = req.query.sentiment;
   }

   const calls = await dashboardService.filterCalls(filters);

   res.status(200).json(calls);

 } catch (error) {

   res.status(500).json({
     error: error.message
   });

 }

};
```

---

# 7. Dashboard Routes

## modules/dashboard/dashboard.routes.js

```javascript
const express = require("express");
const router = express.Router();

const dashboardController = require("./dashboard.controller");

router.get("/calls", dashboardController.getCalls);

router.get("/call/:callId", dashboardController.getCallDetails);

router.get("/analytics", dashboardController.getAnalytics);

router.get("/filter", dashboardController.filterCalls);

module.exports = router;
```

---

# 8. Register Routes in app.js

Update `app.js`:

```javascript
const dashboardRoutes = require("./modules/dashboard/dashboard.routes");

app.use("/api/dashboard", dashboardRoutes);
```

---

# 9. Example API Responses

### Get All Calls

Request:

```text
GET /api/dashboard/calls
```

Response:

```json
{
 "calls": [
   {
     "callId": "123",
     "product": "tata_harrier",
     "summary": "Customer concerned about price",
     "sentiment": "negative",
     "dealProbability": 20
   }
 ]
}
```

---

### Get Call Details

Request:

```text
GET /api/dashboard/call/123
```

Response:

```json
{
 "callId": "123",
 "transcript": "...",
 "aiInsights": {
   "summary": "...",
   "objections": [],
   "competitors": [],
   "competitorAdvantages": [],
   "improvementsNeeded": [],
   "sentiment": "negative"
 }
}
```

---

### Dashboard Analytics

Request:

```text
GET /api/dashboard/analytics
```

Response:

```json
{
 "totalCalls": 50,
 "positiveCalls": 20,
 "negativeCalls": 10
}
```

---

# 10. Dashboard UI Sections

Your frontend dashboard should display:

### Call List

| Call ID | Product | Sentiment | Deal Probability |
| ------- | ------- | --------- | ---------------- |

---

### Call Details Page

Sections:

```text
Transcript
Conversation Summary
Objections
Buying Signals
Competitor Mentions
Competitor Advantages
Improvements Needed
Follow-up Recommendation
```

---

# 11. Pipeline-4 Workflow

```text
MongoDB
   ↓
Dashboard Service
   ↓
Dashboard Controller
   ↓
Dashboard Routes
   ↓
Frontend React Dashboard
```

---

# 12. Completion Criteria

Pipeline-4 is complete when:

✔ Dashboard API returns call list
✔ Call details API works
✔ Analytics endpoint works
✔ Filtering endpoint works
✔ Frontend can display insights

---

# 13. Next Step (Future Feature)

After Pipeline-4 you can implement:

```text
Pipeline 5 → Product Intelligence Analytics
```

This will aggregate insights across calls to generate:

* purchase interest score
* service satisfaction score
* top competitor advantages
* common customer complaints
