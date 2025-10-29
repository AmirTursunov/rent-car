import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Car from "@/models/Car";
import { ApiResponse } from "@/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Qidiruv so'zi noto'g'ri",
          error: "Qidiruv so'zi kamida 2 ta belgidan iborat bo'lishi kerak",
        },
        { status: 400 }
      );
    }

    const searchRegex = new RegExp(query.trim(), "i");

    const cars = await Car.find({
      $and: [
        { available: true },
        {
          $or: [
            { brand: searchRegex },
            { model: searchRegex },
            { color: searchRegex },
            { "location.city": searchRegex },
            { features: { $in: [searchRegex] } },
          ],
        },
      ],
    })
      .select("brand model year pricePerDay images location rating")
      .limit(20)
      .sort({ "rating.average": -1 });

    return NextResponse.json({
      success: true,
      message: "Qidiruv natijalari olindi",
      data: { cars, total: cars.length },
    });
  } catch (error) {
    console.error("Search cars error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Qidiruv so'zi noto'g'ri",
        error: "Qidiruvda xatolik",
      },
      { status: 500 }
    );
  }
}
