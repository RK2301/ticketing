import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  //first check for env variables
  if (!process.env.JWT_KEY)
    throw new Error("Expected For JWT token, but got undefined");

  if (!process.env.MONOGO_URI) throw new Error("MongoURI must be defined");

  if (!process.env.NATS_URL) throw new Error("NATS_URL must be defined");

  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("NATS_CLUSTER_ID must be defined");

  if (!process.env.NATS_CLIENT_ID)
    throw new Error("NATS_CLIENT_ID must be defined");

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on("close", () => {
      console.log(`Connection Closed!`);
      process.exit();
    });

    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    //make connect to mongoose db
    await mongoose.connect(process.env.MONOGO_URI);
    console.log(`Connected To MongoDB ${process.env.MONOGO_URI}`);

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()
  } catch (err) {
    console.log(err);
  }
};

app.listen(3000, () => {
  console.log("Ticketing Service Listen on Port: 3000");
});
start();
