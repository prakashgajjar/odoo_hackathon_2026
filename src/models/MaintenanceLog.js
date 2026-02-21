import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['oil_change', 'tire_rotation', 'brake_service', 'filter_replacement', 'inspection', 'repair', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceDate: {
      type: Date,
      required: true,
    },
    odometerAtService: {
      type: Number,
      required: true,
    },
    completionDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    servicedBy: {
      type: String,
      default: 'external_vendor',
    },
    notes: {
      type: String,
      default: '',
    },
    parts: [
      {
        name: String,
        cost: Number,
        quantity: Number,
      },
    ],
    laborCost: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// When maintenance is in progress or completed, vehicle status should reflect "in_shop"
maintenanceLogSchema.post('save', async function (doc) {
  const Vehicle = mongoose.model('Vehicle');
  if (doc.status === 'in_progress' || doc.status === 'scheduled') {
    await Vehicle.findByIdAndUpdate(doc.vehicleId, { status: 'in_shop' });
  } else if (doc.status === 'completed') {
    // Check if there are any other ongoing maintenance records
    const ongoingMaintenance = await mongoose.model('MaintenanceLog').findOne({
      vehicleId: doc.vehicleId,
      status: { $in: ['scheduled', 'in_progress'] },
      _id: { $ne: doc._id },
    });
    if (!ongoingMaintenance) {
      await Vehicle.findByIdAndUpdate(doc.vehicleId, { status: 'available' });
    }
  }
});

export default mongoose.models.MaintenanceLog || mongoose.model('MaintenanceLog', maintenanceLogSchema);
