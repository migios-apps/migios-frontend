import { useQuery } from "@tanstack/react-query"
import type { SessionUsageRow } from "@/services/api/@types/report-packages"
import { apiGetPackageSessions } from "@/services/api/ReportService"
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
  { key: "session_used", label: "Sesi Terpakai", color: "var(--primary)" },
])

const trainerConfig = buildChartConfig([
  { key: "session_used", label: "Sesi Terpakai" },
])

const columns: DataTableColumnDef<SessionUsageRow>[] = [
  {
    header: "Member",
    accessorKey: "member_name",
    size: 180,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Paket",
    accessorKey: "package_name",
    size: 200,
    cell: ({ row }) => row.original.package_name ?? "-",
  },
  {
    header: "Trainer",
    accessorKey: "trainer_name",
    cell: ({ row }) => row.original.trainer_name ?? "-",
  },
  { header: "Total Sesi", accessorKey: "total_session" },
  { header: "Terpakai", accessorKey: "used_session" },
  {
    header: "Sisa",
    accessorKey: "remaining_session",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.remaining_session}</span>
    ),
  },
  {
    header: "Utilisasi",
    accessorKey: "utilization_percent",
    cell: ({ row }) => `${row.original.utilization_percent.toFixed(1)}%`,
  },
  {
    header: "Sesi Terakhir",
    accessorKey: "last_session_at",
    cell: ({ row }) =>
      row.original.last_session_at
        ? dayjs(row.original.last_session_at).format("DD MMM YYYY")
        : "-",
  },
]

const SessionSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportPackages, "sessions", params],
    queryFn: () => apiGetPackageSessions(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const byTrainer = data?.by_trainer ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Tren Sesi Terpakai"
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
              dataKey="session_used"
              type="monotone"
              stroke="var(--primary)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>

        <ReportChartCard
          title="Sesi per Trainer"
          config={trainerConfig}
          loading={isLoading}
          empty={byTrainer.length === 0}
        >
          <BarChart data={byTrainer} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="trainer_name"
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="trainer_name" />}
            />
            <Bar dataKey="session_used" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Pemakaian Sesi per Paket Member"
        description="Total sesi = session_duration + extra_session; terpakai dihitung dari sesi berstatus disetujui"
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default SessionSection
