import request from "supertest";
import { app } from "../../app";

it("response with details about current user", async () => {
  const cookie = await global.signin("rami.khattab0@gmail.com", "password");

  const res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual("rami.khattab0@gmail.com");
});

it("response with null if not auth", async () => {
  const res = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);
  expect(res.body.currentUser).toEqual(null);
});
