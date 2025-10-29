// ============================================================================
// FAYL: app/api/upload/route.ts - Cloudinary Upload
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Fayl yuborilmadi" },
        { status: 400 }
      );
    }

    // File hajmini tekshirish (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Fayl hajmi 5MB dan kichik bo'lishi kerak" },
        { status: 400 }
      );
    }

    // File turini tekshirish
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Faqat rasm yuklash mumkin" },
        { status: 400 }
      );
    }

    // Faylni bufferga o'tkazish
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary ga yuklash
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "rent-car", // Cloudinary papka nomi
          transformation: [
            { width: 800, height: 600, crop: "fill" }, // Rasm o'lchamini optimizatsiya
            { quality: "auto" }, // Avtomatik sifat
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    console.log("✅ Cloudinary upload success:", uploadResult.secure_url);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Rasm yuklashda xatolik",
      },
      { status: 500 }
    );
  }
}
