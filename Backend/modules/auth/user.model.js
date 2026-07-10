// MongoDB User Model
// Using MongoDB native driver - no Mongoose

import { getDatabase } from "../../config/db.js";

class UserModel {
  constructor() {
    this.collectionName = "users";
  }

  getCollection() {
    const db = getDatabase();
    return db.collection(this.collectionName);
  }

  async findById(userId) {
    const collection = this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.findOne({ _id: new ObjectId(userId) });
  }

  async findByEmail(email) {
    const collection = this.getCollection();
    return await collection.findOne({ email: email.toLowerCase() });
  }

  async create(userData) {
    const collection = this.getCollection();
    const result = await collection.insertOne({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  }

  async updateOne(userId, updateData) {
    const collection = this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }

  async getAllUsers() {
    const collection = this.getCollection();
    return await collection.find().toArray();
  }

  async deleteOne(userId) {
    const collection = this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.deleteOne({ _id: new ObjectId(userId) });
  }
}

export default new UserModel();
