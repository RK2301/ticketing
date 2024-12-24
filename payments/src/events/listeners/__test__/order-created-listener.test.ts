import { OrderCreatedEvent, OrderStatus } from "@rkh-ms/common"
import { OrderCreatedListener } from "../order-created-listeners"
import { natsWrapper } from "../../../nats-wrapper"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Order } from "../../../models/order"

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client)

    //create a data 
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        version: 0,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 70
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

it('create a order', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    //fetch the Order 
    const order = await Order.findById(data.id)

    expect(order).toBeDefined()
    expect(order!.id).toEqual(data.id)
    expect(order!.version).toEqual(0)
    expect(order!.price).toEqual(data.ticket.price)
})

it('acks the msg', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})