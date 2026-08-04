import { useQuery } from "@tanstack/react-query"
import type { EmployeeAttendanceRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeeAttendance } from "@/services/api/ReportService"
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
import { percentTooltip } from "../../utils/tooltipFormatter"

const percentConfig = buildChartConfig([
  {
    key: "attendance_percent",
    label: "Kehadiran (%)",
    color: "var(--chart-cat-2)",
  },
])

const trendConfig = buildChartConfig([
  { key: "checkin_count", label: "Check-in", color: "var(--primary)" },
])

const columns: DataTableColumnDef<EmployeeAttendanceRow>[] = [
  { header: "Karyawan", accessorKey: "name", size: 200 },
  { header: "Hari Hadir", accessorKey: "present_days" },
  { header: "Hari dalam Periode", accessorKey: "working_days" },
  {
    header: "Kehadiran",
    accessorKey: "attendance_percent",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.attendance_percent.toFixed(1)}%
      </span>
    ),
  },
  {
    header: "Check-in Pertama",
    accessorKey: "first_checkin",
    cell: ({ row }) =>
      row.original.first_checkin
        ? dayjs(row.original.first_checkin).format("DD MMM YYYY HH:mm")
        : "-",
  },
  {
    header: "Check-in Terakhir",
    accessorKey: "last_checkin",
    cell: ({ row }) =>
      row.original.last_checkin
        ? dayjs(row.original.last_checkin).format("DD MMM YYYY HH:mm")
        : "-",
  },
]

const EmployeeAttendanceSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "attendance", params],
    queryFn: () => apiGetEmployeeAttendance(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []
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
          title="Persentase Kehadiran per Karyawan"
          description="Hari kerja dihitung dari seluruh hari kalender dalam rentang, bukan jadwal shift"
          config={percentConfig}
          loading={isLoading}
          empty={rows.length === 0}
          height="h-80"
        >
          <BarChart data={rows} layout="vertical">
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
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={percentTooltip(percentConfig, 1)}
                />
              }
            />
            <Bar
              dataKey="attendance_percent"
              fill={getSeriesColor(1)}
              radius={2}
            />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Tren Check-in Karyawan"
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
          height="h-80"
        >
          <LineChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="checkin_count"
              type="monotone"
              stroke="var(--primary)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Kehadiran per Karyawan"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default EmployeeAttendanceSection
