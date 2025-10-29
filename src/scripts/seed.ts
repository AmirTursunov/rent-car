// scripts/seed.ts - Ma'lumotlar bazasini to'ldirish uchun
import { connectDB } from "../lib/mongodb";
import User from "../models/User";
import Car from "../models/Car";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    await connectDB();
    console.log("🔌 MongoDB ulanish muvaffaqiyatli");

    // Admin foydalanuvchi yaratish
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@rentcar.uz",
      password: hashedPassword,
      phone: "+998901234567",
      role: "admin",
    });

    console.log("👤 Admin foydalanuvchi yaratildi");

    // Test mashinalar yaratish
    const testCars = [
      {
        brand: "Toyota",
        model: "Camry",
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
        model: "Elantra",
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

    await Car.insertMany(testCars);
    console.log("🚗 Test mashinalar yaratildi");

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
