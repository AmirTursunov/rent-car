"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Car,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Settings,
  Home,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ useAuth hook'dan foydalanish (requireAdmin = true)
  const { user, loading, logout } = useAuth(true);

  const menuItems = [
    {
      id: "dashboard",
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      id: "cars",
      icon: <Car className="w-5 h-5" />,
      label: "Mashinalar",
      href: "/admin/cars",
    },
    {
      id: "bookings",
      icon: <Calendar className="w-5 h-5" />,
      label: "Buyurtmalar",
      href: "/admin/bookings",
    },
    {
      id: "payments",
      icon: <DollarSign className="w-5 h-5" />,
      label: "To'lovlar",
      href: "/admin/payments",
    },
    {
      id: "users",
      icon: <Users className="w-5 h-5" />,
      label: "Foydalanuvchilar",
      href: "/admin/users",
    },
    {
      id: "reports",
      icon: <FileText className="w-5 h-5" />,
      label: "Hisobotlar",
      href: "/admin/reports",
    },
    {
      id: "settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Sozlamalar",
      href: "/admin/settings",
    },
  ];

  // ✅ Loading holatida spinner ko'rsatish
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white min-h-screen transition-all duration-300 fixed left-0 top-0 z-10`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">RentCar Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center px-4 py-3 ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              } transition-colors`}
            >
              {item.icon}
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Chiqish</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find((item) => item.href === pathname)?.label ||
                  "Admin Panel"}
              </h2>
              <p className="text-gray-500 text-sm">Boshqaruv paneli</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right mr-3">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
