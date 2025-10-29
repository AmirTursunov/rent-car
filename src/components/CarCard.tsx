import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Car = {
  _id: string;
  brand: string;
  carModel?: string;
  model?: string;
  year: number;
  pricePerDay: number;
  images: string[];
  rating?: { average: number; count: number };
  location?: { city: string };
};

export default function CarCard({ car }: { car: Car }) {
  const cover = car.images?.[0] || "/window.svg";
  const model = car.carModel || (car as any).model || "";
  return (
    <Link
      href={`/cars/${car._id}`}
      className="group rounded-lg overflow-hidden border bg-white hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
        <img
          src={cover}
          alt={`${car.brand} ${car.carModel}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {car.brand} {model}
          </h3>
          <span className="text-sm text-gray-600">{car.year}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-gray-700 text-sm">
            {car.location?.city || ""}
          </div>
          <div className="font-semibold">{formatPrice(car.pricePerDay)}/kun</div>
        </div>
      </div>
    </Link>
  );
}


