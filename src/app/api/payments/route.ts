import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import "@/models/User";
import { verifyToken } from "@/lib/auth";

// ✅ lib/auth.ts'dagi verifyToken ishlatamiz (cookie'dan o'qiydi)

// Admin check
const isAdmin = (user: any) => user?.role === "admin";

// GET - Payments
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // ✅ Cookie'dan token o'qish
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("method"); // method'ga o'zgartirdim
    const userId = searchParams.get("userId");
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");

    // Filter: admin bo'lsa barcha, user bo'lsa faqat o'zi
    const filter: any = isAdmin(user) ? {} : { user: user.userId };

    if (status && status !== "all" && status !== "") filter.status = status;
    if (paymentMethod && paymentMethod !== "all" && paymentMethod !== "")
      filter.paymentMethod = paymentMethod;
    if (userId && isAdmin(user)) filter.user = userId;

    // Search filter
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { "user.name": { $regex: search, $options: "i" } },
        { "user.email": { $regex: search, $options: "i" } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate("user", "name email phone")
      .select(
        "_id transactionId amount paymentMethod status createdAt user paymentProvider providerData"
      )
      .lean()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);
    const hasMore = page * limit < total;

    return NextResponse.json({
      success: true,
      data: {
        payments,
        hasMore,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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

// POST - Payment create
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // ✅ Cookie'dan token o'qish
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      amount,
      paymentMethod,
      providerData,
      booking,
      transactionId,
      paymentProvider,
    } = body;

    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Majburiy maydonlar yetarli emas" },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      user: user.userId,
      amount,
      paymentMethod,
      providerData,
      booking,
      transactionId:
        transactionId ||
        `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      paymentProvider,
      status: "pending",
    });

    await payment.populate("user", "name email phone");

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lov yaratishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
