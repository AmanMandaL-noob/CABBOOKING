import mongoose, { InferSchemaType } from "mongoose";

const driverLocationSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true, unique: true, index: true },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point", required: true },
      coordinates: { type: [Number], required: true }
    },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

driverLocationSchema.index({ coordinates: "2dsphere" });

export type DriverLocationDocument = InferSchemaType<typeof driverLocationSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema);
