import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const CartDetailSkeleton = () => {
  return (
    <div className="grid h-full grid-cols-1 items-start lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
      {/* Left Panel */}
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-3 p-4">
          {/* Header dengan lokasi dan tanggal */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-20 w-20 rounded" />
              <Skeleton className="h-120 w-20" />
            </div>
            <Skeleton className="h-150 w-36 rounded-md" />
          </div>

          {/* Search Bar */}
          <Skeleton className="h-44 w-44 rounded-md" />
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="flex flex-col gap-3 overflow-y-auto p-4">
            {/* Item Cards */}
            {Array.from({ length: 2 }, (_, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="w-60% mb-2" />
                    <Skeleton className="w-40% mb-1" />
                    <Skeleton className="w-30%" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="mb-1 w-100" />
                    <Skeleton className="w-80" />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Skeleton className="w-60" />
                    <Skeleton className="w-40" />
                  </div>
                  <Skeleton className="h-20 w-20 rounded" />
                </div>
              </div>
            ))}

            {/* Invoice Summary */}
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-md rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <Skeleton className="mb-3 w-150" />

                <div className="mb-4 space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="w-80" />
                      <Skeleton className="w-100" />
                    </div>
                  ))}
                </div>

                <div className="mb-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                  <div className="mb-2 flex justify-between">
                    <Skeleton className="w-60" />
                    <Skeleton className="w-120" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="w-140" />
                    <Skeleton className="w-60" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel */}
      <div className="flex h-full flex-col border-l border-gray-200 dark:border-gray-700">
        <ScrollArea className="flex h-[calc(100vh-490px)] flex-1 flex-col gap-3 overflow-y-auto p-4">
          {/* Member Field */}
          <div className="mb-4">
            <Skeleton className="mb-2 w-80" />
            <Skeleton className="h-40 w-40 rounded-md" />
          </div>

          {/* Sales Field */}
          <div className="mb-4">
            <Skeleton className="mb-2 w-100" />
            <Skeleton className="h-40 w-40 rounded-md" />
          </div>

          {/* Payment Amount */}
          <div className="mb-4">
            <Skeleton className="mb-2 w-70" />
            <Skeleton className="h-80 w-80 rounded-md" />
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <Skeleton className="mb-2 w-120" />
            <Skeleton className="h-40 w-40 rounded-md" />
          </div>
        </ScrollArea>

        {/* Bottom Action Area */}
        <div className="flex flex-col gap-2.5 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          {/* Payment Details */}
          <div className="mb-3 space-y-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="w-80" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-100" />
                  <Skeleton className="h-16 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full flex-col items-start gap-2 md:flex-row md:justify-between">
            <Skeleton className="h-40 w-40 rounded-full" />
            <Skeleton className="h-40 w-55 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartDetailSkeleton
