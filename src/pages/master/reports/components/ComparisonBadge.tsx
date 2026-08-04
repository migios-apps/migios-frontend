import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ComparisonValue } from "../types"

interface ComparisonBadgeProps {
  comparison: ComparisonValue
  invert?: boolean
  periodLabel?: string
  className?: string
}

const ComparisonBadge = ({
  comparison,
  invert = false,
  periodLabel,
  className,
}: ComparisonBadgeProps) => {
  const { delta, delta_percent } = comparison
  const isFlat = delta === 0
  const isUp = delta > 0
  const isGood = invert ? !isUp : isUp

  const Icon = isFlat ? ArrowRight : isUp ? ArrowUpRight : ArrowDownRight

  const tone = isFlat
    ? "text-muted-foreground bg-muted"
    : isGood
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"

  const percentLabel =
    delta_percent === null
      ? "baru"
      : `${delta_percent > 0 ? "+" : ""}${delta_percent.toFixed(1)}%`

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
          tone
        )}
      >
        <Icon className="h-3 w-3" />
        {percentLabel}
      </span>
      {periodLabel ? (
        <span className="text-muted-foreground text-xs">{periodLabel}</span>
      ) : null}
    </span>
  )
}

export default ComparisonBadge
