export interface User {
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

export interface Car {
  _id: string;
  brand: string;
  model: string;
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
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  _id: string;
  user: string | User;
  car: string | Car;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  _id: string;
  user: string | User;
  car: string | Car;
  booking: string | Booking;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
