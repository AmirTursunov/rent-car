// models/Booking.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
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
    startDate: {
      type: Date,
      required: [true, "Boshlanish sanasi kiritilishi kerak"],
    },
    endDate: {
      type: Date,
      required: [true, "Tugash sanasi kiritilishi kerak"],
      validate: {
        validator: function (this: IBooking, value: Date) {
          return value > this.startDate;
        },
        message: "Tugash sanasi boshlanish sanasidan keyingi bo'lishi kerak",
      },
    },
    totalPrice: {
      type: Number,
      required: [true, "Umumiy narx kiritilishi kerak"],
      min: [0, "Narx 0 dan kichik bo'lmasligi kerak"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: [500, "Eslatma 500 ta belgidan oshmasligi kerak"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ car: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual - Kunlar soni
bookingSchema.virtual("days").get(function () {
  const diffTime = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual - Payment
bookingSchema.virtual("payment", {
  ref: "Payment",
  localField: "_id",
  foreignField: "booking",
  justOne: true,
});

// Pre-save validation
bookingSchema.pre("save", async function (next) {
  if (
    this.isNew ||
    this.isModified("startDate") ||
    this.isModified("endDate")
  ) {
    // Sana validatsiyasi
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (this.startDate < now) {
      throw new Error("Boshlanish sanasi o'tmishda bo'lishi mumkin emas");
    }

    if (this.endDate <= this.startDate) {
      throw new Error(
        "Tugash sanasi boshlanish sanasidan keyingi bo'lishi kerak"
      );
    }

    // Mashina band emasligini tekshirish
    const Booking = mongoose.model("Booking");
    const overlappingBooking = await Booking.findOne({
      car: this.car,
      _id: { $ne: this._id },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          startDate: { $lte: this.endDate },
          endDate: { $gte: this.startDate },
        },
      ],
    });

    if (overlappingBooking) {
      throw new Error("Bu sanalar uchun mashina allaqachon band");
    }
  }
  next();
});

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);
