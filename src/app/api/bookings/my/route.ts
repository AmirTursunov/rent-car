import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import "@/models/Car";
import { verifyToken } from "@/lib/auth";
import type { ApiResponse } from "@/types";

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
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const filter: any = { user: user.userId };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate("car", "brand carModel year pricePerDay images location")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Booking.countDocuments(filter);

    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      totalSpent: 0,
    };

    // Only aggregate if explicitly requested via query param
    const includeStats = searchParams.get("stats") === "true";
    if (includeStats) {
      const statsData = await Booking.aggregate([
        { $match: { user: user.userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalPrice" },
          },
        },
      ]);

      statsData.forEach((stat) => {
        stats[stat._id as keyof typeof stats] = stat.count;
        if (stat._id === "completed") {
          stats.totalSpent = stat.totalAmount;
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Buyurtmalar muvaffaqiyatli olindi",
      data: {
        bookings,
        stats: includeStats ? stats : undefined,
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
