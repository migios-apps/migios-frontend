import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  SalesHeatmapCell,
  SalesWeekdayRow,
} from "@/services/api/@types/report-sales"
import { apiGetSalesAnalytic } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import ReportChartCard from "../../components/ReportChartCard"
import ReportEmptyState from "../../components/ReportEmptyState"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const HOURS = Array.from({ length: 24 }, (_, index) => index)

const distributionConfig = buildChartConfig([
  { key: "count", label: "Jumlah Faktur" },
])

const audienceConfig = buildChartConfig([
  { key: "new_member", label: "Member Baru" },
  { key: "repeat_member", label: "Member Berulang", color: "var(--chart-3)" },
])

const weekdayColumns: DataTableColumnDef<SalesWeekdayRow>[] = [
  { header: "Hari", accessorKey: "label", size: 140 },
  {
    header: "Jumlah Faktur",
    accessorKey: "invoice_count",
    cell: ({ row }) => row.original.invoice_count.toLocaleString("id-ID"),
  },
  {
    header: "Net Sales",
    accessorKey: "net",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.net)}</span>
    ),
  },
  {
    header: "Rata-rata per Faktur",
    accessorKey: "avg_invoice",
    cell: ({ row }) => currencyFormat(row.original.avg_invoice),
  },
]

interface HeatmapProps {
  cells: SalesHeatmapCell[]
  loading?: boolean
}

const Heatmap = ({ cells, loading }: HeatmapProps) => {
  const { lookup, max } = useMemo(() => {
    const map = new Map<string, SalesHeatmapCell>()
    let peak = 0
    for (const cell of cells) {
      map.set(`${cell.dow}-${cell.hour}`, cell)
      peak = Math.max(peak, cell.net)
    }
    return { lookup: map, max: peak }
  }, [cells])

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  if (cells.length === 0) {
    return <ReportEmptyState className="h-64" />
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="text-muted-foreground mb-1 grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-0.5 text-[10px]">
          <span />
          {HOURS.map((hour) => (
            <span key={hour} className="text-center">
              {hour % 3 === 0 ? hour : ""}
            </span>
          ))}
        </div>
        {WEEKDAYS.map((label, dow) => (
          <div
            key={label}
            className="mb-0.5 grid grid-cols-[48px_repeat(24,minmax(0,1fr))] gap-0.5"
          >
            <span className="text-muted-foreground self-center text-xs">
              {label}
            </span>
            {HOURS.map((hour) => {
              const cell = lookup.get(`${dow}-${hour}`)
              const intensity = cell && max > 0 ? cell.net / max : 0
              return (
                <div
                  key={hour}
                  title={
                    cell
                      ? `${label} ${hour}:00 — ${cell.invoice_count} faktur, ${currencyFormat(cell.net)}`
                      : `${label} ${hour}:00 — tidak ada transaksi`
                  }
                  className={cn(
                    "h-6 rounded-[3px]",
                    intensity === 0 ? "bg-muted" : "bg-primary"
                  )}
                  style={
                    intensity > 0
                      ? { opacity: 0.2 + intensity * 0.8 }
                      : undefined
                  }
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const AnalyticSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "analytic", params],
    queryFn: () => apiGetSalesAnalytic(params),
    select: (res) => res.data,
  })

  const distribution = data?.distribution ?? []
  const audience = data?.audience ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={5}
        loading={isLoading}
        skeletonCount={5}
      />

      <Card className="gap-1 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            Heatmap Penjualan Hari x Jam
          </CardTitle>
          <CardDescription>
            Intensitas warna mengikuti net sales. Selalu memakai tanggal
            transaksi, bukan tanggal faktur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Heatmap cells={data?.heatmap ?? []} loading={isLoading} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Distribusi Nilai Faktur"
          description="Sebaran faktur berdasarkan nominal"
          config={distributionConfig}
          loading={isLoading}
          empty={distribution.every((row) => row.count === 0)}
        >
          <BarChart data={distribution}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Bar dataKey="count" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Revenue Member Baru vs Berulang"
          description="Member baru = join_date berada di dalam rentang laporan"
          config={audienceConfig}
          loading={isLoading}
          empty={audience.length === 0}
        >
          <BarChart data={audience}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <ChartLegend />
            <Bar dataKey="new_member" fill={getSeriesColor(0)} radius={2} />
            <Bar dataKey="repeat_member" fill={getSeriesColor(2)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Ringkasan per Hari dalam Minggu"
        columns={weekdayColumns}
        data={data?.weekdays ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default AnalyticSection
