import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(50, "Ism 50 ta belgidan oshmasligi kerak"),
  email: z.string().email("To'g'ri email format kiriting"),
  password: z
    .string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    .max(100, "Parol juda uzun"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "To'g'ri telefon raqami kiriting"),
});

export const loginSchema = z.object({
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(1, "Parol kiritilishi kerak"),
});

export const carSchema = z.object({
  brand: z.string().min(1, "Marka kiritilishi kerak"),
  model: z.string().min(1, "Model kiritilishi kerak"),
  year: z
    .number()
    .min(1950, "Yil 1950 dan kichik bo'lmasligi kerak")
    .max(
      new Date().getFullYear() + 1,
      "Yil joriy yildan katta bo'lmasligi kerak"
    ),
  color: z.string().min(1, "Rang kiritilishi kerak"),
  fuelType: z.enum(["benzin", "dizel", "elektr", "gibrid"]),
  transmission: z.enum(["manual", "avtomat"]),
  seats: z.number().min(1).max(50),
  pricePerDay: z.number().min(0, "Narx 0 dan kichik bo'lmasligi kerak"),
  images: z.array(z.string().url()).min(1, "Kamida bitta rasm kerak"),
  features: z.array(z.string()),
  description: z.string().max(1000).optional(),
  location: z.object({
    city: z.string().min(1, "Shahar kiritilishi kerak"),
    address: z.string().min(1, "Manzil kiritilishi kerak"),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
  }),
});

export const bookingSchema = z
  .object({
    carId: z.string().min(1, "Mashina ID kerak"),
    startDate: z.string().refine((date) => new Date(date) > new Date(), {
      message: "Boshlanish sanasi kelajakda bo'lishi kerak",
    }),
    endDate: z.string(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Tugash sanasi boshlanish sanasidan keyingi bo'lishi kerak",
  });

export const reviewSchema = z.object({
  carId: z.string().min(1),
  bookingId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Sharh kamida 10 ta belgidan iborat bo'lishi kerak")
    .max(1000, "Sharh 1000 ta belgidan oshmasligi kerak"),
});
