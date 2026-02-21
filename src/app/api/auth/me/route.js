import { NextResponse } from 'next/server';
import { getUserFromCookie } from '@/lib/clientAuth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const currentUser = await User.findById(user.userId);

    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: currentUser._id,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
          department: currentUser.department,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
