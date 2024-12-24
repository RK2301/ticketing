import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@rkh-ms/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        //Find the ticket the order trying to reserve
        const ticket = await Ticket.findById(data.ticket.id)

        //throw error if ticket not found
        if (!ticket)
            throw new Error('Ticket Not Found')

        //mark ticket as being reserved by setting the orderId prop
        ticket.set({
            orderId: data.id
        })

        //save the ticket
        await ticket.save()

        //publish event describe change to the ticket
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            version: ticket.version,
            userId: ticket.userId,
            orderId: ticket.orderId
        })

        msg.ack()
    }
}