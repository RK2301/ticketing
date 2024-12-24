import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
  if (!process.env.MONOGO_URI) throw new Error("MongoURI must be defined");
  try {
    await mongoose.connect(process.env.MONOGO_URI);
    console.log(`Connected to mongoDB!`);
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => console.log(`Auth Service Listening on Port 3000`));
start();
