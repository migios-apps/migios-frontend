import { useQuery } from "@tanstack/react-query"
import type { MemberAttendanceRow } from "@/services/api/@types/report-members"
import { apiGetMemberAttendance } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const trendConfig = buildChartConfig([
  { key: "visit_count", label: "Check-in", color: "var(--primary)" },
])

const freqConfig = buildChartConfig([{ key: "count", label: "Jumlah Member" }])

const columns: DataTableColumnDef<MemberAttendanceRow>[] = [
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
  { header: "Jumlah Kunjungan", accessorKey: "visit_count" },
  {
    header: "Kunjungan Terakhir",
    accessorKey: "last_visit",
    cell: ({ row }) =>
      row.original.last_visit
        ? dayjs(row.original.last_visit).format("DD MMM YYYY")
        : "Belum pernah",
  },
  {
    header: "Hari Sejak Terakhir",
    accessorKey: "days_since_last_visit",
    cell: ({ row }) =>
      row.original.days_since_last_visit === null
        ? "-"
        : `${row.original.days_since_last_visit} hari`,
  },
]

const AttendanceSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportMembers, "attendance", params],
    queryFn: () => apiGetMemberAttendance(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const frequency = data?.frequency_distribution ?? []

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
          title="Tren Check-in"
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
              dataKey="visit_count"
              type="monotone"
              stroke="var(--primary)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>

        <ReportChartCard
          title="Distribusi Frekuensi Kunjungan"
          config={freqConfig}
          loading={isLoading}
          empty={frequency.every((row) => row.count === 0)}
        >
          <BarChart data={frequency}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="bucket" />} />
            <Bar dataKey="count" fill={getSeriesColor(1)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Member Paling Aktif"
        columns={columns}
        data={data?.top_members ?? []}
        loading={isLoading}
      />

      <ReportTableCard
        title="Member Berisiko"
        description="Paket masih aktif tapi tidak hadir lebih dari 30 hari"
        columns={columns}
        data={data?.at_risk ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default AttendanceSection
