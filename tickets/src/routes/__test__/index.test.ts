import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "Hello",
    price: 20,
  });
};

it("can fetch list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const allTickets = await request(app).get("/api/tickets").send().expect(200);
  expect(allTickets.body.length).toEqual(3);
});
