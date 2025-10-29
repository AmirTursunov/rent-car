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
  Upload,
  Image as ImageIcon,
} from "lucide-react";

interface CarData {
  _id: string;
  brand: string;
  carModel: string;
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
}

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
  const [formData, setFormData] = useState<Partial<CarData>>({
    brand: "",
    carModel: "",
    year: new Date().getFullYear(),
    color: "",
    fuelType: "benzin",
    transmission: "avtomat",
    seats: 5,
    pricePerDay: 0,
    available: true,
    images: [],
    location: { city: "Toshkent", address: "" },
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const getToken = () => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("Token topilmadi");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/cars?admin=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Yuklab bo'lmadi");

      const data = await response.json();
      if (data.success) {
        setCars(data.data.cars);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
      setLoading(false);
    }
  };

  // ✅ Rasmni Cloudinary ga yuklash
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File hajmini tekshirish (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan kichik bo'lishi kerak");
      return;
    }

    // File turini tekshirish
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm yuklash mumkin");
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);

      // Preview uchun
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Cloudinary ga yuklash
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Yuklashda xatolik");
      }

      const data = await response.json();

      if (data.url) {
        setFormData({
          ...formData,
          images: [data.url],
        });
        console.log("✅ Rasm yuklandi:", data.url);
      }

      setUploadingImage(false);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Rasm yuklashda xatolik");
      setUploadingImage(false);
      setImagePreview(""); // Preview ni tozalash
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Formni prevent qilish
    setError(null);

    // Validation
    if (!formData.brand || !formData.carModel) {
      setError("Marka va Model to'ldirilishi shart!");
      return;
    }

    if (!formData.location?.city || !formData.location?.address) {
      setError("Shahar va Manzil to'ldirilishi shart!");
      return;
    }

    if (!formData.images || formData.images.length === 0) {
      setError("Rasm yuklash majburiy!");
      return;
    }

    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      setError("Kunlik narx 0 dan katta bo'lishi kerak!");
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        setError("Token topilmadi");
        return;
      }

      const url = selectedCar ? `/api/cars/${selectedCar._id}` : "/api/cars";
      const method = selectedCar ? "PUT" : "POST";

      console.log("📤 Yuborilmoqda:", formData);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("📥 Javob:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Saqlashda xatolik");
      }

      if (data.success) {
        setShowAddModal(false);
        setImagePreview("");
        setSelectedCar(null);
        fetchCars();
        alert(selectedCar ? "Mashina yangilandi!" : "Mashina qo'shildi!");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Xatolik");
    }
  };

  const handleDelete = async (carId: string) => {
    if (!window.confirm("O'chirmoqchimisiz?")) return;

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("O'chirishda xatolik");

      fetchCars();
      alert("Mashina o'chirildi!");
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
      (filterAvailable === "available" && car.available) ||
      (filterAvailable === "unavailable" && !car.available);
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
    <div className="space-y-6">
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
            Jami: <strong>{cars.length}</strong> ta
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCar(null);
            setImagePreview("");
            setFormData({
              brand: "",
              carModel: "",
              year: new Date().getFullYear(),
              color: "",
              fuelType: "benzin",
              transmission: "avtomat",
              seats: 5,
              pricePerDay: 0,
              available: true,
              images: [],
              location: { city: "Toshkent", address: "" },
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
              <span
                className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${
                  car.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {car.available ? "Mavjud" : "Band"}
              </span>
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
                      setFormData(car);
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

      {/* ✅ Modal - form tag bilan */}
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

            {/* ✅ Form tag */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image Upload Section */}
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.available || false}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label className="ml-2 text-sm">Mavjud (ijarada emas)</label>
              </div>

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
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? "Yuklanmoqda..." : "Saqlash"}
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
