import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        //fetch the order
        //not really neccessery to look for order by version
        //if not found so may orderCreatedListener not yet processed
        //if found and cancelled so no further updateds will occur
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        })

        if (!order) //throw new Error('Order Not Found')
            return msg.ack()

        //updates status of the order
        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save()

        msg.ack()
    }
}