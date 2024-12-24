import { OrderCreatedEvent, Publisher, Subjects } from "@rkh-ms/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
