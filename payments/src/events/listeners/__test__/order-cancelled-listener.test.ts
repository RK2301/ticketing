import mongoose from "mongoose"
import { Order } from "../../../models/order"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import { OrderCancelledEvent, OrderStatus } from "@rkh-ms/common"
import { Message } from "node-nats-streaming"


const setup = async () => {
    //create listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    //create a order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: '1213e1d',
        price: 10
    })
    await order.save()

    //create data 
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }
    //create msg object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {
        listener,
        data,
        msg
    }
}

it('updates the status of the order', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)

    //fetch the order
    const updatedOrder = await Order.findById(data.id)

    //expection
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the msg', async () => {
    const { listener, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})