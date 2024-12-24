import { ExpirationCompleteEvent, Listener, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {

        //fetch order from db
        const order = await Order.findById(data.orderId).populate('ticket')

        if (!order)
            throw new Error('Order Not Found')

        //if order aleardy paid for, won't update 
        //it's status to cancelled
        if (order.status === OrderStatus.Complete)
            return msg.ack()

        //change order status to cancelled
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save()

        //emit OrderCancelledEvent
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    }
}