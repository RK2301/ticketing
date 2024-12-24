import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Subjects } from "./subjects";
import { Listener } from "./base-listener";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = "paymentsService";

  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log(`Event Data: ${JSON.stringify(data)}`);
    console.log(`${data.id} / ${data.price} / ${data.title}`);

    //if busniess logic run successfully
    msg.ack();
  }
}
