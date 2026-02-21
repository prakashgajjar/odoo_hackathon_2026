import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Trip from '@/models/Trip';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single trip
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const trip = await Trip.findById(id)
      .populate('vehicleId')
      .populate('driverId');
    
    if (!trip) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trip }, { status: 200 });
  } catch (error) {
    console.error('Get trip error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE trip (dispatch, complete, or cancel)
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user || !['dispatcher', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { status: newStatus, startOdometer, endOdometer, cancelReason } = body;

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      );
    }

    // Validate status transitions
    const validTransitions = {
      draft: ['dispatched', 'cancelled'],
      dispatched: ['in_progress', 'completed', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[trip.status]?.includes(newStatus)) {
      return NextResponse.json(
        {
          message: `Cannot transition from "${trip.status}" to "${newStatus}"`,
        },
        { status: 400 }
      );
    }

    // Handle status transitions
    if (newStatus === 'dispatched') {
      // Set vehicle and driver to active trip
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'in_service' });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'on_duty' });
      trip.startTime = new Date();
    } else if (newStatus === 'in_progress') {
      // Trip is currently in progress
      trip.startTime = trip.startTime || new Date();
    } else if (newStatus === 'completed') {
      // Validate completion
      if (!endOdometer) {
        return NextResponse.json(
          { message: 'End odometer reading is required for completion' },
          { status: 400 }
        );
      }
      // Set vehicle and driver back to available
      await Vehicle.findByIdAndUpdate(trip.vehicleId, {
        status: 'available',
        odometer: endOdometer,
      });
      await Driver.findByIdAndUpdate(trip.driverId, {
        status: 'off_duty',
      });
      trip.endOdometer = endOdometer;
      trip.endTime = new Date();
    } else if (newStatus === 'cancelled') {
      // Reset vehicle and driver if trip is cancelled
      if (trip.vehicleId && trip.status !== 'completed') {
        await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'available' });
      }
      if (trip.driverId && trip.status !== 'completed') {
        await Driver.findByIdAndUpdate(trip.driverId, { status: 'off_duty' });
      }
      trip.notes = cancelReason || trip.notes;
    }

    trip.status = newStatus;
    if (startOdometer !== undefined) trip.startOdometer = startOdometer;

    const updatedTrip = await trip.save();

    // Populate references before returning
    await updatedTrip.populate('vehicleId');
    await updatedTrip.populate('driverId');

    return NextResponse.json(
      { message: 'Trip status updated successfully', trip: updatedTrip },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update trip error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
