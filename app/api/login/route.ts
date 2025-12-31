// DEV ONLY: Simple admin login API route
// This will be replaced with proper authentication later
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json();

    if (!phone || !pin) {
      return NextResponse.json(
        { error: "Phone and PIN are required" },
        { status: 400 }
      );
    }

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 500 }
      );
    }

    // Find user by phone and check if they're an admin
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || user.role !== "ADMIN") {
      // Generic error message for security
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify PIN
    const isValidPin = await bcrypt.compare(pin, user.pinHash);
    if (!isValidPin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Login error:", error);
    // Log more details in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
    }
    
    // Provide more specific error messages
    if (error?.message?.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "Database configuration error. Please contact administrator." },
        { status: 500 }
      );
    }
    
    if (error?.message?.includes("connect") || error?.message?.includes("connection")) {
      return NextResponse.json(
        { error: "Unable to connect to database. Please try again later." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}

