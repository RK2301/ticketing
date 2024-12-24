import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import {
  BadRequestError,
  NotAuthroizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@rkh-ms/common";
import { body } from "express-validator";
import "express-async-errors";
import { TicketUpdatedPublisher } from "../events/publisher/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").notEmpty().withMessage("Title must be defined"),
    body("price")
      .notEmpty()
      .withMessage("Price must be defined")
      .isFloat({ gt: 0 })
      .withMessage("Price must be number greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price }: { title: string; price: number } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw new NotFoundError();

    //only user create the ticket can update it's content
    if (ticket.userId !== req.currentUser!.id) throw new NotAuthroizedError();

    // if the ticket is reserved then reject an update
    if (ticket.orderId) throw new BadRequestError('Cannot edit reserved ticket')

    //update the ticket with the given title & price
    ticket.set({
      title: title,
      price: price,
    });
    await ticket.save();

    //publish event indicate update ticket
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as updateTicketRouter };
