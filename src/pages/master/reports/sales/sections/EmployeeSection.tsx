import { useQuery } from "@tanstack/react-query"
import type { SalesEmployeeRow } from "@/services/api/@types/report-sales"
import {
  apiGetEmployeeSalesPerformance,
  apiGetSalesByEmployee,
} from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const chartConfig = buildChartConfig([{ key: "net", label: "Net Sales" }])

const columns: DataTableColumnDef<SalesEmployeeRow>[] = [
  {
    header: "Karyawan",
    accessorKey: "employee_name",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.employee_name}</span>
        {row.original.employee_code ? (
          <span className="text-muted-foreground text-xs">
            {row.original.employee_code}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: "Faktur",
    accessorKey: "invoice_count",
    cell: ({ row }) => row.original.invoice_count.toLocaleString("id-ID"),
  },
  {
    header: "Item Terjual",
    accessorKey: "item_count",
    cell: ({ row }) => row.original.item_count.toLocaleString("id-ID"),
  },
  {
    header: "Gross",
    accessorKey: "gross",
    cell: ({ row }) => currencyFormat(row.original.gross),
  },
  {
    header: "Diskon",
    accessorKey: "discount",
    cell: ({ row }) => currencyFormat(row.original.discount),
  },
  {
    header: "Net Sales",
    accessorKey: "net",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.net)}</span>
    ),
  },
  {
    header: "Rata-rata per Faktur",
    accessorKey: "avg_invoice",
    cell: ({ row }) => currencyFormat(row.original.avg_invoice),
  },
  {
    header: "Member Baru",
    accessorKey: "new_members",
    cell: ({ row }) => row.original.new_members.toLocaleString("id-ID"),
  },
]

interface EmployeeSectionProps {
  domain?: "sales" | "employee"
}

const EmployeeSection = ({ domain = "sales" }: EmployeeSectionProps) => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [
      domain === "employee" ? QUERY_KEY.reportEmployee : QUERY_KEY.reportSales,
      "by-employee",
      params,
    ],
    queryFn: () =>
      domain === "employee"
        ? apiGetEmployeeSalesPerformance(params)
        : apiGetSalesByEmployee(params),
    select: (res) => res.data,
  })

  const employees = data?.employees ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportChartCard
        title="Ranking Karyawan by Net Sales"
        config={chartConfig}
        loading={isLoading}
        empty={employees.length === 0}
        height="h-96"
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
            width={150}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="employee_name"
                formatter={(value) => currencyFormat(Number(value))}
              />
            }
          />
          <Bar dataKey="net" fill={getSeriesColor(0)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Kinerja per Karyawan"
        columns={columns}
        data={employees}
        loading={isLoading}
      />
    </div>
  )
}

export default EmployeeSection
