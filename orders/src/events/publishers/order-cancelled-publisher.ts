import { OrderCancelledEvent, Publisher, Subjects } from "@rkh-ms/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
