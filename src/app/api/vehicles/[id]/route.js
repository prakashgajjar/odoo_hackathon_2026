import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vehicle from '@/models/Vehicle';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET single vehicle
export async function GET(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const vehicle = await Vehicle.findById(params.id);
    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vehicle }, { status: 200 });
  } catch (error) {
    console.error('Get vehicle error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// UPDATE vehicle
export async function PUT(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['manager', 'dispatcher'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const vehicle = await Vehicle.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Vehicle updated', vehicle },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE vehicle
export async function DELETE(req, { params }) {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'manager') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const vehicle = await Vehicle.findByIdAndDelete(params.id);
    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Vehicle deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
