export function BookingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-3"></div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <th key={i} className="text-left py-3 px-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <td key={col} className="py-4 px-4">
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
