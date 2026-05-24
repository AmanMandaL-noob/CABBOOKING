import mongoose, { InferSchemaType } from "mongoose";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    vehicleInfo: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      plateNumber: { type: String, required: true },
      color: { type: String }
    },
    isOnline: { type: Boolean, default: false },
    currentLocation: { type: pointSchema, index: "2dsphere" }
  },
  { timestamps: true }
);

export type DriverDocument = InferSchemaType<typeof driverSchema> & { _id: mongoose.Types.ObjectId };
export const Driver = mongoose.model("Driver", driverSchema);
