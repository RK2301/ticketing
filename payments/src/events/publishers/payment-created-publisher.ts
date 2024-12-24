import { PaymentCreatedEvent, Publisher, Subjects } from "@rkh-ms/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PayementCreated = Subjects.PayementCreated
}