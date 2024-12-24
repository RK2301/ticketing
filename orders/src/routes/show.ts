import express, { Request, Response } from "express";
import { Order } from "../models/order";
import "express-async-errors";
import { NotAuthroizedError, NotFoundError, requireAuth } from "@rkh-ms/common";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    if (!order) throw new NotFoundError();

    //user can't access orders he haven't made
    if (order.userId !== req.currentUser!.id) throw new NotAuthroizedError();

    res.send(order);
  }
);

export { router as showOrderRouter };
