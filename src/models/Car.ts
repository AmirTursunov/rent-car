import mongoose, { Document, Schema } from "mongoose";

export interface ICar extends Document {
  _id: string;
  brand: string;
  carModel: string;
  category?: string;
  year: number;
  color: string;
  fuelType: "benzin" | "dizel" | "elektr" | "gibrid";
  transmission: "manual" | "avtomat";
  seats: number;
  pricePerDay: number;
  zalog: number;
  totalCount: number; // Jami mashinalar soni
  availableCount: number; // Mavjud mashinalar soni
  bookedCount: number; // Band qilingan mashinalar soni
  images: string[];
  features: string[];
  description?: string;
  location: {
    city: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  available: boolean; // Agar availableCount > 0 bo'lsa true
  rating: {
    average: number;
    count: number;
  };
  owner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>(
  {
    brand: {
      type: String,
      required: [true, "Marka kiritilishi kerak"],
      trim: true,
    },
    carModel: {
      type: String,
      required: [true, "Model kiritilishi kerak"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["economy", "luxury", "suv", "sports", "general"],
      default: "general",
    },
    year: {
      type: Number,
      required: [true, "Ishlab chiqarilgan yili kiritilishi kerak"],
      min: [1950, "Yil 1950 dan kichik bo'lmasligi kerak"],
      max: [
        new Date().getFullYear() + 1,
        "Yil joriy yildan katta bo'lmasligi kerak",
      ],
    },
    color: {
      type: String,
      required: [true, "Rangi kiritilishi kerak"],
      trim: true,
    },
    fuelType: {
      type: String,
      enum: ["benzin", "dizel", "elektr", "gibrid"],
      required: [true, "Yoqilg'i turi kiritilishi kerak"],
    },
    transmission: {
      type: String,
      enum: ["manual", "avtomat"],
      required: [true, "Transmissiya turi kiritilishi kerak"],
    },
    seats: {
      type: Number,
      required: [true, "O'rindiqlar soni kiritilishi kerak"],
      min: [1, "Kamida 1 ta o'rindiq bo'lishi kerak"],
      max: [50, "Ko'pi bilan 50 ta o'rindiq bo'lishi mumkin"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Kunlik narxi kiritilishi kerak"],
      min: [0, "Narx 0 dan kichik bo'lmasligi kerak"],
    },
    zalog: {
      type: Number,
      required: [true, "Mashina uchun zalog(kafolat puli) kiritilishi kerak"],
      min: [0, "Narx 0 dan kichik bo'lmasligi kerak"],
    },
    totalCount: {
      type: Number,
      required: [true, "Jami mashinalar soni kiritilishi kerak"],
      min: [1, "Kamida 1 ta mashina bo'lishi kerak"],
      default: 1,
    },
    availableCount: {
      type: Number,
      required: true,
      min: [0, "Mavjud mashinalar soni 0 dan kichik bo'lmasligi kerak"],
      default: function () {
        return this.totalCount || 1;
      },
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: [0, "Band qilingan mashinalar soni 0 dan kichik bo'lmasligi kerak"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      maxlength: [1000, "Tavsif 1000 ta belgidan oshmasligi kerak"],
    },
    location: {
      city: {
        type: String,
        required: [true, "Shahar kiritilishi kerak"],
      },
      address: {
        type: String,
        required: [true, "Manzil kiritilishi kerak"],
      },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    available: {
      type: Boolean,
      default: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware: availableCount va bookedCount ni tekshirish
carSchema.pre("save", function (next) {
  // availableCount + bookedCount = totalCount bo'lishi kerak
  if (
    this.isModified("totalCount") ||
    this.isModified("availableCount") ||
    this.isModified("bookedCount")
  ) {
    // Agar totalCount o'zgartirilsa, availableCount ni qayta hisoblash
    if (this.isModified("totalCount")) {
      const diff = this.totalCount - (this.availableCount + this.bookedCount);
      this.availableCount += diff;
    }

    // available flag'ni yangilash
    this.available = this.availableCount > 0;
  }
  next();
});

// Index qo'shish tezroq qidiruv uchun
carSchema.index({ brand: 1, carModel: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ available: 1 });
carSchema.index({ "location.city": 1 });
carSchema.index({ createdAt: -1 });
carSchema.index({ category: 1 });
carSchema.index({ availableCount: 1 });

export default mongoose.models.Car || mongoose.model<ICar>("Car", carSchema);
