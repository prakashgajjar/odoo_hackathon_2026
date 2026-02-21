import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Trip from '@/models/Trip';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single trip
export async function GET(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const trip = await Trip.findById(params.id)
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

// UPDATE trip (dispatch or complete)
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['dispatcher', 'manager'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const { status: newStatus, startOdometer, endOdometer } = body;

    const trip = await Trip.findById(params.id);
    if (!trip) {
      return NextResponse.json(
        { message: 'Trip not found' },
        { status: 404 }
      );
    }

    // Update vehicle status based on trip status
    if (newStatus === 'dispatched') {
      // Set vehicle and driver to "on_trip"
      await Vehicle.findByIdAndUpdate(trip.vehicleId, { status: 'on_trip' });
      await Driver.findByIdAndUpdate(trip.driverId, { status: 'on_duty' });
    } else if (newStatus === 'completed') {
      // Set vehicle and driver back to available
      await Vehicle.findByIdAndUpdate(trip.vehicleId, {
        status: 'available',
        odometer: endOdometer,
      });
      await Driver.findByIdAndUpdate(trip.driverId, {
        status: 'off_duty',
        totalKmDriven: trip.distance,
        tripsCompleted: trip.tripsCompleted + 1,
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      params.id,
      {
        ...body,
        status: newStatus,
        startOdometer: startOdometer || trip.startOdometer,
        endOdometer: endOdometer || trip.endOdometer,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: 'Trip updated', trip: updatedTrip },
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
