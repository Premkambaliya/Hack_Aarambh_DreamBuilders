import { MongoClient } from "mongodb";
import "dotenv/config.js";

let mongoClient;
let database;

const connectDB = async () => {
  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI);
    await mongoClient.connect();
    
    database = mongoClient.db(process.env.DATABASE_NAME);
    
    // console.log(`MongoDB Connected: ${process.env.MONGODB_URI}`);
    console.log(`Database: ${process.env.DATABASE_NAME}`);
    
    // Create collections if they don't exist
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes("calls")) {
      await database.createCollection("calls");
      console.log("Created 'calls' collection");
    }

    if (!collectionNames.includes("users")) {
      await database.createCollection("users");
      // Create unique index on email
      await database.collection("users").createIndex({ email: 1 }, { unique: true });
      console.log("Created 'users' collection with email index");
    }
    
    return database;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const getDatabase = () => {
  if (!database) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return database;
};

const disconnectDB = async () => {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("MongoDB disconnected");
    }
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

export { connectDB, getDatabase, disconnectDB };
