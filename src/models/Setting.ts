import mongoose, { Schema, Model, Document } from "mongoose";

export interface SettingDocument extends Document {
  companyName: string;
  contactEmail: string;
  phone: string;
  address: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  booking: {
    allowCancellationHours: number;
    defaultStatus: "pending" | "completed" | "cancelled";
  };
  ui: {
    theme: "light" | "dark" | "system";
    language: "uz" | "ru" | "en";
  };
  reports: {
    defaultRange: "month" | "week" | "custom";
  };
  updatedBy?: string;
  updatedAt: Date;
}

const SettingSchema = new Schema<SettingDocument>(
  {
    companyName: { type: String, default: "Kompaniya nomi" },
    contactEmail: { type: String, default: "info@example.com" },
    phone: { type: String, default: "+998" },
    address: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    dateFormat: { type: String, default: "YYYY-MM-DD" },
    timezone: { type: String, default: "Asia/Tashkent" },
    booking: {
      allowCancellationHours: { type: Number, default: 24 },
      defaultStatus: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "pending",
      },
    },
    ui: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light",
      },
      language: { type: String, enum: ["uz", "ru", "en"], default: "uz" },
    },
    reports: {
      defaultRange: {
        type: String,
        enum: ["month", "week", "custom"],
        default: "month",
      },
    },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Yagona hujjat saqlash (singleton)
SettingSchema.statics.getSingleton =
  async function (): Promise<SettingDocument> {
    const Model = this as Model<SettingDocument>;
    let doc = await Model.findOne({});
    if (!doc) {
      doc = await Model.create({});
    }
    return doc;
  };

const Setting =
  (mongoose.models.Setting as Model<SettingDocument>) ||
  mongoose.model<SettingDocument>("Setting", SettingSchema);
export default Setting;
