import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET all vehicles or with filters
export async function GET(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const region = searchParams.get('region');

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (region) filter.region = region;

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ vehicles }, { status: 200 });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE a new vehicle
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['manager', 'dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const vehicle = await Vehicle.create(body);

    return NextResponse.json(
      { message: 'Vehicle created', vehicle },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
