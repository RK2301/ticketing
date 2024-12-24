import mongoose from "mongoose"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { ExpirationCompleteListener } from "../expiration-complete-listener"
import { Order, OrderStatus } from "../../../models/order"
import { Message } from "node-nats-streaming"
import { ExpirationCompleteEvent } from "@rkh-ms/common"

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Just a Ticket',
        price: 200
    })
    await ticket.save()

    const order = Order.build({
        userId: '123',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    })
    await order.save()

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //return all
    return {
        listener,
        ticket,
        order,
        data,
        msg
    }
}

it('updates order status to cancelled', async () => {
    const { listener, ticket, order, data, msg } = await setup()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit order cancelled event', async () => {
    const { listener, ticket, order, data, msg } = await setup()

    await listener.onMessage(data, msg)
    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    expect(eventData.id).toEqual(order.id)
    expect(eventData.ticket.id).toEqual(ticket.id)
})

it('Not update order status to cancelled if user paid whithin 15min', async () => {
    const { listener, ticket, order, data, msg } = await setup()

    //updates order status to Completed
    order.set({
        status: OrderStatus.Complete
    })
    await order.save()

    await listener.onMessage(data, msg)

    const updatedOrder = await Order.findById(order.id)
    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Complete)

})

it('ack the msg', async () => {
    const { listener, ticket, order, data, msg } = await setup()

    await listener.onMessage(data, msg)
    expect(msg.ack).toHaveBeenCalled()
})