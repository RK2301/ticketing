import request from "supertest";
import { app } from "../../app";

it("fails when email does not exists", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "11",
    })
    .expect(400);
});

it("fails when email does not exists", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "pass",
    })
    .expect(400);
});

it("response with cookie with valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "password",
    })
    .expect(201);

  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "password",
    })
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
