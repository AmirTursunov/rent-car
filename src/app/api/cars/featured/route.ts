import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Car from "@/models/Car";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    // Eng yaxshi reytingli va ko'p buyurtma qilingan mashinalar
    const featuredCars = await Car.find({ available: true })
      .sort({
        "rating.average": -1,
        "rating.count": -1,
      })
      .limit(10)
      .select("brand carModel model year pricePerDay images location rating features");

    return NextResponse.json({
      success: true,
      message: "Tavsiya etilgan mashinalar olindi",
      data: { cars: featuredCars },
    });
  } catch (error) {
    console.error("Get featured cars error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Tavsiya etilgan mashinalarni olishda xatolik",
      },
      { status: 500 }
    );
  }
}
