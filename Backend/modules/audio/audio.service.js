// Audio Service Layer
// Business logic for audio operations

import CallModel from "./audio.model.js";

class AudioService {
  async addTranscript(callId, transcript) {
    return await CallModel.updateOne(callId, { transcript });
  }

  async addAIInsights(callId, aiInsights) {
    return await CallModel.updateOne(callId, { aiInsights });
  }

  async getCallWithTranscript(callId) {
    return await CallModel.findById(callId);
  }

  async getCallsWithInsights() {
    return await CallModel.findAll({ aiInsights: { $ne: null } });
  }

  async deleteCallData(callId) {
    return await CallModel.deleteOne(callId);
  }

  async getCallStats() {
    const allCalls = await CallModel.findAll();
    const callsWithTranscript = await CallModel.findAll({ transcript: { $ne: null } });
    const callsWithInsights = await CallModel.findAll({ aiInsights: { $ne: null } });

    return {
      totalCalls: allCalls.length,
      callsWithTranscript: callsWithTranscript.length,
      callsWithInsights: callsWithInsights.length,
    };
  }
}

export default new AudioService();
