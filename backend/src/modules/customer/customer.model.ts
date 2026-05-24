import mongoose, { InferSchemaType } from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

export type CustomerDocument = InferSchemaType<typeof customerSchema> & { _id: mongoose.Types.ObjectId };
export const Customer = mongoose.model("Customer", customerSchema);
