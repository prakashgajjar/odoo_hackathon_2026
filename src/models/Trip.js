import mongoose from "mongoose";
import Counter from "./Counter";

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      unique: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },

    origin: {
      type: String,
      required: true,
    },

    destination: {
      type: String,
      required: true,
    },

    cargoWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    cargoDescription: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "dispatched",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "draft",
    },

    startOdometer: {
      type: Number,
      default: null,
    },

    endOdometer: {
      type: Number,
      default: null,
    },

    distance: {
      type: Number,
      default: 0,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },

    revenue: {
      type: Number,
      default: 0,
    },

    complianceCheck: {
      driverLicenseValid: Boolean,
      vehicleCapacityValid: Boolean,
      vehicleInService: Boolean,
    },
  },
  { timestamps: true }
);

/* ================================
   SAFE AUTO TRIP NUMBER GENERATION
================================ */

tripSchema.pre("save", async function (next) {
  try {
    if (!this.tripNumber) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "tripNumber" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      this.tripNumber = `TRIP-${date}-${String(counter.seq).padStart(
        4,
        "0"
      )}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

/* ================================
   DISTANCE CALCULATION
================================ */

tripSchema.pre("save", function (next) {
  if (
    this.startOdometer !== null &&
    this.endOdometer !== null &&
    this.endOdometer >= this.startOdometer
  ) {
    this.distance = this.endOdometer - this.startOdometer;
  }

  next();
});

export default mongoose.models.Trip ||
  mongoose.model("Trip", tripSchema);