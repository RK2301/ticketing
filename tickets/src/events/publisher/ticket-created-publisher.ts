import { Publisher, Subjects, TicketCreatedEvent } from "@rkh-ms/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
