import { useQuery } from "@tanstack/react-query"
import type { MemberValueRow } from "@/services/api/@types/report-members"
import { apiGetMemberValue } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
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

const spendConfig = buildChartConfig([
  { key: "total_spend", label: "Total Belanja" },
])

const segmentConfig = buildChartConfig([
  { key: "count", label: "Jumlah Member" },
])

const SEGMENT_TONE: Record<string, string> = {
  Champion: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Loyal: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  New: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "At Risk": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Hibernating: "bg-muted text-muted-foreground",
}

const columns: DataTableColumnDef<MemberValueRow>[] = [
  {
    header: "Member",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name ?? "-"}</span>
        {row.original.code ? (
          <span className="text-muted-foreground text-xs">
            {row.original.code}
          </span>
        ) : null}
      </div>
    ),
  },
  { header: "Transaksi", accessorKey: "transaction_count" },
  {
    header: "Total Belanja",
    accessorKey: "total_spend",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.total_spend)}
      </span>
    ),
  },
  {
    header: "Rata-rata",
    accessorKey: "avg_spend",
    cell: ({ row }) => currencyFormat(row.original.avg_spend),
  },
  {
    header: "Transaksi Terakhir",
    accessorKey: "last_transaction",
    cell: ({ row }) =>
      row.original.last_transaction
        ? dayjs(row.original.last_transaction).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Outstanding",
    accessorKey: "outstanding",
    cell: ({ row }) => currencyFormat(row.original.outstanding),
  },
  {
    header: "Segmen",
    accessorKey: "segment",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={SEGMENT_TONE[row.original.segment] ?? ""}
      >
        {row.original.segment}
      </Badge>
    ),
  },
]

const ValueSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportMembers, "value", params],
    queryFn: () => apiGetMemberValue(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []
  const segments = data?.segments ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={5}
        loading={isLoading}
        skeletonCount={5}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Top 10 Member by Belanja"
          config={spendConfig}
          loading={isLoading}
          empty={rows.length === 0}
          height="h-96"
        >
          <BarChart data={rows.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar dataKey="total_spend" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Segmentasi RFM"
          description="Recency <= 30 hari, Frequency >= 3 transaksi, Monetary >= median belanja"
          config={segmentConfig}
          loading={isLoading}
          empty={segments.length === 0}
          height="h-96"
        >
          <BarChart data={segments}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="segment" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="segment" />} />
            <Bar dataKey="count" radius={2}>
              {segments.map((row, index) => (
                <Cell key={row.segment} fill={getSeriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Nilai per Member"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default ValueSection
