import cron from "node-cron";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export function startBookingStatusJob() {
  // Har 5 daqiqada ishga tushadi
  cron.schedule("*/5 * * * *", async () => {
    try {
      await connectDB();
      const now = new Date();

      // ✅ startDate keldi → active
      await Booking.updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gte: now },
          status: "confirmed",
        },
        { $set: { status: "active" } }
      );

      // ✅ endDate o'tgan → returned (completed emas)
      await Booking.updateMany(
        {
          endDate: { $lt: now },
          status: { $nin: ["need to be returned", "cancelled"] },
        },
        { $set: { status: "need to be returned" } }
      );

      console.log(`[CRON] Booking statuslar yangilandi: ${now.toISOString()}`);
    } catch (error) {
      console.error("[CRON] Booking status update error:", error);
    }
  });
}
