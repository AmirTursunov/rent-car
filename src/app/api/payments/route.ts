import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import jwt from "jsonwebtoken";

// Token tekshirish helper function
const verifyToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    return decoded;
  } catch (error) {
    return null;
  }
};

let cachedStatistics: any = null;
let statisticsLastUpdate = 0;
const STATS_CACHE_DURATION = 60000; // 60 seconds

const getStatistics = async () => {
  const now = Date.now();
  if (cachedStatistics && now - statisticsLastUpdate < STATS_CACHE_DURATION) {
    return cachedStatistics;
  }

  const statistics = await Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        total: { $sum: "$amount" },
      },
    },
  ]);

  cachedStatistics = statistics;
  statisticsLastUpdate = now;
  return statistics;
};

// GET - Barcha to'lovlarni olish
export async function GET(request: NextRequest) {
  try {
    // Token tekshirish
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    // Query parametrlarni olish
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const userId = searchParams.get("userId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (paymentMethod && paymentMethod !== "all")
      filter.paymentMethod = paymentMethod;
    if (userId) filter.user = userId;

    const payments = await Payment.find(filter)
      .select(
        "_id transactionId amount paymentMethod status createdAt user paymentProvider providerData"
      )
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const userIds = [...new Set(payments.map((p: any) => p.user))];
    const usersMap = new Map();

    if (userIds.length > 0) {
      const users = await Payment.db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .toArray();
      users.forEach((u: any) => usersMap.set(u._id.toString(), u));
    }

    // Combine user data with payments
    const enrichedPayments = payments.map((p: any) => ({
      ...p,
      user: usersMap.get(p.user.toString()) || {
        name: "Unknown",
        email: "unknown@email.com",
      },
    }));

    // Jami soni
    const total = await Payment.countDocuments(filter);

    const statistics = await getStatistics();

    return NextResponse.json({
      success: true,
      data: {
        payments: enrichedPayments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        statistics,
      },
    });
  } catch (error: any) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovlarni yuklashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
