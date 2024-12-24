import express, { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest, BadRequestError } from "@rkh-ms/common";
import { User } from "../models/user";
import "express-async-errors";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email Must Be Valid"),
    body("password").trim().notEmpty().withMessage("You Must Enter a Password"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password }: { email: string; password: string } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      throw new BadRequestError("Please Check You Email or Password");

    const passMatch = await Password.compare(existingUser.password, password);
    if (!passMatch)
      throw new BadRequestError("Please Check You Email or Password");

    //send cookie with JWT
    //generate JWT & send it back inside a cookie to the client
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    //store the token to the session
    req.session = {
      jwt: userJWT,
    };
    res.status(200).send();
  }
);

export { router as signinRouter };
