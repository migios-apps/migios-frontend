import { useQuery } from "@tanstack/react-query"
import type { EmployeeTrainerRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeeTrainer } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import {
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const chartConfig = buildChartConfig([
  { key: "approved", label: "Disetujui", color: "var(--chart-2)" },
  { key: "pending", label: "Pending", color: "var(--chart-3)" },
  { key: "rejected", label: "Ditolak", color: "var(--chart-4)" },
])

const columns: DataTableColumnDef<EmployeeTrainerRow>[] = [
  { header: "Trainer", accessorKey: "trainer_name", size: 200 },
  { header: "Member Ditangani", accessorKey: "active_member" },
  { header: "Sesi Disetujui", accessorKey: "approved" },
  { header: "Pending", accessorKey: "pending" },
  { header: "Ditolak", accessorKey: "rejected" },
  { header: "Sesi Terpakai", accessorKey: "session_used" },
  {
    header: "Tingkat Penyelesaian",
    accessorKey: "completion_percent",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.completion_percent.toFixed(1)}%
      </span>
    ),
  },
  {
    header: "Sesi Terakhir",
    accessorKey: "last_session",
    cell: ({ row }) =>
      row.original.last_session
        ? dayjs(row.original.last_session).format("DD MMM YYYY")
        : "-",
  },
]

const TrainerSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "trainer", params],
    queryFn: () => apiGetEmployeeTrainer(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <ReportChartCard
        title="Sesi per Trainer"
        description="Dipecah berdasarkan status sesi"
        config={chartConfig}
        loading={isLoading}
        empty={rows.length === 0}
        height="h-80"
      >
        <BarChart data={rows}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="trainer_name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={50} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend />
          <Bar
            dataKey="approved"
            stackId="s"
            fill="var(--chart-2)"
            radius={2}
          />
          <Bar dataKey="pending" stackId="s" fill="var(--chart-3)" radius={2} />
          <Bar
            dataKey="rejected"
            stackId="s"
            fill="var(--chart-4)"
            radius={2}
          />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Kinerja Trainer"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default TrainerSection
