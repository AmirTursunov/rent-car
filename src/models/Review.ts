import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Foydalanuvchi kiritilishi kerak"],
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Mashina kiritilishi kerak"],
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Buyurtma kiritilishi kerak"],
    },
    rating: {
      type: Number,
      required: [true, "Reyting kiritilishi kerak"],
      min: [1, "Reyting kamida 1 bo'lishi kerak"],
      max: [5, "Reyting ko'pi bilan 5 bo'lishi kerak"],
    },
    comment: {
      type: String,
      required: [true, "Sharh kiritilishi kerak"],
      minlength: [10, "Sharh kamida 10 ta belgidan iborat bo'lishi kerak"],
      maxlength: [1000, "Sharh 1000 ta belgidan oshmasligi kerak"],
    },
  },
  {
    timestamps: true,
  }
);

// Foydalanuvchi bir mashina uchun faqat bir marta sharh qoldirishi mumkin
reviewSchema.index({ user: 1, car: 1 }, { unique: true });
reviewSchema.index({ car: 1, createdAt: -1 });

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", reviewSchema);
