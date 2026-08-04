import { useQuery } from "@tanstack/react-query"
import type { ProductRefundRow } from "@/services/api/@types/report-products"
import { apiGetProductRefund } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
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

const valueConfig = buildChartConfig([
  { key: "refund_value", label: "Nilai Refund", color: "var(--chart-4)" },
])

const columns: DataTableColumnDef<ProductRefundRow>[] = [
  { header: "Produk", accessorKey: "name", size: 240 },
  { header: "Qty Terjual", accessorKey: "qty_sold" },
  { header: "Qty Refund", accessorKey: "qty_returned" },
  {
    header: "Refund Rate",
    accessorKey: "refund_rate",
    cell: ({ row }) => `${row.original.refund_rate.toFixed(1)}%`,
  },
  {
    header: "Nilai Refund",
    accessorKey: "refund_value",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.refund_value)}
      </span>
    ),
  },
]

const RefundSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportProducts, "refund", params],
    queryFn: () => apiGetProductRefund(params),
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
          title="Produk Paling Banyak Di-refund"
          config={valueConfig}
          loading={isLoading}
          empty={rows.length === 0}
          height="h-80"
        >
          <BarChart data={rows.slice(0, 10)} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => currencyFormat(value)}
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
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar dataKey="refund_value" fill={getSeriesColor(3)} radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Tren Refund Produk"
          config={valueConfig}
          loading={isLoading}
          empty={series.length === 0}
          height="h-80"
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
              dataKey="refund_value"
              type="monotone"
              stroke="var(--chart-4)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Refund per Produk"
        description="Refund tidak mengembalikan stok, hanya void yang mengembalikan"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default RefundSection
