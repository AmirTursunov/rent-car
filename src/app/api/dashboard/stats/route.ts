import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Car from "@/models/Car";
import Booking from "@/models/Booking";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin huquqi yo'q",
          error: "Admin ruxsati kerak",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // ✅ Asosiy statistikalar
    const [totalCars, totalUsers, totalBookings, totalRevenue] =
      await Promise.all([
        Car.countDocuments(),
        User.countDocuments({ role: "user" }),
        Booking.countDocuments(),
        Booking.aggregate([
          { $match: { status: "completed" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
      ]);

    // ✅ Bo'sh va band mashinalar sonini hisoblash
    const carStats = await Car.aggregate([
      {
        $group: {
          _id: null,
          availableCars: { $sum: "$availableCount" }, // Bo'sh mashinalar
          bookedCars: { $sum: "$bookedCount" }, // Band mashinalar
        },
      },
    ]);

    const availableCars = carStats[0]?.availableCars || 0;
    const bookedCars = carStats[0]?.bookedCars || 0;

    // Oylik statistikalar (oxirgi 12 oy)
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 11,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Eng mashhur mashinalar
    const popularCars = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$car",
          bookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $lookup: {
          from: "cars",
          localField: "_id",
          foreignField: "_id",
          as: "car",
        },
      },
      { $unwind: "$car" },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      {
        $project: {
          brand: "$car.brand",
          model: "$car.carModel",
          bookings: 1,
          totalRevenue: 1,
        },
      },
    ]);

    // So'nggi buyurtmalar
    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("car", "brand carModel")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      message: "Dashboard statistikalari olindi",
      data: {
        overview: {
          totalCars,
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          availableCars, // ✅ Bo'sh mashinalar
          bookedCars, // ✅ Band mashinalar
        },
        monthlyStats,
        popularCars,
        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Admin huquqi yo'q",
        error: "Statistikalarni olishda xatolik",
      },
      { status: 500 }
    );
  }
}
