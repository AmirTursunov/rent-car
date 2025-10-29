// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
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

    // Admin tekshirish (agar kerak bo'lsa)
    // if (user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, message: "Ruxsat yo'q" },
    //     { status: 403 }
    //   );
    // }

    await connectDB();

    // Query parametrlarni olish
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Filter obyektini yaratish
    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (paymentMethod && paymentMethod !== "all")
      filter.paymentMethod = paymentMethod;
    if (userId) filter.user = userId;

    // To'lovlarni olish
    const payments = await Payment.find(filter)
      .populate("user", "name email phone")
      .populate("booking", "startDate endDate totalPrice")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Jami soni
    const total = await Payment.countDocuments(filter);

    // Statistika
    const statistics = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
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

// POST - Yangi to'lov yaratish
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { booking, amount, paymentMethod, currency = "UZS" } = body;

    // Validatsiya
    if (!booking || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking, amount va paymentMethod majburiy",
        },
        { status: 400 }
      );
    }

    // Yangi to'lov yaratish
    const payment = await Payment.create({
      booking,
      user: (user as any).userId || (user as any).id,
      amount,
      currency,
      paymentMethod,
      status: "pending",
    });

    // Populate qilish
    await payment.populate("user", "name email");
    await payment.populate("booking", "startDate endDate");

    return NextResponse.json(
      {
        success: true,
        message: "To'lov muvaffaqiyatli yaratildi",
        data: { payment },
      },
      { status: 201 }
    );
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

// PATCH - To'lov statusini yangilash
export async function PATCH(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { paymentId, status, failureReason } = body;

    if (!paymentId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "paymentId va status majburiy",
        },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    // Status bo'yicha qo'shimcha ma'lumotlar
    if (status === "completed") {
      updateData.paidAt = new Date();
    } else if (status === "failed" && failureReason) {
      updateData.failureReason = failureReason;
    } else if (status === "refunded") {
      updateData.refundedAt = new Date();
    }

    const payment = await Payment.findByIdAndUpdate(paymentId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email")
      .populate("booking", "startDate endDate");

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov statusi yangilandi",
      data: { payment },
    });
  } catch (error: any) {
    console.error("PATCH /api/payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni yangilashda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - To'lovni o'chirish
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Autentifikatsiya xatosi" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID kerak" },
        { status: 400 }
      );
    }

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "To'lov topilmadi" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "To'lov o'chirildi",
      data: { paymentId },
    });
  } catch (error: any) {
    console.error("DELETE /api/payments error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "To'lovni o'chirishda xatolik",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
