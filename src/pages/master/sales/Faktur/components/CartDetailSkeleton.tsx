import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

const CartDetailSkeleton = () => {
  return (
    <div className="grid h-full grid-cols-1 items-start lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
      {/* Left Column - Item Selection & Invoice Summary */}
      <div className="flex w-full flex-col">
        <div className="flex flex-col gap-3 p-4 pb-0">
          {/* Header dengan lokasi dan tanggal */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
            {/* Lokasi */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            {/* Tanggal */}
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>

          {/* Search Bar */}
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        <ScrollArea className="h-[calc(100vh-185px)]">
          <div className="flex flex-col gap-3 overflow-y-auto p-4">
            {/* Item Card */}
            <div className="border-border bg-card rounded-lg border p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="mb-1 h-4 w-32" />
                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="border-border space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28 line-through" />
                </div>
                <div className="flex flex-col gap-1 pt-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
            </div>

            {/* Invoice Summary Card */}
            <div className="mt-4 flex justify-end">
              <div className="border-border bg-card w-full max-w-md rounded-lg border p-4">
                {/* Header dengan Redeem Poin button */}
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-32 rounded-md" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>

                  <div className="border-border border-t pt-3">
                    <div className="mb-2 flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>

                  <div className="border-border border-t pt-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Column - Member and Payment */}
      <div className="border-border flex h-full flex-col border-l">
        <ScrollArea className="h-screen flex-1">
          <div className="flex flex-col gap-3 overflow-y-auto p-4">
            {/* Member Field */}
            <div className="mb-4">
              <Skeleton className="mb-2 h-4 w-16" />
              <div className="border-border flex items-center gap-3 rounded-md border p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-1 h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            {/* Sales Field */}
            <div className="mb-4">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Payment Amount */}
            <div className="mb-4">
              <Skeleton className="mb-2 h-4 w-20" />
              <div className="border-border bg-card rounded-lg border p-4">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <Skeleton className="mb-2 h-4 w-28" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Bottom Action Area */}
        <div className="border-border bg-card flex flex-col gap-3 border-t p-4">
          {/* Payment Details */}
          <div className="space-y-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex w-full flex-col items-start gap-2 md:flex-row md:justify-between">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartDetailSkeleton
