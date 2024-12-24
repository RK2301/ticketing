import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

const createTicketId = () => new mongoose.Types.ObjectId().toHexString();

it("returns 404 if the provided id does not exists", async () => {
  await request(app)
    .put(`/api/tickets/${createTicketId()}`)
    .set("Cookie", global.signin())
    .send({
      title: "Hello",
      price: 12,
    })
    .expect(404);
});

it("returns 401 if the user not authenticated", async () => {
  await request(app)
    .put(`/api/tickets/${createTicketId()}`)
    .send({
      title: "Hello",
      price: 12,
    })
    .expect(401);
});

it("returns 401 if the user does not own the ticket ", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "Hello",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Hi",
      price: 12,
    })
    .expect(401);
});

it("returns 400 if the user provide invalid title or price", async () => {
  //same user in the multiple requests
  const cookie = global.signin();

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Hello",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Hi",
      price: true,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  //same user in the multiple requests
  const cookie = global.signin();

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Hello",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Hello",
      price: 25,
    })
    .expect(200);

  //we can also fetch the ticket again and check if changes realy done
  const checkChangesRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);
  expect(checkChangesRes.body.title).toEqual("Hello");
  expect(checkChangesRes.body.price).toEqual(25);
});

it("Publish Event Called", async () => {
  //same user in the multiple requests
  const cookie = global.signin();

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "Hello",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "Hello",
      price: 25,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('reject update if ticket is reserved', async () => {
  const cookie = global.signin()

  const { body: ticket } = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Simple Ticket',
      price: 200
    })
    .expect(201)

  //access db and set orderId for the created ticket
  const updatedTicket = await Ticket.findById(ticket.id)
  updatedTicket!.set({
    orderId: new mongoose.Types.ObjectId().toHexString()
  })
  await updatedTicket!.save()

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Just a ticket !!',
      price: 500
    })
    .expect(400)

})
