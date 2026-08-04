import { useQuery } from "@tanstack/react-query"
import type { EmployeePayrollRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeePayroll } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { buildChartConfig } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const chartConfig = buildChartConfig([
  { key: "base_salary", label: "Gaji Pokok", color: "var(--primary)" },
  { key: "commission_sales", label: "Komisi Sales", color: "var(--chart-2)" },
  {
    key: "commission_service",
    label: "Komisi Service",
    color: "var(--chart-3)",
  },
  {
    key: "commission_session",
    label: "Komisi Session",
    color: "var(--chart-4)",
  },
  { key: "commission_class", label: "Komisi Class", color: "var(--chart-5)" },
])

const columns: DataTableColumnDef<EmployeePayrollRow>[] = [
  { header: "Karyawan", accessorKey: "name", size: 200 },
  {
    header: "Gaji Pokok",
    accessorKey: "base_salary",
    cell: ({ row }) => currencyFormat(row.original.base_salary),
  },
  {
    header: "Komisi Sales",
    accessorKey: "commission_sales",
    cell: ({ row }) => currencyFormat(row.original.commission_sales),
  },
  {
    header: "Komisi Service",
    accessorKey: "commission_service",
    cell: ({ row }) => currencyFormat(row.original.commission_service),
  },
  {
    header: "Komisi Session",
    accessorKey: "commission_session",
    cell: ({ row }) => currencyFormat(row.original.commission_session),
  },
  {
    header: "Komisi Class",
    accessorKey: "commission_class",
    cell: ({ row }) => currencyFormat(row.original.commission_class),
  },
  {
    header: "Total Estimasi",
    accessorKey: "total_estimate",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.total_estimate)}
      </span>
    ),
  },
]

const PayrollSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "payroll", params],
    queryFn: () => apiGetEmployeePayroll(params),
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

      <ReportChartCard
        title="Komposisi Payroll per Karyawan"
        description="Gaji pokok bersifat tetap; komisi mengikuti rentang laporan"
        config={chartConfig}
        loading={isLoading}
        empty={rows.length === 0}
        height="h-96"
      >
        <BarChart data={rows}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
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
          <Bar dataKey="base_salary" stackId="p" fill="var(--primary)" />
          <Bar dataKey="commission_sales" stackId="p" fill="var(--chart-2)" />
          <Bar dataKey="commission_service" stackId="p" fill="var(--chart-3)" />
          <Bar dataKey="commission_session" stackId="p" fill="var(--chart-4)" />
          <Bar
            dataKey="commission_class"
            stackId="p"
            fill="var(--chart-5)"
            radius={2}
          />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Estimasi Payroll"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default PayrollSection
