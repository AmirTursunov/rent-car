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
  available: boolean;
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

// Index qo'shish tezroq qidiruv uchun
carSchema.index({ brand: 1, model: 1 });
carSchema.index({ pricePerDay: 1 });
carSchema.index({ available: 1 });
carSchema.index({ "location.city": 1 });
carSchema.index({ createdAt: -1 });
carSchema.index({ category: 1 });

export default mongoose.models.Car || mongoose.model<ICar>("Car", carSchema);
