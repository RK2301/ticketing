import express from "express";
import { json } from "body-parser";
import CookieSession from "cookie-session";
import { NotFoundError, currentUser, errorHandler } from "@rkh-ms/common";
import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";

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
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(createTicketRouter);
app.use(updateTicketRouter);

app.all("*", (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
