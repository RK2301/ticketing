import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: () => string[];
}

jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  process.env.EXPIRATION_WINDOW_SECONDS = "900";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  //build a JWT payload {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  //Create JWT
  //the process.env.JWT_KEY! is because we define it in beforeall func
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session obj {jwt: token}
  const session = { jwt: token };

  //turn the session into JSON
  const sessionJSON = JSON.stringify(session);

  //take sessionJSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  //returns a string thats the cookie with encoded data
  return [`session=${base64}`];
};
