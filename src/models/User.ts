import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "admin";
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Ism kiritilishi kerak"],
      trim: true,
      minlength: [2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"],
      maxlength: [50, "Ism 50 ta belgidan oshmasligi kerak"],
    },
    email: {
      type: String,
      required: [true, "Email kiritilishi kerak"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "To'g'ri email kiriting",
      ],
    },
    password: {
      type: String,
      required: [true, "Parol kiritilishi kerak"],
      minlength: [6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"],
    },
    phone: {
      type: String,
      required: [true, "Telefon raqami kiritilishi kerak"],
      match: [/^\+?[1-9]\d{1,14}$/, "To'g'ri telefon raqami kiriting"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index qo'shish tezroq qidiruv uchun
userSchema.index({ phone: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
