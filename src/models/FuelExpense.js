import mongoose from 'mongoose';

const fuelExpenseSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    liters: {
      type: Number,
      required: [true, 'Please provide liters amount'],
      min: 0,
    },
    cost: {
      type: Number,
      required: [true, 'Please provide cost'],
      min: 0,
    },
    fuelDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    odometerReading: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric', 'hybrid'],
      required: true,
    },
    supplier: {
      type: String,
      default: 'fuel_station',
    },
    location: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Calculate efficiency
fuelExpenseSchema.methods.calculateEfficiency = function (previousOdometer) {
  const distance = this.odometerReading - previousOdometer;
  if (this.liters > 0) {
    return (distance / this.liters).toFixed(2); // km per liter
  }
  return 0;
};

export default mongoose.models.FuelExpense || mongoose.model('FuelExpense', fuelExpenseSchema);
