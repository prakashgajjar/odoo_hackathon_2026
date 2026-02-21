import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single driver
export async function GET(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const driver = await Driver.findById(params.id);
    if (!driver) {
      return NextResponse.json(
        { message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ driver }, { status: 200 });
  } catch (error) {
    console.error('Get driver error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE driver
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['manager', 'dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const driver = await Driver.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      return NextResponse.json(
        { message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Driver updated', driver },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update driver error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
