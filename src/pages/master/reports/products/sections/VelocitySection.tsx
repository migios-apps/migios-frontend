import { useQuery } from "@tanstack/react-query"
import type { ProductVelocityRow } from "@/services/api/@types/report-products"
import { apiGetProductVelocity } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const deltaConfig = buildChartConfig([
  { key: "delta_percent", label: "Delta (%)" },
])

const MOVEMENT_LABELS: Record<string, string> = {
  fast: "Fast",
  medium: "Medium",
  slow: "Slow",
  dead: "Dead",
}

const MOVEMENT_TONE: Record<string, string> = {
  fast: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  slow: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  dead: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

const ABC_TONE: Record<string, string> = {
  A: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  B: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  C: "bg-muted text-muted-foreground",
}

const columns: DataTableColumnDef<ProductVelocityRow>[] = [
  { header: "Produk", accessorKey: "name", size: 220 },
  { header: "Qty Periode Ini", accessorKey: "qty_current" },
  { header: "Qty Periode Lalu", accessorKey: "qty_previous" },
  {
    header: "Delta",
    accessorKey: "delta_percent",
    cell: ({ row }) =>
      row.original.delta_percent === null ? (
        <span className="text-muted-foreground">baru</span>
      ) : (
        <span
          className={cn(
            "font-medium",
            row.original.delta_percent < 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {row.original.delta_percent > 0 ? "+" : ""}
          {row.original.delta_percent.toFixed(1)}%
        </span>
      ),
  },
  {
    header: "Rata-rata Harian",
    accessorKey: "daily_average",
    cell: ({ row }) => row.original.daily_average.toFixed(2),
  },
  {
    header: "Klasifikasi",
    accessorKey: "movement",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={MOVEMENT_TONE[row.original.movement] ?? ""}
      >
        {MOVEMENT_LABELS[row.original.movement] ?? row.original.movement}
      </Badge>
    ),
  },
  {
    header: "Kelas ABC",
    accessorKey: "abc_class",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={ABC_TONE[row.original.abc_class] ?? ""}
      >
        {row.original.abc_class}
      </Badge>
    ),
  },
  {
    header: "Net Revenue",
    accessorKey: "net",
    cell: ({ row }) => currencyFormat(row.original.net),
  },
  {
    header: "Kumulatif",
    accessorKey: "cumulative_share",
    cell: ({ row }) => `${row.original.cumulative_share.toFixed(1)}%`,
  },
]

const VelocitySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportProducts, "velocity", params],
    queryFn: () => apiGetProductVelocity(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []
  const withDelta = rows.filter((row) => row.delta_percent !== null)

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportChartCard
        title="Perubahan Qty vs Periode Sebelumnya"
        description={
          data?.compare_period_label
            ? `Dibandingkan dengan ${data.compare_period_label}`
            : undefined
        }
        config={deltaConfig}
        loading={isLoading}
        empty={withDelta.length === 0}
        height="h-96"
      >
        <BarChart data={withDelta.slice(0, 15)} layout="vertical">
          <CartesianGrid horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={150}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                formatter={(value) => `${Number(value).toFixed(1)}%`}
              />
            }
          />
          <Bar dataKey="delta_percent" radius={2}>
            {withDelta.slice(0, 15).map((row) => (
              <Cell
                key={row.product_id}
                fill={
                  (row.delta_percent ?? 0) < 0
                    ? "var(--chart-negative)"
                    : "var(--chart-positive)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Kecepatan Jual & Klasifikasi ABC"
        description="Kelas A = kontribusi kumulatif sampai 80%, B sampai 95%, sisanya C"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default VelocitySection
