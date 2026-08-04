import { useQuery } from "@tanstack/react-query"
import type { EmployeeCommissionItemRow } from "@/services/api/@types/report-employee"
import { apiGetEmployeeCommissionItem } from "@/services/api/ReportService"
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

const chartConfig = buildChartConfig([
  { key: "total_commission", label: "Total Komisi" },
])

const columns: DataTableColumnDef<EmployeeCommissionItemRow>[] = [
  { header: "Item", accessorKey: "item_name", size: 240 },
  { header: "Qty", accessorKey: "qty" },
  {
    header: "Dasar Komisi",
    accessorKey: "base_amount",
    cell: ({ row }) => currencyFormat(row.original.base_amount),
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
  { header: "Karyawan Terlibat", accessorKey: "employee_count" },
]

const CommissionItemSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportEmployee, "commission-item", params],
    queryFn: () => apiGetEmployeeCommissionItem(params),
    select: (res) => res.data,
  })

  const packages = data?.packages ?? []
  const products = data?.products ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Top Paket Penghasil Komisi"
          config={chartConfig}
          loading={isLoading}
          empty={packages.length === 0}
          height="h-80"
        >
          <BarChart data={packages.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <YAxis
              type="category"
              dataKey="item_name"
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="item_name"
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
          title="Top Produk Penghasil Komisi"
          config={chartConfig}
          loading={isLoading}
          empty={products.length === 0}
          height="h-80"
        >
          <BarChart data={products.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <YAxis
              type="category"
              dataKey="item_name"
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="item_name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar
              dataKey="total_commission"
              fill={getSeriesColor(1)}
              radius={2}
            />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Komisi per Paket"
        columns={columns}
        data={packages}
        loading={isLoading}
      />

      <ReportTableCard
        title="Komisi per Produk"
        columns={columns}
        data={products}
        loading={isLoading}
      />
    </div>
  )
}

export default CommissionItemSection
