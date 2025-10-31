// scripts/seed.ts - Ma'lumotlar bazasini to'ldirish uchun
import { connectDB } from "../lib/mongodb";
import User from "../models/User";
import Car from "../models/Car";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🔌 MongoDB ulanish muvaffaqiyatli");

    // Admin foydalanuvchini upsert qilish (agar bo'lsa yangilamaydi, bo'lmasa yaratadi)
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await User.updateOne(
      { email: "admin@rentcar.uz" },
      {
        $setOnInsert: {
          name: "Admin User",
          email: "admin@rentcar.uz",
          password: hashedPassword,
          phone: "+998901234567",
          role: "admin",
        },
      },
      { upsert: true }
    );

    const adminUser = await User.findOne({ email: "admin@rentcar.uz" });
    if (!adminUser) throw new Error("Admin userni olishda xatolik");

    console.log("👤 Admin foydalanuvchi tayyor");

    // Test mashinalar yaratish
    const testCars = [
      {
        brand: "Toyota",
        carModel: "Camry",
        category: "economy",
        year: 2022,
        color: "Oq",
        fuelType: "benzin",
        transmission: "avtomat",
        seats: 5,
        pricePerDay: 150000,
        images: [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
        ],
        features: ["Konditsioner", "Bluetooth", "Avtomat qutisi"],
        description: "Zamonaviy va qulay Toyota Camry avtomobili",
        location: {
          city: "Toshkent",
          address: "Amir Temur ko'chasi, 1",
        },
        available: true,
        owner: adminUser._id,
      },
      {
        brand: "Hyundai",
        carModel: "Elantra",
        category: "suv",
        year: 2023,
        color: "Qora",
        fuelType: "benzin",
        transmission: "manual",
        seats: 5,
        pricePerDay: 120000,
        images: [
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500",
        ],
        features: ["GPS", "Konditsioner", "ABS"],
        description: "Sportiv va tejamkor Hyundai Elantra",
        location: {
          city: "Samarqand",
          address: "Registon ko'chasi, 15",
        },
        available: true,
        owner: adminUser._id,
      },
    ];

    const existingCars = await Car.countDocuments({});
    if (existingCars === 0) {
      await Car.insertMany(testCars, { ordered: false });
      console.log("🚗 Test mashinalar yaratildi");
    } else {
      console.log(`🚗 Avvaldan mavjud mashinalar: ${existingCars} ta. Yaratilmadi.`);
    }

    console.log("✅ Database seeding yakunlandi!");

    // Admin login ma'lumotlari
    console.log("\n📋 Admin login ma'lumotlari:");
    console.log("Email: admin@rentcar.uz");
    console.log("Parol: admin123");
  } catch (error) {
    console.error("❌ Seeding xatosi:", error);
  } finally {
    process.exit();
  }
}

// Script ishga tushirish
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
