// app/api/admin/reports/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

    // Completed match
    const completedMatch = {
      status: "completed",
      createdAt: { $gte: start, $lte: end },
    };

    // Revenue total in range
    const [revenueAgg] = await Booking.aggregate([
      { $match: completedMatch },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // This month vs last month revenue
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

    // Booking counts by status in range
    const bookingsByStatus = await Booking.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const bookingCount = (status: string) =>
      bookingsByStatus.find((b) => b._id === status)?.count ?? 0;

    // Cars totals
    const carsTotal = await Car.countDocuments({});
    const carsAvailable = await Car.countDocuments({ available: true });
    const carsRented = await Car.countDocuments({ available: false });
    const carsMaintenance = await Car.countDocuments({ status: "maintenance" });

    // Users totals
    const usersTotal = await User.countDocuments({});
    const usersNew = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });
    const usersActive = await User.countDocuments({
      isActive: true,
    });

    // Top cars by revenue in range
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

    // Monthly revenue within range
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

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          total: revenueTotal,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth,
        },
        bookings: {
          total:
            bookingCount("completed") +
            bookingCount("pending") +
            bookingCount("cancelled") +
            bookingCount("confirmed") +
            bookingCount("approved") +
            bookingCount("active"),
          completed: bookingCount("completed"),
          pending: bookingCount("pending"),
          cancelled: bookingCount("cancelled"),
        },
        cars: {
          total: carsTotal,
          available: carsAvailable,
          rented: carsRented,
          maintenance: carsMaintenance,
        },
        users: {
          total: usersTotal,
          new: usersNew,
          active: usersActive,
        },
        topCars: topCarsAgg,
        monthlyRevenue: monthlyRevenueAgg,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/reports error:", err);
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
