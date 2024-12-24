import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketCreatedListener } from "../ticket-created-listener"
import { TicketCreatedEvent } from "@rkh-ms/common"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"

const setup = async () => {
    //create an instance of the listners
    const listener = new TicketCreatedListener(natsWrapper.client)

    //create a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        title: 'A Ticket',
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    //create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg }
}

it('creates and save a ticket', async () => {

    const { listener, data, msg } = await setup()

    //call onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    //write assertions to make sure a ticket was created !
    const ticket = await Ticket.findById(data.id)
    expect(ticket).toBeDefined()
    expect(ticket?.version).toEqual(0)
    expect(ticket?.title).toEqual(data.title)
    expect(ticket?.price).toEqual(data.price)
})

it("acks a message", async () => {

    const { listener, data, msg } = await setup()
    //call onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    //write assertions to make sure a ack was called !
    expect(msg.ack).toHaveBeenCalled()
})