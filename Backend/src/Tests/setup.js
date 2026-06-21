import { beforeAll, beforeEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-soft-skill-analyser';
process.env.PORT = '5002'; // use a different port for tests if any listener starts

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set MONGO_URI environment variable so connectDB() uses it
  process.env.MONGO_URI = mongoUri;

  // If mongoose is already connected, disconnect it first
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Connect Mongoose to the memory server
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear all database collections before each test run to ensure isolation
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  // Clean up and close connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
