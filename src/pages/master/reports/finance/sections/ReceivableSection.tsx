import { useQuery } from "@tanstack/react-query"
import type { SalesOutstandingRow } from "@/services/api/@types/report-sales"
import { apiGetFinanceReceivable } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"
import { currencyTooltip } from "../../utils/tooltipFormatter"

const agingConfig = buildChartConfig([
  { key: "outstanding", label: "Outstanding", color: "var(--chart-negative)" },
])

const trendConfig = buildChartConfig([
  { key: "outstanding", label: "Outstanding", color: "var(--chart-negative)" },
])

const AGING_TONE: Record<string, string> = {
  "0-7": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "8-30": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "31-60": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "61-90": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ">90": "bg-red-500/15 text-red-600 dark:text-red-400",
}

const columns: DataTableColumnDef<SalesOutstandingRow>[] = [
  { header: "Faktur", accessorKey: "code", size: 140 },
  {
    header: "Member",
    accessorKey: "member_name",
    size: 180,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Tanggal",
    accessorKey: "created_at",
    cell: ({ row }) => dayjs(row.original.created_at).format("DD MMM YYYY"),
  },
  {
    header: "Jatuh Tempo",
    accessorKey: "due_date",
    cell: ({ row }) =>
      row.original.due_date
        ? dayjs(row.original.due_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Total",
    accessorKey: "total_amount",
    cell: ({ row }) => currencyFormat(row.original.total_amount),
  },
  {
    header: "Terbayar",
    accessorKey: "paid_amount",
    cell: ({ row }) => currencyFormat(row.original.paid_amount),
  },
  {
    header: "Sisa",
    accessorKey: "outstanding",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.outstanding)}
      </span>
    ),
  },
  {
    header: "Umur",
    accessorKey: "age_days",
    cell: ({ row }) => `${row.original.age_days} hari`,
  },
  {
    header: "Aging",
    accessorKey: "aging_bucket",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={AGING_TONE[row.original.aging_bucket] ?? ""}
      >
        {row.original.aging_bucket}
      </Badge>
    ),
  },
]

const ReceivableSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, "receivable", params],
    queryFn: () => apiGetFinanceReceivable(params),
    select: (res) => res.data,
  })

  const aging = data?.aging ?? []
  const series = data?.series ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Aging Piutang"
          description="Seluruh faktur outstanding, tidak dibatasi rentang tanggal"
          config={agingConfig}
          loading={isLoading}
          empty={aging.every((row) => row.outstanding === 0)}
        >
          <BarChart data={aging}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="bucket"
                  formatter={currencyTooltip(agingConfig)}
                />
              }
            />
            <Bar dataKey="outstanding" fill={getSeriesColor(3)} radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Outstanding per Periode"
          description="Faktur outstanding yang terbit di dalam rentang laporan"
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
        >
          <AreaChart data={series}>
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
                <ChartTooltipContent formatter={currencyTooltip(trendConfig)} />
              }
            />
            <Area
              dataKey="outstanding"
              type="monotone"
              fill="var(--chart-negative)"
              fillOpacity={0.2}
              stroke="var(--chart-negative)"
            />
          </AreaChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Faktur Outstanding"
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default ReceivableSection
