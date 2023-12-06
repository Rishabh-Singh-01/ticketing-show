import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.STRIPE_SECRET_KEY = 'YOUR STRIPE KEY FOR LOCAL TESTING';

let mongo: MongoMemoryServer;

jest.mock('../utils/nats-wrapper.ts');
//@ts-ignore
beforeAll(async () => {
  // quick workaround for testing with env variables
  process.env.JWT_KEY = 'fafasfsafa';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

//@ts-ignore
beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

//@ts-ignore
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
