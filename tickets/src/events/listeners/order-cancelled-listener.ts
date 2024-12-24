import { Listener, OrderCancelledEvent, Subjects } from "@rkh-ms/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publisher/ticket-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    readonly queueGroupName: string = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        //fetch ticket from the db
        const ticket = await Ticket.findById(data.ticket.id)
        if (!ticket)
            throw new Error('Ticket Not Found')

        //set orderId prop to null
        ticket.set({
            orderId: undefined
        })
        await ticket.save()

        //publish event that indicate ticket update
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        })

        //ack the message 
        msg.ack()
    }
}