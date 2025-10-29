// models/Payment.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  _id: string;
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: "UZS" | "USD";
  paymentMethod: "click" | "payme" | "uzcard" | "humo" | "cash";
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  transactionId?: string;
  paymentProvider?: string;
  providerTransactionId?: string;
  providerData?: any;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  ageInDays: number;
  isExpired(): boolean;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID kiritilishi kerak"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID kiritilishi kerak"],
    },
    amount: {
      type: Number,
      required: [true, "To'lov miqdori kiritilishi kerak"],
      min: [0, "To'lov miqdori 0 dan kichik bo'lmasligi kerak"],
    },
    currency: {
      type: String,
      enum: ["UZS", "USD"],
      default: "UZS",
    },
    paymentMethod: {
      type: String,
      enum: ["click", "payme", "uzcard", "humo", "cash"],
      required: [true, "To'lov usuli kiritilishi kerak"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // null qiymatlar uchun unique constraint qo'llanmaydi
      // MUHIM: "index: true" ni o'chirdik, chunki "unique: true" allaqachon index yaratadi
    },
    paymentProvider: {
      type: String,
    },
    providerTransactionId: {
      type: String,
    },
    providerData: {
      type: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes - tezroq qidiruv uchun
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
// transactionId index o'chirildi - unique: true allaqachon index yaratadi
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ user: 1, createdAt: -1 });

// Compound indexes - tez-tez ishlatiladigan kombinatsiyalar uchun
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, status: 1 });

// Virtual field - payment age in days
paymentSchema.virtual("ageInDays").get(function () {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method - Check if payment is expired (30 days pending)
paymentSchema.methods.isExpired = function () {
  if (this.status !== "pending") return false;
  const now = new Date();
  const created = this.createdAt;
  const diffDays = Math.ceil(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays > 30;
};

// Static method - Get payment statistics
paymentSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ],
        byMethod: [
          {
            $group: {
              _id: "$paymentMethod",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ],
        byCurrency: [
          {
            $group: {
              _id: "$currency",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ],
        overall: [
          {
            $group: {
              _id: null,
              totalPayments: { $sum: 1 },
              totalAmount: { $sum: "$amount" },
              avgAmount: { $avg: "$amount" },
              minAmount: { $min: "$amount" },
              maxAmount: { $max: "$amount" },
            },
          },
        ],
      },
    },
  ]);

  return stats[0];
};

// Pre-save middleware
paymentSchema.pre("save", function (next) {
  // Auto-generate transaction ID if not exists
  if (!this.transactionId && this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.transactionId = `TXN${timestamp}${random}`;
  }
  next();
});

// Post-save middleware - Update booking payment status
paymentSchema.post("save", async function (doc) {
  try {
    if (doc.status === "completed" && doc.booking) {
      const Booking = mongoose.model("Booking");
      await Booking.findByIdAndUpdate(doc.booking, {
        paymentStatus: "paid",
      });
    }
  } catch (error) {
    console.error("Error updating booking payment status:", error);
    // Xatolik payment yaratishni to'xtatmasligi kerak
  }
});

// Virtual populate konfiguratsiyasi
paymentSchema.set("toJSON", { virtuals: true });
paymentSchema.set("toObject", { virtuals: true });

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", paymentSchema);
