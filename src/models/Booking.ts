// models/Booking.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  location: string; // Bitta manzil (olish va qaytarish)
  totalPrice: number;
  depositAmount: number;
  depositPercent: number;
  paidAmount: number; // To'langan summa (depozit)
  remainingAmount: number; // Qolgan summa
  status:
    | "pending"
    | "confirmed"
    | "active"
    | "completed"
    | "cancelled"
    | "no_show";
  paymentStatus:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  bookingNumber: string;
  passport: {
    series: string;
    number: string;
  };
  phoneNumber: string;
  notes?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  noShowAt?: Date; // Kelmaganlik vaqti
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Foydalanuvchi ID kiritilishi kerak"],
    },
    car: {
      type: Schema.Types.ObjectId,
      ref: "Car",
      required: [true, "Mashina ID kiritilishi kerak"],
    },
    startDate: {
      type: Date,
      required: [true, "Boshlanish sanasi kiritilishi kerak"],
    },
    endDate: {
      type: Date,
      required: [true, "Tugash sanasi kiritilishi kerak"],
    },
    location: {
      type: String,
      required: [true, "Manzil kiritilishi kerak"],
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: [true, "Jami narx kiritilishi kerak"],
      min: [0, "Narx 0 dan kichik bo'lishi mumkin emas"],
    },
    depositAmount: {
      type: Number,
      required: [true, "Depozit summasi kiritilishi kerak"],
      min: [0, "Depozit 0 dan kichik bo'lishi mumkin emas"],
    },
    depositPercent: {
      type: Number,
      required: [true, "Depozit foizi kiritilishi kerak"],
      min: [0, "Foiz 0 dan kichik bo'lishi mumkin emas"],
      max: [100, "Foiz 100 dan katta bo'lishi mumkin emas"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "To'langan summa 0 dan kichik bo'lishi mumkin emas"],
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: [0, "Qolgan summa 0 dan kichik bo'lishi mumkin emas"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "deposit_paid",
        "fully_paid",
        "refunded",
        "cancelled",
        "failed",
      ],
      default: "pending",
    },
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    passport: {
      series: {
        type: String,
        required: [true, "Passport seriyasi kiritilishi kerak"],
        uppercase: true,
        trim: true,
        minlength: [2, "Passport seriyasi 2 ta harf bo'lishi kerak"],
        maxlength: [2, "Passport seriyasi 2 ta harf bo'lishi kerak"],
      },
      number: {
        type: String,
        required: [true, "Passport raqami kiritilishi kerak"],
        trim: true,
        minlength: [7, "Passport raqami 7 ta raqam bo'lishi kerak"],
        maxlength: [7, "Passport raqami 7 ta raqam bo'lishi kerak"],
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Telefon raqam kiritilishi kerak"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    confirmedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    noShowAt: {
      type: Date,
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
// bookingSchema.index({ bookingNumber: 1 });

// Virtual - Kunlar soni
bookingSchema.virtual("days").get(function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
bookingSchema.pre("save", function (next) {
  // Sanalarni tekshirish
  if (this.endDate <= this.startDate) {
    return next(
      new Error("Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak")
    );
  }

  next();
});

// Post-save middleware
bookingSchema.post("save", async function (doc) {
  // Mashinani status o'zgartirish
  if (doc.status === "active" && doc.car) {
    const Car = mongoose.model("Car");
    await Car.findByIdAndUpdate(doc.car, {
      status: "rented",
      available: false,
    });
  }

  // Mashina yakunlangan
  if (doc.status === "completed" && doc.car) {
    const Car = mongoose.model("Car");
    await Car.findByIdAndUpdate(doc.car, {
      status: "available",
      available: true,
    });
  }

  // Bekor qilingan yoki kelmagan
  if ((doc.status === "cancelled" || doc.status === "no_show") && doc.car) {
    const Car = mongoose.model("Car");
    await Car.findByIdAndUpdate(doc.car, {
      status: "available",
      available: true,
    });
  }
});

// Methodlar
bookingSchema.methods.calculateDays = function () {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

bookingSchema.methods.canCancel = function () {
  // Faqat pending va confirmed statusda bekor qilish mumkin
  return this.status === "pending" || this.status === "confirmed";
};

bookingSchema.methods.markAsNoShow = function () {
  this.status = "no_show";
  this.noShowAt = new Date();
  // Depozit qaytarilmaydi
  this.paymentStatus = "fully_paid"; // Depozit olinadi
};

// Static methodlar
bookingSchema.statics.checkAvailability = async function (
  carId: string,
  startDate: Date,
  endDate: Date
) {
  const overlappingBookings = await this.find({
    car: carId,
    status: { $in: ["confirmed", "active"] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  });

  return overlappingBookings.length === 0;
};

// Virtual populate
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

export default mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);
