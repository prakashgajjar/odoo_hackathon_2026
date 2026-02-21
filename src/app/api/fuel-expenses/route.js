import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FuelExpense from '@/models/FuelExpense';
import { getUserFromCookie } from '@/lib/clientAuth';

// GET all fuel expenses
export async function GET(req) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const tripId = searchParams.get('tripId');

    const filter = {};
    if (vehicleId) filter.vehicleId = vehicleId;
    if (tripId) filter.tripId = tripId;

    const expenses = await FuelExpense.find(filter)
      .populate('vehicleId', 'name licensePlate')
      .populate('tripId', 'tripNumber')
      .sort({ fuelDate: -1 });

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (error) {
    console.error('Get fuel expenses error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CREATE a new fuel expense
export async function POST(req) {
  try {
    const user = await getUserFromCookie();
    if (!user || !['dispatcher', 'manager', 'financial_analyst'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const body = await req.json();
    const expense = await FuelExpense.create(body);

    return NextResponse.json(
      { message: 'Fuel expense recorded', expense },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create fuel expense error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
