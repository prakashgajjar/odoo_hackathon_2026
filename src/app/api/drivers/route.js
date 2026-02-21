import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET all drivers
export async function GET(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter = { isActive: true };
    if (status) filter.status = status;

    const drivers = await Driver.find(filter).sort({ name: 1 });

    return NextResponse.json({ drivers }, { status: 200 });
  } catch (error) {
    console.error('Get drivers error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE a new driver
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['manager', 'dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const driver = await Driver.create(body);

    return NextResponse.json(
      { message: 'Driver created', driver },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create driver error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
