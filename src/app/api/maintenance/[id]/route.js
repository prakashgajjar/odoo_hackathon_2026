import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MaintenanceLog from '@/models/MaintenanceLog';
import Vehicle from '@/models/Vehicle';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single maintenance log
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const log = await MaintenanceLog.findById(id).populate('vehicleId', 'name licensePlate status');
    if (!log) {
      return NextResponse.json(
        { message: 'Maintenance log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (error) {
    console.error('Get maintenance log error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE maintenance log status
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user || !['manager', 'safety_officer'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { status: newStatus, completionDate, notes } = body;

    const log = await MaintenanceLog.findById(id).populate('vehicleId');
    if (!log) {
      return NextResponse.json(
        { message: 'Maintenance log not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions = {
      scheduled: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[log.status]?.includes(newStatus)) {
      return NextResponse.json(
        {
          message: `Cannot transition from "${log.status}" to "${newStatus}"`,
        },
        { status: 400 }
      );
    }

    // Update maintenance log
    log.status = newStatus;
    if (notes) log.notes = notes;

    // Handle status transitions
    if (newStatus === 'in_progress') {
      // Mark service start time
      log.serviceDate = log.serviceDate || new Date();
      // Update vehicle status to in_shop
      await Vehicle.findByIdAndUpdate(log.vehicleId._id, { status: 'in_shop' });
    } else if (newStatus === 'completed') {
      // Mark completion date
      log.completionDate = completionDate || new Date();
      // Check if there are any other ongoing maintenance records
      const ongoingMaintenance = await MaintenanceLog.findOne({
        vehicleId: log.vehicleId._id,
        status: { $in: ['scheduled', 'in_progress'] },
        _id: { $ne: log._id },
      });
      // If no other ongoing maintenance, set vehicle back to available
      if (!ongoingMaintenance) {
        await Vehicle.findByIdAndUpdate(log.vehicleId._id, { status: 'available' });
      }
    } else if (newStatus === 'cancelled') {
      // Check if there are any other ongoing maintenance records
      const ongoingMaintenance = await MaintenanceLog.findOne({
        vehicleId: log.vehicleId._id,
        status: { $in: ['scheduled', 'in_progress'] },
        _id: { $ne: log._id },
      });
      // If no other ongoing maintenance, set vehicle back to available
      if (!ongoingMaintenance) {
        await Vehicle.findByIdAndUpdate(log.vehicleId._id, { status: 'available' });
      }
    }

    await log.save();

    // Populate before returning
    await log.populate('vehicleId', 'name licensePlate status');

    return NextResponse.json(
      { message: 'Maintenance status updated successfully', log },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update maintenance log error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
