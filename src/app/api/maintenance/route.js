import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MaintenanceLog from '@/models/MaintenanceLog';
import Vehicle from '@/models/Vehicle';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET all maintenance logs
export async function GET(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');

    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;

    const logs = await MaintenanceLog.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .sort({ serviceDate: -1 });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE a new maintenance log
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['manager', 'safety_officer'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const log = await MaintenanceLog.create(body);

    return NextResponse.json(
      { message: 'Maintenance log created', log },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create maintenance log error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
