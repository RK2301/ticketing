import express, { Request, Response } from "express";
import { body } from "express-validator";
import "express-async-errors";
import { User } from "../models/user";
import { BadRequestError, validateRequest } from "@rkh-ms/common";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 to 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password }: { email: string; password: string } = req.body;
    const existingUser = await User.findOne({ email });

    //if exists then response with error
    //otherwise add the user to DB
    if (existingUser) throw new BadRequestError("Email Is Already Exists!");
    else {
      //create the user
      const user = User.build({
        email: email,
        password: password,
      });

      //save it to DB
      await user.save();

      //generate JWT & send it back inside a cookie to the client
      const userJWT = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_KEY!
      );

      //store the token to the session
      req.session = {
        jwt: userJWT,
      };
      res.status(201).send(user);
    }
  }
);

export { router as signupRouter };
