import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { EmployeeSummaryRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeeSummary } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import {
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const TYPE_LABELS: Record<string, string> = {
  sales: "Sales",
  service: "Service",
  session: "Session",
  class: "Class",
}

const rankConfig = buildChartConfig([
  { key: "total_commission", label: "Total Komisi" },
])

const trendConfig = buildChartConfig([
  { key: "amount", label: "Komisi", color: "var(--primary)" },
])

const columns: DataTableColumnDef<EmployeeSummaryRow>[] = [
  { header: "Karyawan", accessorKey: "employee_name", size: 200 },
  {
    header: "Komisi Sales",
    accessorKey: "by_type",
    cell: ({ row }) => currencyFormat(row.original.by_type.sales ?? 0),
  },
  {
    header: "Komisi Service",
    id: "service",
    cell: ({ row }) => currencyFormat(row.original.by_type.service ?? 0),
  },
  {
    header: "Komisi Session",
    id: "session",
    cell: ({ row }) => currencyFormat(row.original.by_type.session ?? 0),
  },
  {
    header: "Komisi Class",
    id: "class",
    cell: ({ row }) => currencyFormat(row.original.by_type.class ?? 0),
  },
  {
    header: "Total Komisi",
    accessorKey: "total_commission",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.total_commission)}
      </span>
    ),
  },
]

const EmployeeSummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "summary", params],
    queryFn: () => apiGetEmployeeSummary(params),
    select: (res) => res.data,
  })

  const employees = data?.employees ?? []
  const byType = useMemo(
    () =>
      (data?.by_type ?? []).map((row) => ({
        ...row,
        label: TYPE_LABELS[row.type] ?? row.type,
      })),
    [data?.by_type]
  )
  const series = data?.series ?? []

  const typeConfig = useMemo(
    () =>
      buildChartConfig(
        byType.map((row) => ({ key: row.type, label: row.label }))
      ),
    [byType]
  )

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
          title="Ranking Komisi per Karyawan"
          config={rankConfig}
          loading={isLoading}
          empty={employees.length === 0}
          height="h-80"
        >
          <BarChart data={employees.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <YAxis
              type="category"
              dataKey="employee_name"
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="employee_name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar
              dataKey="total_commission"
              fill={getSeriesColor(0)}
              radius={2}
            />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Komposisi Komisi per Tipe"
          config={typeConfig}
          loading={isLoading}
          empty={byType.every((row) => row.amount === 0)}
          height="h-80"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="label"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Pie
              data={byType}
              dataKey="amount"
              nameKey="label"
              innerRadius={50}
            >
              {byType.map((row, index) => (
                <Cell key={row.type} fill={getSeriesColor(index)} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>
      </div>

      <ReportChartCard
        title="Tren Komisi"
        config={trendConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-72"
      >
        <LineChart data={series}>
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
          <Line
            dataKey="amount"
            type="monotone"
            stroke="var(--primary)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ReportChartCard>

      <ReportTableCard
        title="Komisi per Karyawan"
        columns={columns}
        data={employees}
        loading={isLoading}
      />
    </div>
  )
}

export default EmployeeSummarySection
