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
    const skip = (page - 1) * limit;

    const filter: any = {};
    const isAdmin = searchParams.get("admin") === "true";

    // Admin bo'lsa - hamma mashinalar
    // Oddiy foydalanuvchi - faqat mavjud mashinalar
    if (!isAdmin) {
      const wantAvailable = (query.available ?? "true").toLowerCase();
      if (wantAvailable === "true") {
        filter.availableCount = { $gt: 0 };
        filter.available = true;
      } else if (wantAvailable === "false") {
        filter.availableCount = 0;
        filter.available = false;
      }
    } else {
      if (query.available?.toLowerCase() === "false") {
        filter.availableCount = 0;
        filter.available = false;
      } else if (query.available?.toLowerCase() === "true") {
        filter.availableCount = { $gt: 0 };
        filter.available = true;
      }
    }

    // Qolgan filterlar
    if (query.brand) filter.brand = { $regex: query.brand, $options: "i" };

    if (query.minPrice || query.maxPrice) {
      filter.pricePerDay = {};
      if (query.minPrice) filter.pricePerDay.$gte = parseInt(query.minPrice);
      if (query.maxPrice) filter.pricePerDay.$lte = parseInt(query.maxPrice);
    }

    if (query.category && query.category !== "all")
      filter.category = query.category;

    if (query.city)
      filter["location.city"] = { $regex: query.city, $options: "i" };

    if (query.fuelType) filter.fuelType = query.fuelType;
    if (query.transmission) filter.transmission = query.transmission;
    if (query.seats) filter.seats = parseInt(query.seats);

    const cars = await Car.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Car.countDocuments(filter);

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
        meta: { appliedFilter: filter },
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
    const carData: any = await request.json();

    // count fieldini totalCount ga o'zgartirish (backward compatibility)
    if (carData.count && !carData.totalCount) {
      carData.totalCount = carData.count;
    }

    // availableCount ni totalCount bilan bir xil qilish (yangi mashina)
    if (carData.totalCount && !carData.availableCount) {
      carData.availableCount = carData.totalCount;
    }

    // bookedCount default 0
    if (!carData.bookedCount) {
      carData.bookedCount = 0;
    }

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
      "totalCount",
    ];
    const missingFields = requiredFields.filter(
      (field) => !carData[field as keyof typeof carData]
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
