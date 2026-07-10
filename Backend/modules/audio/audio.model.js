// MongoDB Call Model
// Using MongoDB native driver - no Mongoose

import { getDatabase } from "../../config/db.js";

class CallModel {
  constructor() {
    this.collectionName = "calls";
  }

  getCollection() {
    const db = getDatabase();
    return db.collection(this.collectionName);
  }

  async findById(callId) {
    const collection = this.getCollection();
    return await collection.findOne({ callId });
  }

  async findAll(query = {}) {
    const collection = this.getCollection();
    return await collection.find(query).toArray();
  }

  async create(callData) {
    const collection = this.getCollection();
    const result = await collection.insertOne({
      ...callData,
      createdAt: new Date(),
    });
    return result;
  }

  async updateOne(callId, updateData) {
    const collection = this.getCollection();
    return await collection.updateOne(
      { callId },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }

  async deleteOne(callId) {
    const collection = this.getCollection();
    return await collection.deleteOne({ callId });
  }

  async deleteByUserId(userId) {
    const collection = this.getCollection();
    return await collection.deleteMany({ userId: userId.toString() });
  }
}

export default new CallModel();
