import { useQuery } from "@tanstack/react-query"
import type { ClassRow } from "@/services/api/@types/report-packages"
import { apiGetPackageClasses } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const occupancyConfig = buildChartConfig([
  { key: "occupancy_percent", label: "Okupansi (%)", color: "var(--chart-2)" },
])

const memberConfig = buildChartConfig([
  { key: "active_member", label: "Pendaftar Aktif" },
])

const columns: DataTableColumnDef<ClassRow>[] = [
  { header: "Kelas", accessorKey: "name", size: 200 },
  {
    header: "Kategori",
    accessorKey: "category_name",
    cell: ({ row }) => row.original.category_name ?? "-",
  },
  {
    header: "Instruktur",
    accessorKey: "instructor_names",
    size: 200,
    cell: ({ row }) => row.original.instructor_names ?? "-",
  },
  { header: "Kapasitas", accessorKey: "capacity" },
  { header: "Pendaftar Aktif", accessorKey: "active_member" },
  {
    header: "Okupansi",
    accessorKey: "occupancy_percent",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.occupancy_percent.toFixed(1)}%
      </span>
    ),
  },
  { header: "Sesi Terlaksana", accessorKey: "session_done" },
]

const ClassSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportPackages, "classes", params],
    queryFn: () => apiGetPackageClasses(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Okupansi per Kelas"
          description="Pendaftar aktif dibagi kapasitas kelas"
          config={occupancyConfig}
          loading={isLoading}
          empty={rows.length === 0}
        >
          <BarChart data={rows}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => `${Number(value).toFixed(1)}%`}
                />
              }
            />
            <Bar dataKey="occupancy_percent" fill="var(--chart-2)" radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Kelas Terpopuler"
          config={memberConfig}
          loading={isLoading}
          empty={rows.length === 0}
        >
          <BarChart data={rows.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Bar dataKey="active_member" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rincian Kelas"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default ClassSection
