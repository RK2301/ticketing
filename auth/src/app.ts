import express from "express";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler, NotFoundError } from "@rkh-ms/common";
import "express-async-errors";
import CookieSession from "cookie-session";

const app = express();
//that becuase the traffic is being proximate to our app
//using ingress and ngrix
//so express will trust traffic even it's come from that proxy
app.set("trust proxy", true);

app.use(json());
app.use(
  CookieSession({
    signed: false,
    secure: false
    //secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});
app.use(errorHandler);

export { app };
