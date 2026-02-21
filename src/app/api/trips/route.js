import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Trip from '@/models/Trip';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET all trips
export async function GET(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter = {};
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('vehicleId', 'name licensePlate type maxCapacity')
      .populate('driverId', 'name licenseNumber status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error('Get trips error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE a new trip
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    // Prevent tripNumber from being set by frontend
    if ('tripNumber' in body) delete body.tripNumber;
    const { vehicleId, driverId, cargoWeight } = body;

    // Validate vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'available') {
      return NextResponse.json(
        { message: 'Vehicle is not available' },
        { status: 400 }
      );
    }

    // Validate cargo weight doesn't exceed capacity
    if (cargoWeight > vehicle.maxCapacity) {
      return NextResponse.json(
        { message: `Cargo weight exceeds vehicle capacity (Max: ${vehicle.maxCapacity}kg)` },
        { status: 400 }
      );
    }

    // Validate driver exists and is available
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return NextResponse.json(
        { message: 'Driver not found' },
        { status: 404 }
      );
    }

    if (driver.status !== 'on_duty') {
      return NextResponse.json(
        { message: 'Driver is not on duty' },
        { status: 400 }
      );
    }

    // Check driver license validity
    if (!driver.isLicenseValid()) {
      return NextResponse.json(
        { message: 'Driver license is expired' },
        { status: 400 }
      );
    }

    // Create trip with compliance checks (use save to trigger pre-save hook)
    const trip = new Trip({
      ...body,
      status: 'draft',
      complianceCheck: {
        driverLicenseValid: driver.isLicenseValid(),
        vehicleCapacityValid: cargoWeight <= vehicle.maxCapacity,
        vehicleInService: vehicle.status === 'available',
      },
    });
    await trip.save();

    return NextResponse.json(
      { message: 'Trip created', trip },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create trip error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
