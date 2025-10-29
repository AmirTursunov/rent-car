export const API_ENDPOINTS = {
  // Auth
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",

  // Cars
  CARS: "/api/cars",
  CAR_BY_ID: (id: string) => `/api/cars/${id}`,
  SEARCH_CARS: "/api/cars/search",
  FEATURED_CARS: "/api/cars/featured",

  // Bookings
  BOOKINGS: "/api/bookings",
  MY_BOOKINGS: "/api/bookings/my",
  BOOKING_STATUS: (id: string) => `/api/bookings/${id}/status`,

  // Reviews
  REVIEWS: "/api/reviews",

  // Dashboard
  DASHBOARD_STATS: "/api/dashboard/stats",

  // Profile
  PROFILE: "/api/profile",
} as const;

export const FUEL_TYPES = {
  BENZIN: "benzin",
  DIZEL: "dizel",
  ELEKTR: "elektr",
  GIBRID: "gibrid",
} as const;

export const TRANSMISSION_TYPES = {
  MANUAL: "manual",
  AVTOMAT: "avtomat",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
} as const;

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const;

export const UZBEKISTAN_CITIES = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Namangan",
  "Qo'qon",
  "Farg'ona",
  "Nukus",
  "Urganch",
  "Qarshi",
  "Guliston",
  "Jizzax",
  "Navoiy",
  "Termiz",
] as const;
