import request from "supertest";
import { app } from "../../app";

it("clears cookie after signout", async () => {
  const resSignup = await request(app)
    .post("/api/users/signup")
    .send({
      email: "rami.khattab0@gmail.com",
      password: "password",
    })
    .expect(201);

  expect(resSignup.get("Set-Cookie")).toBeDefined();

  const resSignout = await request(app)
    .post("/api/users/signout")
    .send({})
    .expect(200);

  const cookies = resSignout.get("Set-Cookie");
  if (!cookies) throw new Error("Expect Cookie but got undefined");
  expect(cookies[0]).toEqual(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});