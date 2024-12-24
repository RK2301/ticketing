import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("return 404 if ticket not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const res = await request(app).get(`/api/tickets/${id}`).send();
  expect(res.status).toEqual(404);
});

it("return the ticket if the ticket found", async () => {
  const title = "Concert";
  const price = 20;

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketRes.body.title).toEqual(title);
  expect(ticketRes.body.price).toEqual(price);
});
