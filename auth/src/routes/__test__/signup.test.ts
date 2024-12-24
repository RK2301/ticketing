import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "password",
    })
    .expect(201);
});

it("return 400 status code, with invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "asdasdasd",
      password: "hello",
    })
    .expect(400);
});

it("return 400 status code, with invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "h",
    })
    .expect(400);
});

it("return 400 status code, with missing email or password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
    })
    .expect(400);

  await request(app)
    .post("/api/users/signup")
    .send({
      password: "aaa",
    })
    .expect(400);
});

it("disallows duplicate email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "hello",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "hello",
    })
    .expect(400);
});

it("sets a cookie after successful signup", async () => {
  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "hello",
    })
    .expect(201);

  expect(res.get("Set-Cookie")).toBeDefined();
});
