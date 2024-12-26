import express from "express";
import { json } from "body-parser";
import CookieSession from "cookie-session";
import { indexOrderRouter } from "./routes";
import { currentUser, errorHandler, NotFoundError } from "@rkh-ms/common";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
//that because the traffic is being proximate to our app
//using ingress and ngrix
//so express will trust traffic even it's come from that proxy
app.set("trust proxy", true);

app.use(json());
app.use(
  CookieSession({
    secure: false,
    signed: false,
  })
);

app.use(currentUser);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);
app.use(deleteOrderRouter);

app.use("*", (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
