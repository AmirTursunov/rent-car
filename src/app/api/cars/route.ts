import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Car from "@/models/Car";
import { verifyToken } from "@/lib/auth";
import { ApiResponse, Car as CarType } from "@/types";

interface CarsQuery {
  page?: string;
  limit?: string;
  brand?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
  city?: string;
  fuelType?: string;
  transmission?: string;
  seats?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query: CarsQuery = Object.fromEntries(searchParams.entries());

    const page = parseInt(query.page || "1");
    const limit = parseInt(query.limit || "10");

    // Filter: default bo'yicha faqat available=true qaytariladi
    const filter: any = {};
    const wantAvailable = (query.available ?? "true").toLowerCase();
    if (wantAvailable === "true") {
      filter.$or = [
        { available: true },
        { available: "true" },
        { available: 1 },
      ];
    }

    if (query.brand) {
      filter.brand = { $regex: query.brand, $options: "i" };
    }

    if (query.minPrice || query.maxPrice) {
      filter.pricePerDay = {};
      if (query.minPrice) filter.pricePerDay.$gte = parseInt(query.minPrice);
      if (query.maxPrice) filter.pricePerDay.$lte = parseInt(query.maxPrice);
    }

    if (query.category && query.category !== "all") {
      filter.category = query.category;
    }

    if (query.city) {
      filter["location.city"] = { $regex: query.city, $options: "i" };
    }

    if (query.fuelType) {
      filter.fuelType = query.fuelType;
    }

    if (query.transmission) {
      filter.transmission = query.transmission;
    }

    if (query.seats) {
      filter.seats = parseInt(query.seats);
    }

    const skip = (page - 1) * limit;

    let cars = await Car.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    let total = await Car.countDocuments(filter);

    // Fallback: agar available filtri bilan hech narsa topilmasa, barcha mashinalarni qaytarib ko'ramiz
    let fallbackAll = false;
    if (cars.length === 0) {
      const allFilter: any = { ...filter };
      delete allFilter.available;
      delete allFilter.$or;
      const tryAll = await Car.find(allFilter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      if (tryAll.length > 0) {
        cars = tryAll;
        total = await Car.countDocuments(allFilter);
        fallbackAll = true;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Mashinalar muvaffaqiyatli olindi",
      data: {
        cars,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
        meta: { fallbackAll, appliedFilter: filter },
      },
    });
  } catch (error) {
    console.error("Get cars error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Mashinalarni olishda xatolik",
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
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Ruxsat yo'q",
          error: "Ruxsat yo'q",
        },
        { status: 403 }
      );
    }

    await connectDB();
    const carData: Partial<CarType> = await request.json();

    // Majburiy maydonlarni tekshirish
    const requiredFields = [
      "brand",
      "carModel",
      "category",
      "year",
      "color",
      "fuelType",
      "transmission",
      "seats",
      "pricePerDay",
      "images",
      "location",
    ];
    const missingFields = requiredFields.filter(
      (field) => !carData[field as keyof CarType]
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Quyidagi maydonlar to'ldirilishi kerak: ${missingFields.join(
            ", "
          )}`,
          error: `Quyidagi maydonlar to'ldirilishi kerak: ${missingFields.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const car = await Car.create({
      ...carData,
      owner: user.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Mashina muvaffaqiyatli qo'shildi",
        data: { car },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create car error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server xatosi",
        error: "Mashina qo'shishda xatolik",
      },
      { status: 500 }
    );
  }
}
