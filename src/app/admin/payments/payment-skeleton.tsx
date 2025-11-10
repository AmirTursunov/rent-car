export function PaymentSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mt-3"></div>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-3"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="hover:bg-gray-50">
                    {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                      <td key={col} className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
