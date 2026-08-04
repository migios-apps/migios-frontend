import { Skeleton } from "@/components/ui/skeleton"

const ReportSectionSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="bg-muted/50 grid grid-cols-1 gap-4 rounded-2xl p-3 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="border-border rounded-2xl border p-4">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="mb-1 h-8 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
    <Skeleton className="h-80 w-full rounded-lg" />
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
)

export default ReportSectionSkeleton
