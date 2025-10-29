// components/home/SearchSection.tsx
"use client";
import React, { useState } from "react";
import { MapPin, Calendar, Clock, Search, Sparkles } from "lucide-react";

const SearchSection = () => {
  const [searchData, setSearchData] = useState({
    location: "",
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    withDriver: false,
    withInsurance: false,
  });

  const handleSearch = () => {
    console.log("Search data:", searchData);
    // Bu yerda API ga request yuboriladi
  };

  const setQuickFilter = (type: string) => {
    const today = new Date();
    let endDate = new Date();

    switch (type) {
      case "today":
        endDate.setDate(today.getDate() + 1);
        break;
      case "tomorrow":
        today.setDate(today.getDate() + 1);
        endDate.setDate(today.getDate() + 2);
        break;
      case "weekend":
        const daysUntilFriday = (5 - today.getDay() + 7) % 7;
        today.setDate(today.getDate() + daysUntilFriday);
        endDate.setDate(today.getDate() + 2);
        break;
      case "week":
        endDate.setDate(today.getDate() + 7);
        break;
      case "month":
        endDate.setMonth(today.getMonth() + 1);
        break;
    }

    setSearchData({
      ...searchData,
      pickupDate: today.toISOString().split("T")[0],
      returnDate: endDate.toISOString().split("T")[0],
      pickupTime: "10:00",
      returnTime: "10:00",
    });
  };

  return (
    <div className="relative -mt-32 z-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Qidiruvni boshlang
              </h2>
              <p className="text-gray-600">Eng yaxshi takliflarni toping</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Location */}
            <div className="md:col-span-1">
              <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                Manzil
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Qayerda olmoqchisiz?"
                  value={searchData.location}
                  onChange={(e) =>
                    setSearchData({ ...searchData, location: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Pickup Date & Time */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Olish sanasi
                </label>
                <input
                  type="date"
                  value={searchData.pickupDate}
                  onChange={(e) =>
                    setSearchData({ ...searchData, pickupDate: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Vaqt
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) =>
                    setSearchData({ ...searchData, pickupTime: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Return Date & Time */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  Qaytarish sanasi
                </label>
                <input
                  type="date"
                  value={searchData.returnDate}
                  onChange={(e) =>
                    setSearchData({ ...searchData, returnDate: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Vaqt
                </label>
                <input
                  type="time"
                  value={searchData.returnTime}
                  onChange={(e) =>
                    setSearchData({ ...searchData, returnTime: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchData.withDriver}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      withDriver: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Haydovchi bilan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchData.withInsurance}
                  onChange={(e) =>
                    setSearchData({
                      ...searchData,
                      withInsurance: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-2 border-gray-300 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Sug'urta</span>
              </label>
            </div>

            <button
              onClick={handleSearch}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Qidirish
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-8 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
            Tez tanlov:
          </span>
          {[
            { label: "Bugun", value: "today" },
            { label: "Ertaga", value: "tomorrow" },
            { label: "Hafta oxiri", value: "weekend" },
            { label: "1 hafta", value: "week" },
            { label: "1 oy", value: "month" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setQuickFilter(filter.value)}
              className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:text-purple-600 hover:shadow-lg transition-all whitespace-nowrap"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
