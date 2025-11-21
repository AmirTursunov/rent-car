"use client";
import React, { useState, useEffect } from "react";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  AlertCircle,
  Package,
  Eye,
  ImageIcon,
  Upload,
} from "lucide-react";

interface CarData {
  _id: string;
  brand: string;
  carModel: string;
  category?: string;
  year: number;
  color: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  images: string[];
  available: boolean;
  rating: { average: number; count: number };
  location: { city: string; address: string };
  totalCount: number;
  availableCount: number;
  bookedCount: number;
  zalog?: number;
}

interface BookingData {
  _id: string;
  carModel: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}
import { useToast } from "../../../components/context/ToastContext"; // yo‘lni moslashtiring
const AdminCarsPage: React.FC = () => {
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Booking modal state
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [currentCarBookings, setCurrentCarBookings] = useState<BookingData[]>(
    []
  );
  const [loadingCarBookings, setLoadingCarBookings] = useState(false);

  const [formData, setFormData] = useState<Partial<CarData>>({
    brand: "Chevrolet",
    carModel: "",
    category: "economy",
    year: new Date().getFullYear(),
    color: "",
    fuelType: "benzin",
    transmission: "avtomat",
    seats: 5,
    pricePerDay: 0,
    available: true,
    images: [],
    location: { city: "Toshkent", address: "" },
    totalCount: 1,
    availableCount: 1,
    bookedCount: 0,
    zalog: 0,
  });
  const { showToast } = useToast();
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/cars?admin=true`, {
        method: "GET",
        credentials: "include", // 🍪 cookie yuborish uchun muhim
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Ma'lumotlarni yuklab bo'lmadi");

      const data = await response.json();
      if (data.success) {
        setCars(data.data.cars);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan kichik bo'lishi kerak");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm yuklash mumkin");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.brand || !formData.carModel) {
      setError("Marka va Model to'ldirilishi shart!");
      return;
    }

    if (!formData.category) {
      setError("Kategoriya tanlang!");
      return;
    }

    if (!formData.location?.city || !formData.location?.address) {
      setError("Shahar va Manzil to'ldirilishi shart!");
      return;
    }

    if ((!formData.images || formData.images.length === 0) && !selectedFile) {
      setError("Rasm yuklash majburiy!");
      return;
    }

    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      setError("Kunlik narx 0 dan katta bo'lishi kerak!");
      return;
    }

    if (!formData.totalCount || formData.totalCount < 1) {
      setError("Mashinalar soni kamida 1 ta bo'lishi kerak!");
      return;
    }

    try {
      setSaving(true);

      const url = selectedCar ? `/api/cars/${selectedCar._id}` : "/api/cars";
      const method = selectedCar ? "PUT" : "POST";

      let imagesToSend = formData.images || [];
      if (selectedFile) {
        try {
          setUploadingImage(true);
          const uploadData = new FormData();
          uploadData.append("file", selectedFile);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          const uploadJson = await uploadRes.json();
          if (!uploadRes.ok || !uploadJson.url) {
            throw new Error(uploadJson.error || "Rasm yuklashda xatolik");
          }
          imagesToSend = [uploadJson.url];
        } finally {
          setUploadingImage(false);
        }
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: imagesToSend,
          category: formData.category || "economy",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Saqlashda xatolik");
      }

      if (data.success) {
        setShowAddModal(false);
        setImagePreview("");
        setSelectedFile(null);
        setSelectedCar(null);

        fetchCars();
        showToast(selectedCar ? "Mashina yangilandi!" : "Mashina qo'shildi!");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm("O'chirmoqchimisiz?")) return;

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("O'chirishda xatolik");

      fetchCars();
      showToast("Mashina o'chirildi!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.carModel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterAvailable === "all" ||
      (filterAvailable === "available" && car.availableCount > 0) ||
      (filterAvailable === "unavailable" && car.bookedCount > 0);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-600 font-medium">Xatolik!</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 text-sm underline mt-2"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mashinalar</h2>
          <p className="text-gray-500 text-sm">
            Jami: <strong>{cars.length}</strong> ta model
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCar(null);
            setImagePreview("");
            setFormData({
              brand: "Chevrolet",
              carModel: "",
              category: "economy",
              year: new Date().getFullYear(),
              color: "",
              fuelType: "benzin",
              transmission: "avtomat",
              seats: 5,
              pricePerDay: 0,
              available: true,
              images: [],
              location: { city: "Toshkent", address: "" },
              totalCount: 1,
              availableCount: 1,
              bookedCount: 0,
              zalog: 0,
            });
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yangi</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Barchasi</option>
            <option value="available">Mavjud</option>
            <option value="unavailable">Band</option>
          </select>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              Natija: <strong>{filteredCars.length}</strong> ta
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div
            key={car._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img
                src={car.images[0] || "https://via.placeholder.com/400"}
                alt={car.brand}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400";
                }}
              />

              {/* Count Badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/90 shadow">
                <Package className="w-3 h-3" />
                <span className="text-green-600">{car.availableCount}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700">{car.totalCount}</span>
              </div>

              {/* Availability Badge */}
              <span
                className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                  car.availableCount > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {car.availableCount > 0 ? "Mavjud" : "Hammasi band"}
              </span>

              {car.category && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                  {car.category}
                </span>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold">
                {car.brand} {car.carModel}
              </h3>
              <p className="text-sm text-gray-500">
                {car.year} • {car.color}
              </p>

              <div className="grid grid-cols-2 gap-2 my-3 text-sm text-gray-600">
                <div>⚙️ {car.transmission}</div>
                <div>⛽ {car.fuelType}</div>
                <div>👥 {car.seats} o'rindiq</div>
                <div>📍 {car.location.city}</div>
                <div>💰 Zalog: {car.zalog?.toLocaleString()} so'm</div>
                <div className="flex items-center gap-1">
                  <span
                    className={
                      car.bookedCount > 0 ? "text-orange-600 font-semibold" : ""
                    }
                  >
                    🚗 Band: {car.bookedCount}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600">
                  {car.pricePerDay.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    so'm
                  </span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCar(car);
                      setFormData({
                        ...car,
                        category: car.category || "economy",
                      });
                      setImagePreview(car.images[0] || "");
                      setShowAddModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(car._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Eye button for fully booked cars */}
                  {car.bookedCount > 0 && (
                    <button
                      onClick={async () => {
                        setLoadingCarBookings(true);
                        setShowBookingsModal(true);
                        try {
                          const res = await fetch(
                            `/api/bookings?car=${car._id}`,
                            {
                              credentials: "include",
                            }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            setCurrentCarBookings(data.data.bookings || []);
                          } else {
                            setCurrentCarBookings([]);
                            setError(
                              data.error || "Bookinglarni yuklashda xatolik"
                            );
                          }
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "Xatolik"
                          );
                          setCurrentCarBookings([]);
                        } finally {
                          setLoadingCarBookings(false);
                        }
                      }}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Band qilingan mijozlarni ko‘rish"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Mashinalar topilmadi</p>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-semibold text-gray-800">
                Band qilingan mijozlar
              </h3>
              <button
                onClick={() => setShowBookingsModal(false)}
                className="text-gray-400 hover:text-gray-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            {loadingCarBookings ? (
              <div className="p-6 text-center text-gray-600">
                Yuklanmoqda...
              </div>
            ) : currentCarBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Band qilingan mijozlar mavjud emas
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {currentCarBookings.map((booking, idx) => (
                  <div
                    key={idx}
                    className="border rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg transition bg-gray-50"
                  >
                    <div className="flex-1">
                      {/* Mijoz haqida */}
                      <p className="text-lg font-semibold text-gray-800">
                        {booking.user?.name || "Ism ko‘rsatilmagan"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <span>📧</span>{" "}
                        {booking.user?.email || "Email ko‘rsatilmagan"}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <span>📞</span>{" "}
                        {booking.user?.phone || "Telefon ko‘rsatilmagan"}
                      </p>

                      {/* Band qilingan sanalar */}
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">📅 Band qilingan:</span>{" "}
                        {new Date(booking.startDate).toLocaleDateString(
                          "uz-UZ"
                        )}{" "}
                        —{" "}
                        {new Date(booking.endDate).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold capitalize shrink-0 ${
                        booking.status === "active"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            "/api/bookings/send-reminder",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bookingId: booking._id,
                                userEmail: booking.user?.email,
                                userName: booking.user?.name,
                                carName: booking.carModel,
                                endDate: booking.endDate,
                              }),
                            }
                          );
                          const data = await res.json();
                          if (data.success) {
                            showToast(
                              "✅ Eslatma email muvaffaqiyatli yuborildi"
                            );
                            setShowBookingsModal(false);
                          } else {
                            showToast(`❌ Xatolik: ${data.message}`);
                          }
                        } catch (error: any) {
                          showToast(`❌ Server xatolik: ${error.message}`);
                        }
                      }}
                      className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
                    >
                      Send Email
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal - Formada totalCount field qo'shildi */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">
                {selectedCar ? "Tahrirlash" : "Yangi Mashina"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCar(null);
                  setImagePreview("");
                }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  {imagePreview || formData.images?.[0] ? (
                    <div className="relative">
                      <img
                        src={imagePreview || formData.images?.[0]}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData({ ...formData, images: [] });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Mashina rasmini yuklang
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Rasm tanlash
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Marka *
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.carModel || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, carModel: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Camry"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategoriya *
                  </label>
                  <select
                    value={formData.category || "economy"}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="economy">Economy</option>
                    <option value="luxury">Luxury</option>
                    <option value="suv">SUV</option>
                    <option value="sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Yili *
                  </label>
                  <input
                    type="number"
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: e.target.value
                          ? parseInt(e.target.value)
                          : new Date().getFullYear(),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Jami mashinalar soni *
                  </label>
                  <input
                    type="number"
                    value={formData.totalCount || ""}
                    onChange={(e) => {
                      const newTotal = e.target.value
                        ? parseInt(e.target.value)
                        : 1;
                      setFormData({
                        ...formData,
                        totalCount: newTotal,
                        // Yangi mashina qo'shilayotganda availableCount = totalCount
                        ...(!selectedCar && {
                          availableCount: newTotal,
                          bookedCount: 0,
                        }),
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Bu model mashinalarning jami soni
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rangi *
                  </label>
                  <input
                    type="text"
                    value={formData.color || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Oq"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Yoqilg'i *
                  </label>
                  <select
                    value={formData.fuelType || "benzin"}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="benzin">Benzin</option>
                    <option value="dizel">Dizel</option>
                    <option value="elektr">Elektr</option>
                    <option value="gibrid">Gibrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Transmissiya *
                  </label>
                  <select
                    value={formData.transmission || "avtomat"}
                    onChange={(e) =>
                      setFormData({ ...formData, transmission: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="avtomat">Avtomat</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    O'rindiqlar *
                  </label>
                  <input
                    type="number"
                    value={formData.seats || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seats: e.target.value ? parseInt(e.target.value) : 5,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    min="2"
                    max="9"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Zalog (Kafolat puli) *
                  </label>
                  <input
                    type="number"
                    value={formData.zalog || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        zalog: e.target.value ? parseInt(e.target.value) : 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="150000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kunlik narxi *
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerDay || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerDay: e.target.value
                          ? parseInt(e.target.value)
                          : 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="150000"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Shahar *
                  </label>
                  <input
                    type="text"
                    value={formData.location?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          city: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Toshkent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manzil *
                  </label>
                  <input
                    type="text"
                    value={formData.location?.address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          address: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Amir Temur ko'chasi, 1"
                    required
                  />
                </div>
              </div>

              {/* Agar tahrirlash rejimida bo'lsa, count ma'lumotlarini ko'rsatish */}
              {selectedCar && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-2">
                    Mashinalar holati:
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Jami:</span>
                      <span className="ml-2 font-bold text-gray-900">
                        {formData.totalCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mavjud:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {formData.availableCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Band:</span>
                      <span className="ml-2 font-bold text-orange-600">
                        {formData.bookedCount}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    * Jami sonni o'zgartirish faqat mavjud mashinalar soniga
                    ta'sir qiladi
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCar(null);
                    setImagePreview("");
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {(uploadingImage || saving) && (
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {saving || uploadingImage ? "Yuklanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCarsPage;
