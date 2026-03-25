import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-square bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-3 sm:p-6">
        {/* Title skeleton */}
        <Skeleton className="h-4 sm:h-5 w-3/4 mb-1 sm:mb-2 bg-gray-200" />

        {/* Price + button row */}
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-5 sm:h-6 w-1/3 bg-gray-200" />
          <Skeleton className="h-7 sm:h-9 w-16 sm:w-24 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  )
}
