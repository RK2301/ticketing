import { Listener, OrderStatus, PaymentCreatedEvent, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";


export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject: Subjects.PayementCreated = Subjects.PayementCreated
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {

        //fetch the order from the db
        const order = await Order.findById(data.orderId)
        if (!order)
            throw new Error('Order not Found')

        //update order status to completed
        order.set({
            status: OrderStatus.Complete
        })
        await order.save()

        msg.ack()
    }
}