import mongoose, { InferSchemaType } from "mongoose";
import { RIDE_STATUS } from "@cab/shared";

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true }
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", index: true },
    pickup: { type: pointSchema, required: true, index: "2dsphere" },
    destination: { type: pointSchema, required: true },
    status: {
      type: String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.requested,
      index: true
    },
    distanceToPickup: { type: Number },
    startOtpHash: { type: String },
    startOtpExpiresAt: { type: Date },
    startOtp: { type: String },
    endOtpHash: { type: String },
    endOtpExpiresAt: { type: Date },
    endOtp: { type: String }
  },
  { timestamps: true }
);

export type RideDocument = InferSchemaType<typeof rideSchema> & { _id: mongoose.Types.ObjectId };
export const Ride = mongoose.model("Ride", rideSchema);
