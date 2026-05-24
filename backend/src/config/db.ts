import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGO_URI);
  } catch (error) {
    if (error instanceof Error && error.message.includes("bad auth")) {
      console.error(
        [
          "MongoDB authentication failed.",
          "Atlas reached the cluster, but rejected the database username/password in backend/.env.",
          "Reset the Atlas Database Access user password, URL-encode special characters, then update MONGO_URI.",
          "Example: @ must be written as %40 inside the URI password."
        ].join("\n")
      );
    }
    throw error;
  }
}
