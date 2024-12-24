import { ExpirationCompleteEvent, Publisher, Subjects } from "@rkh-ms/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}