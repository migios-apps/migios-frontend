import { cn } from "@/lib/utils"
import ReportKpiCard, { type ReportKpiCardProps } from "./ReportKpiCard"

interface ReportKpiRowProps {
  items: ReportKpiCardProps[]
  columns?: 2 | 3 | 4 | 5 | 6
  loading?: boolean
  skeletonCount?: number
  className?: string
}

const columnClass: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
  5: "md:grid-cols-3 xl:grid-cols-5",
  6: "md:grid-cols-3 xl:grid-cols-6",
}

const ReportKpiRow = ({
  items,
  columns = 4,
  loading,
  skeletonCount,
  className,
}: ReportKpiRowProps) => {
  const placeholders = skeletonCount ?? columns
  const cards = loading
    ? Array.from({ length: placeholders }, (_, index) => ({
        title: "",
        value: 0,
        loading: true,
        key: `kpi-skeleton-${index}`,
      }))
    : items.map((item, index) => ({ ...item, key: `${item.title}-${index}` }))

  return (
    <div
      className={cn(
        "bg-muted/50 grid grid-cols-1 gap-4 rounded-2xl p-3",
        columnClass[columns],
        className
      )}
    >
      {cards.map(({ key, ...card }) => (
        <ReportKpiCard key={key} {...card} />
      ))}
    </div>
  )
}

export default ReportKpiRow
