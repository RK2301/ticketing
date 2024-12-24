import { OrderCreatedEvent, OrderStatus } from "@rkh-ms/common"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"

const setup = async () => {
    //create instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    //create ticket
    const ticket = Ticket.build({
        title: 'Just a ticket',
        price: 200,
        userId: '123'
    })

    //save the ticket
    await ticket.save()

    //create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: '1234',
        version: 0,
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }

    //create Message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    //return the values
    return { listener, ticket, data, msg }
}

it('set the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data, msg)

    //fetch the ticket agian
    const updatedTicekt = await Ticket.findById(ticket.id)

    //check if the orderId updated 
    expect(updatedTicekt).toBeDefined()
    expect(updatedTicekt!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(msg.ack).toHaveBeenCalled()
})

it('publish ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup()
    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    //get the data that the ticket updated publisher has published
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId)

})