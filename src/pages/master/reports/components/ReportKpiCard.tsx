import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import type { ComparisonValue } from "../types"
import ComparisonBadge from "./ComparisonBadge"

export interface ReportKpiCardProps {
  title: string
  value: number | ReactNode
  icon?: ReactNode
  iconClass?: string
  comparison?: ComparisonValue | null
  invertComparison?: boolean
  comparePeriodLabel?: string
  hint?: string | ReactNode
  loading?: boolean
  active?: boolean
  onClick?: () => void
}

const ReportKpiCard = ({
  title,
  value,
  icon,
  iconClass,
  comparison,
  invertComparison,
  comparePeriodLabel,
  hint,
  loading,
  active,
  onClick,
}: ReportKpiCardProps) => {
  const interactive = typeof onClick === "function"

  const body = (
    <div className="relative flex justify-between gap-2 md:flex-col-reverse 2xl:flex-row">
      <div className="flex-1">
        <div className="mb-2 text-sm font-semibold">{title}</div>
        {loading ? (
          <Skeleton className="mb-1 h-8 w-24" />
        ) : (
          <div className="mb-1">{value}</div>
        )}
        {loading ? (
          <Skeleton className="h-3 w-40" />
        ) : comparison ? (
          <ComparisonBadge
            comparison={comparison}
            invert={invertComparison}
            periodLabel={comparePeriodLabel}
          />
        ) : hint ? (
          <div className="text-muted-foreground text-xs">{hint}</div>
        ) : null}
      </div>
      {icon ? (
        <div
          className={cn(
            "flex max-h-12 min-h-12 max-w-12 min-w-12 items-center justify-center rounded-full text-2xl",
            iconClass
          )}
        >
          {icon}
        </div>
      ) : null}
    </div>
  )

  const className = cn(
    "rounded-2xl p-4 transition duration-150 outline-none ltr:text-left rtl:text-right",
    interactive && "cursor-pointer",
    active
      ? "bg-background ring-border shadow-md ring-1"
      : "border-border hover:bg-accent/50 border"
  )

  if (!interactive) {
    return <div className={className}>{body}</div>
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {body}
    </button>
  )
}

export default ReportKpiCard
