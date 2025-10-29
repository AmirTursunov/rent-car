import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    // Database connection tekshirish
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "API server ishlayapti",
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        database: "connected",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server ishlamayapti",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          database: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
