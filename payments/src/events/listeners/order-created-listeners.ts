import { Listener, OrderCreatedEvent, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            status: data.status,
            userId: data.userId,
            price: data.ticket.price
        })

        await order.save()
        msg.ack()
    }
}