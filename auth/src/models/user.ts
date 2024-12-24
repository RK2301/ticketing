//define mongoose usere model
import mongoose from "mongoose";
import { Password } from "../services/password";

//interface that describe the properties
//that required for new user
interface userAttrs {
  email: string;
  password: string;
}

//interface that describe the properties
//a user document should have
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

//interface that describe properties
//that user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: userAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  //we only want to hash if the password has changed
  //like we don't want to hash password for user has update it's data but not the password
  //first time create the user, the password consider as modified
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

//any time we want to create user, we will call this function instead of
//calling new user
//that help TS for type checking
userSchema.statics.build = (attrs: userAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
export { User };
