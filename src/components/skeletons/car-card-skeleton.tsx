export function CarCardSkeleton() {
  return (
    <div className="group bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10">
      {/* Image Skeleton */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-600 animate-pulse" />

      <div className="p-6 space-y-4">
        {/* Title & Category */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
        </div>

        {/* Features Row */}
        <div className="flex items-center gap-4 pb-6 border-b border-orange-400/10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-11 w-24 bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function CarsListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}
