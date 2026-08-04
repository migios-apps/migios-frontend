import { useQuery } from "@tanstack/react-query"
import type { FreezeRow } from "@/services/api/@types/report-packages"
import { apiGetPackageFreeze } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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

const trendConfig = buildChartConfig([
  { key: "freeze_count", label: "Freeze Baru", color: "var(--chart-3)" },
])

const statusConfig = buildChartConfig([{ key: "count", label: "Jumlah" }])

const columns: DataTableColumnDef<FreezeRow>[] = [
  {
    header: "Member",
    accessorKey: "member_name",
    size: 200,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Mulai",
    accessorKey: "start_date",
    cell: ({ row }) =>
      row.original.start_date
        ? dayjs(row.original.start_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Selesai",
    accessorKey: "end_date",
    cell: ({ row }) =>
      row.original.end_date
        ? dayjs(row.original.end_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Durasi",
    accessorKey: "duration_days",
    cell: ({ row }) => `${row.original.duration_days} hari`,
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    header: "Faktur",
    accessorKey: "transaction_code",
    cell: ({ row }) => row.original.transaction_code ?? "-",
  },
  {
    header: "Nilai",
    accessorKey: "amount",
    cell: ({ row }) => currencyFormat(row.original.amount),
  },
]

const FreezeSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportPackages, "freeze", params],
    queryFn: () => apiGetPackageFreeze(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const statusDistribution = data?.status_distribution ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Tren Freeze Baru"
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
        >
          <LineChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="freeze_count"
              type="monotone"
              stroke="var(--chart-3)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>

        <ReportChartCard
          title="Distribusi Status Freeze"
          config={statusConfig}
          loading={isLoading}
          empty={statusDistribution.length === 0}
        >
          <BarChart data={statusDistribution}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Bar dataKey="count" radius={2}>
              {statusDistribution.map((row, index) => (
                <Cell key={row.status} fill={getSeriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rincian Freeze"
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default FreezeSection
