import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya xatosi",
          error: "Autentifikatsiya kerak",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = { user: user.userId };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate("car", "brand model year pricePerDay images location")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    // Statistikalar
    const stats = await Booking.aggregate([
      { $match: { user: user.userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
        },
      },
    ]);

    const statusStats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalSpent: 0,
    };

    stats.forEach((stat) => {
      statusStats[stat._id as keyof typeof statusStats] = stat.count;
      if (stat._id === "completed") {
        statusStats.totalSpent = stat.totalAmount;
      }
    });

    return NextResponse.json({
      success: true,
      message: "Buyurtmalar muvaffaqiyatli olindi",
      data: {
        bookings,
        stats: statusStats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Buyurtmalarni olishda xatolik",
      },
      { status: 500 }
    );
  }
}
