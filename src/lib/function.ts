export type Setting = {
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
};

// faqat kerakli maydonlar
export type PublicSettings = Pick<
  Setting,
  "companyName" | "contactEmail" | "phone" | "address"
>;

export const defaultPublicSettings: PublicSettings = {
  companyName: "",
  contactEmail: "",
  phone: "",
  address: "",
};

export async function getSettings(): Promise<PublicSettings> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/settings`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch settings");

    const json = await res.json();

    // faqat kerakli maydonlarni ajratamiz
    const data = json.data || {};
    return {
      companyName: data.companyName || "",
      contactEmail: data.contactEmail || "",
      phone: data.phone || "",
      address: data.address || "",
    };
  } catch (err) {
    console.error("Error fetching settings:", err);
    return defaultPublicSettings;
  }
}
