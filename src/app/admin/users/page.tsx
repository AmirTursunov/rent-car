"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  RefreshCw,
  AlertCircle,
  Search,
  Shield,
  Phone,
  Ban,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  isActive: boolean;
  emailVerified?: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface Stats {
  total: number;
  active: number;
  blocked: number;
  admins: number;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "include", // ✅ Cookie yuborish
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Server xatosi: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        throw new Error(data.message || "Ma'lumotlarni olishda xatolik");
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setActionLoadingId(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        credentials: "include", // ✅ Cookie yuborish
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Yangilab bo'lmadi");
      }

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
      );

      // Stats yangilash
      if (isActive) {
        setStats((prev) => ({
          ...prev,
          active: prev.active + 1,
          blocked: prev.blocked - 1,
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          active: prev.active - 1,
          blocked: prev.blocked + 1,
        }));
      }
    } catch (err) {
      console.error("Update user status error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
      await fetchUsers(); // Xato bo'lsa qayta yuklash
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;

    try {
      setActionLoadingId(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include", // ✅ Cookie yuborish
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "O'chirib bo'lmadi");
      }

      // Optimistic delete
      const deletedUser = users.find((u) => u._id === userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));

      // Stats yangilash
      if (deletedUser) {
        setStats((prev) => ({
          total: prev.total - 1,
          active: deletedUser.isActive ? prev.active - 1 : prev.active,
          blocked: !deletedUser.isActive ? prev.blocked - 1 : prev.blocked,
          admins: deletedUser.role === "admin" ? prev.admins - 1 : prev.admins,
        }));
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
      await fetchUsers(); // Xato bo'lsa qayta yuklash
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || roleFilter !== "all" || statusFilter !== "all") {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter]);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Foydalanuvchilar
            </h1>
            <p className="text-gray-600 mt-1">Foydalanuvchilarni boshqarish</p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Yangilash
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Xatolik</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Jami</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faol</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.active}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bloklangan</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {stats.blocked}
                </p>
              </div>
              <Ban className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Adminlar</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.admins}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Qidiruv (ism, email, telefon)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Barcha rollar</option>
              <option value="user">Foydalanuvchi</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Barcha statuslar</option>
              <option value="active">Faol</option>
              <option value="blocked">Bloklangan</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {loading ? "Yuklanmoqda..." : "Foydalanuvchilar topilmadi"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Foydalanuvchi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ro'yxatdan o'tgan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {user.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "Foydalanuvchi"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Faol" : "Bloklangan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateUserStatus(user._id, !user.isActive)
                            }
                            disabled={actionLoadingId === user._id}
                            className={`p-2 rounded-lg transition disabled:opacity-50 ${
                              user.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              user.isActive ? "Bloklash" : "Aktivlashtirish"
                            }
                          >
                            {actionLoadingId === user._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : user.isActive ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            disabled={actionLoadingId === user._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
