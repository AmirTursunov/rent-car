export function MyBookingsSkeleton() {
  return (
    <div className="min-h-screen py-30 px-6">
      <div className="mb-12">
        <div className="h-10 w-64 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded animate-pulse mx-auto"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-yellow-400/20 rounded-2xl overflow-hidden"
          >
            <div className="w-full h-48 bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse"></div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-gradient-to-r from-yellow-400/30 to-yellow-400/10 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-yellow-400/20 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-green-400/20 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-48 bg-gray-600/30 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-gray-600/30 rounded animate-pulse"></div>
                <div className="h-4 w-44 bg-gray-600/30 rounded animate-pulse"></div>
              </div>

              <div className="h-10 w-full bg-yellow-400/10 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
