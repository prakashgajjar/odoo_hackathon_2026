import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Driver from '@/models/Driver';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single driver
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const driver = await Driver.findById(id);
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
    const { id } = await params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    
    let updateFields = body;

    // Only allow drivers to update their own status (on_duty/off_duty)
    if (user.role === 'driver') {
      if (user._id !== id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      // Only allow status change, and only to on_duty/off_duty
      if (!['on_duty', 'off_duty'].includes(body.status)) {
        return NextResponse.json({ message: 'Invalid status for drivers' }, { status: 400 });
      }
      updateFields = { status: body.status };
    } else if (!['manager', 'dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const driver = await Driver.findByIdAndUpdate(id, updateFields, {
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
