import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("Connected Successfuly");

  const publisher = new TicketCreatedPublisher(stan);

  try {
    await publisher.publish({
      id: "asdasd",
      title: "Ticket 1",
      price: 20,
      userId: "",
    });
  } catch (e) {
    console.error(e);
  }
});
