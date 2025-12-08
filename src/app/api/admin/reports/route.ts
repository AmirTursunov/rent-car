// app/api/admin/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Car from "@/models/Car";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export const runtime = "nodejs";

function parseDateRange(searchParams: URLSearchParams) {
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");

  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00.000Z")
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDateStr ? new Date(endDateStr + "T23:59:59.999Z") : new Date();

  console.log("📅 Date range:", { start, end });
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    // ✅ Cookie'dan admin tekshirish
    const admin = await verifyToken(request);

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin huquqi kerak" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { start, end } = parseDateRange(searchParams);

    // ✅ 1. Revenue hisoblash (faqat completed)
    const completedMatch = {
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    };

    const [revenueAgg] = await Booking.aggregate([
      { $match: completedMatch },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    console.log("💰 Revenue aggregate:", revenueAgg);

    // ✅ 2. This month vs last month revenue
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999
    );

    const [thisMonthAgg] = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: thisMonthStart, $lte: now },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const [lastMonthAgg] = await Booking.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const revenueTotal = revenueAgg?.total ?? 0;
    const thisMonthRevenue = thisMonthAgg?.total ?? 0;
    const lastMonthRevenue = lastMonthAgg?.total ?? 0;
    const growth =
      lastMonthRevenue === 0
        ? thisMonthRevenue > 0
          ? 100
          : 0
        : Math.round(
            ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          );

    console.log("📊 Revenue stats:", {
      total: revenueTotal,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growth,
    });

    // ✅ 3. Booking counts by status
    const dateRangeMatch = { createdAt: { $gte: start, $lte: end } };

    const [
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      confirmedBookings,
    ] = await Promise.all([
      Booking.countDocuments(dateRangeMatch),
      Booking.countDocuments({ ...dateRangeMatch, status: "completed" }),
      Booking.countDocuments({ ...dateRangeMatch, status: "pending" }),
      Booking.countDocuments({ ...dateRangeMatch, status: "cancelled" }),
      Booking.countDocuments({ ...dateRangeMatch, status: "confirmed" }),
    ]);

    console.log("📋 Bookings stats:", {
      total: totalBookings,
      completed: completedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings,
      confirmed: confirmedBookings,
    });

    // ✅ 4. Cars statistics
    const carStats = await Car.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalCount: { $sum: "$totalCount" },
          available: { $sum: "$availableCount" },
          rented: { $sum: "$bookedCount" },
        },
      },
    ]);

    const cars = carStats[0] || {
      total: 0,
      totalCount: 0,
      available: 0,
      rented: 0,
    };

    console.log("🚗 Cars stats:", cars);

    // ✅ 5. Users statistics
    const [usersTotal, usersNew, usersActive] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({ isActive: true }),
    ]);

    console.log("👥 Users stats:", {
      total: usersTotal,
      new: usersNew,
      active: usersActive,
    });

    // ✅ 6. Top cars by revenue
    const topCarsAgg = await Booking.aggregate([
      { $match: completedMatch },
      {
        $group: {
          _id: "$car",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "carDoc",
        },
      },
      { $unwind: { path: "$carDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          car: {
            $concat: [
              { $ifNull: ["$carDoc.brand", "N/A"] },
              " ",
              { $ifNull: ["$carDoc.carModel", ""] },
            ],
          },
          bookings: 1,
          revenue: 1,
        },
      },
    ]);

    console.log("🏆 Top cars:", topCarsAgg);

    // ✅ 7. Monthly revenue
    const monthlyRevenueAgg = await Booking.aggregate([
      { $match: completedMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          revenue: 1,
          bookings: 1,
        },
      },
    ]);

    console.log("📈 Monthly revenue:", monthlyRevenueAgg);

    const responseData = {
      success: true,
      data: {
        revenue: {
          total: revenueTotal,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
          cancelled: cancelledBookings,
          confirmed: confirmedBookings,
        },
        cars: {
          total: cars.total,
          totalCount: cars.totalCount,
          available: cars.available,
          rented: cars.rented,
          maintenance: 0, // Agar maintenance status bo'lsa qo'shish kerak
        },
        users: {
          total: usersTotal,
          new: usersNew,
          active: usersActive,
        },
        topCars: topCarsAgg,
        monthlyRevenue: monthlyRevenueAgg,
      },
    };

    console.log("✅ Final response:", responseData);

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("❌ GET /api/admin/reports error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Hisobotni yuklashda xatolik",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
