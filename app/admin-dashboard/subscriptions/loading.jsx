export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Subscriptions List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
