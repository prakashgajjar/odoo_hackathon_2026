import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide vehicle name'],
    },
    licensePlate: {
      type: String,
      required: [true, 'Please provide license plate'],
      unique: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide vehicle model'],
    },
    type: {
      type: String,
      enum: ['truck', 'van', 'bike', 'car'],
      required: true,
    },
    maxCapacity: {
      type: Number, // in kg
      required: [true, 'Please provide max load capacity'],
      min: 0,
    },
    odometer: {
      type: Number, // in km
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'on_trip', 'in_shop', 'retired'],
      default: 'available',
    },
    acquisitionCost: {
      type: Number, // in currency units
      default: 0,
    },
    acquisitionDate: {
      type: Date,
      default: new Date(),
    },
    region: {
      type: String,
      default: 'main',
    },
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },
    nextMaintenanceDate: {
      type: Date,
      default: null,
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'hybrid'],
      default: 'diesel',
    },
    averageFuelConsumption: {
      type: Number, // km per liter
      default: 0,
    },
    isOutOfService: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
