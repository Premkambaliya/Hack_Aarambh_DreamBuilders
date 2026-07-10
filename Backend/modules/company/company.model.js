// MongoDB Company Model
// Using MongoDB native driver

import { getDatabase } from "../../config/db.js";

class CompanyModel {
  constructor() {
    this.collectionName = "companies";
  }

  getCollection() {
    const db = getDatabase();
    return db.collection(this.collectionName);
  }

  async findById(companyId) {
    const collection = this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.findOne({ _id: new ObjectId(companyId) });
  }

  async create(companyData) {
    const collection = this.getCollection();
    const result = await collection.insertOne({
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  }

  async updateOne(companyId, updateData) {
    const collection = this.getCollection();
    const { ObjectId } = await import("mongodb");
    return await collection.updateOne(
      { _id: new ObjectId(companyId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
  }
}

export default new CompanyModel();
