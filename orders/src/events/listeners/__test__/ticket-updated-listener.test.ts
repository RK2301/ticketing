import mongoose from "mongoose"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedEvent } from "@rkh-ms/common"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
    //create an instance of the listners
    const listener = new TicketUpdatedListener(natsWrapper.client)

    //create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'First Ticket',
        price: 200,
    })
    await ticket.save()

    //create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        price: 2000,
        title: 'First Ticket2',
        version: ticket.version + 1,
        userId: new mongoose.Types.ObjectId().toHexString()
    }

    //create a fake message object
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, ticket, data, msg }
}

it('finds, update and save a ticket', async () => {

    const { listener, ticket, data, msg } = await setup()

    //call onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    //re-fecth the ticket from Ticket collection
    //to make an assertions
    const updatedTicket = await Ticket.findById(ticket.id)

    //write assertions to make sure a ticket was created !
    expect(updatedTicket).toBeDefined()
    expect(updatedTicket?.version).toEqual(data.version)
    expect(updatedTicket?.title).toEqual(data.title)
    expect(updatedTicket?.price).toEqual(data.price)
})

it("acks a message", async () => {

    const { listener, data, msg } = await setup()

    //call onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    //write assertions to make sure a ack was called !
    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number - out of order', async () => {
    const { listener, ticket, data, msg } = await setup()
    data.version++;

    try {
        //call onMessage function with the data object + message object
        await listener.onMessage(data, msg)
    } catch (err) { }

    const updatedTicket = await Ticket.findById(data.id)

    expect(msg.ack).not.toHaveBeenCalled()
    expect(updatedTicket?.version).toEqual(ticket.version)
})