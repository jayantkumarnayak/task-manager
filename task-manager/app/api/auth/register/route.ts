import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { RegisterSchema } from "@/lib/validation";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input
    const validatedData = RegisterSchema.parse(body);
    const { email, password } = validatedData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          email: user.email,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}