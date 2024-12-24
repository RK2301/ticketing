import { Publisher, Subjects, TicketUpdatedEvent } from "@rkh-ms/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
