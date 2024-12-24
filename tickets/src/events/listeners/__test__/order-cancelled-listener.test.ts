import { OrderCancelledEvent } from "@rkh-ms/common"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"


const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const ticket = Ticket.build({
        title: 'Simple Ticket',
        price: 200,
        userId: 'abc'
    })
    await ticket.save()

    //data represent an order cancelled event
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 1,
        ticket: {
            id: ticket.id
        }
    }

    //assign ticket to an order
    ticket.set({
        orderId: data.id
    })
    await ticket.save()

    //create message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('ticket updated & ack and publish a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()

    //publish order cancelled event
    await listener.onMessage(data, msg)

    //fetch the ticket again
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket).toBeDefined()

    //orderId now should be null
    expect(updatedTicket!.orderId).not.toBeDefined()

    //ack func should be called
    expect(msg.ack).toHaveBeenCalled()

    //publish event ticket updated
    expect(natsWrapper.client.publish).toHaveBeenCalled()
})