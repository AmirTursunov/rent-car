import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Car from "@/models/Car";
import Booking from "@/models/Booking";
import { verifyToken } from "@/lib/auth";
import { ApiResponse } from "@/types";

interface CreateReviewRequest {
  carId: string;
  bookingId: string;
  rating: number;
  comment: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get("carId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filter: any = {};
    if (carId) {
      filter.car = carId;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(filter)
      .populate("user", "name avatar")
      .populate("car", "brand model")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(filter);

    return NextResponse.json({
      success: true,
      message: "Sharhlar muvaffaqiyatli olindi",
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Autentifikatsiya xatosi",
        error: "Sharhlarni olishda xatolik",
      },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const body: CreateReviewRequest = await request.json();
    const { carId, bookingId, rating, comment } = body;

    // Buyurtmani tekshirish
    const booking = await Booking.findOne({
      _id: bookingId,
      user: user.userId,
      car: carId,
      status: "completed",
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya xatosi",
          error: "Faqat yakunlangan buyurtmalar uchun sharh qoldirish mumkin",
        },
        { status: 400 }
      );
    }

    // Avvaldan sharh mavjudligini tekshirish
    const existingReview = await Review.findOne({
      user: user.userId,
      car: carId,
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: "Autentifikatsiya xatosi",
          error: "Siz allaqachon bu mashina uchun sharh qoldirgan",
        },
        { status: 400 }
      );
    }

    // Sharh yaratish
    const review = await Review.create({
      user: user.userId,
      car: carId,
      booking: bookingId,
      rating,
      comment,
    });

    // Mashina reytingini yangilash
    const allReviews = await Review.find({ car: carId });
    const averageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

    await Car.findByIdAndUpdate(carId, {
      "rating.average": averageRating,
      "rating.count": allReviews.length,
    });

    await review.populate("user", "name avatar");

    return NextResponse.json(
      {
        success: true,
        message: "Sharh muvaffaqiyatli qo'shildi",
        data: { review },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Autentifikatsiya xatosi",
        error: "Sharh qo'shishda xatolik",
      },
      { status: 500 }
    );
  }
}
