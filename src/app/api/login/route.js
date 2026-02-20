import { NextResponse } from "next/server";
import status from "@/utils/status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDb();
  try {
    const body = await req.json();
    const { email, password } = body;

    // console.log(body)

    if (!email || !password) {
      return NextResponse.json({
        status: status.BAD_REQUEST.code,
        error: status.BAD_REQUEST.message,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        status: status.UNAUTHORIZED.code,
        error: status.UNAUTHORIZED.message,
      });
    }

    // console.log(user)

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({
        status: status.UNAUTHORIZED.code,
        error: status.UNAUTHORIZED.message,
      });
    }

    if (!user.isVerified) {
      return NextResponse.json({
        status: status.FORBIDDEN.code,
        error: status.FORBIDDEN.message,
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json({
        status: status.INTERNAL_ERROR.code,
        error: "JWT secret is not defined in environment variables.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      jwtSecret,
      { expiresIn: "2d" }
    );

    console.log(token)

    // Create response and set cookie
    const response = NextResponse.json({
      status: status.OK.code,
      message: status.OK.message,
    });

    response.cookies.set("login", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // set to true in production
      maxAge: 60 * 60 * 24 * 2, // 2 day
      path: "/",
      // sameSite: "strict",
    });

    return response;

  } catch (error) {
    console.error("Error in POST /login:", error);
    return NextResponse.json({
      status: status.INTERNAL_ERROR.code,
      error: status.INTERNAL_ERROR.message,
    });
  }
}
