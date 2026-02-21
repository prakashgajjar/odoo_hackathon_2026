import mongoose from 'mongoose';

const serviceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    reason: {
      type: String,
      enum: ['maintenance', 'repair', 'inspection', 'recall', 'other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// When service log is active, set vehicle status to "in_shop"
serviceLogSchema.post('save', async function (doc) {
  const Vehicle = mongoose.model('Vehicle');
  if (doc.status === 'active') {
    await Vehicle.findByIdAndUpdate(doc.vehicleId, { status: 'in_shop' });
  } else if (doc.status === 'completed' || doc.status === 'cancelled') {
    // Check if there are any other active service logs
    const activeServiceLog = await mongoose.model('ServiceLog').findOne({
      vehicleId: doc.vehicleId,
      status: 'active',
      _id: { $ne: doc._id },
    });
    if (!activeServiceLog) {
      await Vehicle.findByIdAndUpdate(doc.vehicleId, { status: 'available' });
    }
  }
});

export default mongoose.models.ServiceLog || mongoose.model('ServiceLog', serviceLogSchema);
