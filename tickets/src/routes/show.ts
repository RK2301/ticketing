import express, { Request, Response } from "express";
import { Ticket } from "../models/ticket";
import { NotFoundError } from "@rkh-ms/common";
import "express-async-errors";

const router = express.Router();

router.get("/api/tickets/:id", async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  //if there are no ticket with the recieved id so throw a error to return 404
  if (!ticket) throw new NotFoundError();

  res.send(ticket);
});

export { router as showTicketRouter };
