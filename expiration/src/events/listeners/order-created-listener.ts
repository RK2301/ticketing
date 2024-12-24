import { Listener, OrderCreatedEvent, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log(`Waiting This ms before process the job ${delay}`);

        await expirationQueue.add({ orderId: data.id }, {
            delay: delay
        })

        msg.ack()
    }
}