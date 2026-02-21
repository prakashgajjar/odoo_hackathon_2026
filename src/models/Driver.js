import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide driver name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      unique: true,
    },
    licenseCategory: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
      required: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, 'Please provide license expiry date'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth'],
    },
    status: {
      type: String,
      enum: ['on_duty', 'off_duty', 'suspended'],
      default: 'off_duty',
    },
    safetyScore: {
      type: Number, // 0-100
      default: 100,
      min: 0,
      max: 100,
    },
    tripsCompleted: {
      type: Number,
      default: 0,
    },
    totalKmDriven: {
      type: Number,
      default: 0,
    },
    vehicleAssignments: [
      {
        vehicleId: mongoose.Schema.Types.ObjectId,
        assignedDate: Date,
        unassignedDate: Date,
        isPrimary: Boolean,
      },
    ],
    incidents: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joinDate: {
      type: Date,
      default: new Date(),
    },
  },
  { timestamps: true }
);

// Check if license is expired
driverSchema.methods.isLicenseValid = function () {
  return this.licenseExpiryDate > new Date();
};

export default mongoose.models.Driver || mongoose.model('Driver', driverSchema);
