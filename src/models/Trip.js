import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      unique: true,
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
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
      type: Number, // in kg
      required: true,
      min: 0,
    },
    cargoDescription: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'dispatched', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
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
      type: Number, // calculated as endOdometer - startOdometer
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
      default: '',
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

// Auto-generate trip number
tripSchema.pre('save', async function (next) {
  if (!this.tripNumber) {
    const count = await mongoose.model('Trip').countDocuments();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.tripNumber = `TRIP-${date}-${count + 1}`;
  }
  next();
});

// Calculate distance
tripSchema.pre('save', function (next) {
  if (this.startOdometer && this.endOdometer) {
    this.distance = this.endOdometer - this.startOdometer;
  }
  next();
});

export default mongoose.models.Trip || mongoose.model('Trip', tripSchema);
