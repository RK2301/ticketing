import express, { Request, Response } from "express";
import "express-async-errors";
import { Order } from "../models/order";
import {
  NotAuthroizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@rkh-ms/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) throw new NotFoundError();

    //user must make the order in order to cancel it
    if (order.userId !== req.currentUser!.id) throw new NotAuthroizedError();

    //update order status to CANCELLED
    order.status = OrderStatus.Cancelled;
    await order.save();

    //publish an event that the order has been cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
