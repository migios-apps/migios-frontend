import type { ReportKpi } from "@/services/api/@types/report"
import type { ReportKpiCardProps } from "../components/ReportKpiCard"

const LOWER_IS_BETTER = new Set([
  "discount",
  "outstanding",
  "refund_value",
  "void_value",
  "total_out",
  "avg_age",
  "unpaid_count",
])

export const toKpiCards = (
  kpis: ReportKpi[] | undefined,
  comparePeriodLabel?: string | null
): ReportKpiCardProps[] =>
  (kpis ?? []).map((kpi) => ({
    title: kpi.label,
    value: (
      <h3 className="text-2xl font-semibold">{kpi.fvalue ?? kpi.value}</h3>
    ),
    comparison: kpi.comparison,
    invertComparison: LOWER_IS_BETTER.has(kpi.key),
    comparePeriodLabel: comparePeriodLabel ?? undefined,
  }))
