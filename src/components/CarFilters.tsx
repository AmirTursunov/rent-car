"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function CarFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(query as any);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/cars?${next.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <input
        placeholder="Qidirish (marka, model, shahar)"
        defaultValue={query.q || ""}
        onChange={(e) => setParam("q", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      />
      <select
        defaultValue={query.fuelType || ""}
        onChange={(e) => setParam("fuelType", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">Yoqilg'i</option>
        <option value="benzin">Benzin</option>
        <option value="dizel">Dizel</option>
        <option value="elektr">Elektr</option>
        <option value="gibrid">Gibrid</option>
      </select>
      <select
        defaultValue={query.transmission || ""}
        onChange={(e) => setParam("transmission", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">KPP</option>
        <option value="manual">Manual</option>
        <option value="avtomat">Avtomat</option>
      </select>
      <input
        type="number"
        min={0}
        placeholder="Min narx"
        defaultValue={query.minPrice || ""}
        onChange={(e) => setParam("minPrice", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      />
      <input
        type="number"
        min={0}
        placeholder="Max narx"
        defaultValue={query.maxPrice || ""}
        onChange={(e) => setParam("maxPrice", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}


