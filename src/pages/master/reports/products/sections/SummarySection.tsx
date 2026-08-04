import { useQuery } from "@tanstack/react-query"
import type { ProductRow } from "@/services/api/@types/report-products"
import { apiGetProductSummary } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
import { currencyTooltip } from "../../utils/tooltipFormatter"

const trendConfig = buildChartConfig([
  { key: "net", label: "Revenue Produk", color: "var(--primary)" },
])

const topConfig = buildChartConfig([{ key: "net", label: "Net Revenue" }])

const columns: DataTableColumnDef<ProductRow>[] = [
  { header: "Produk", accessorKey: "name", size: 220 },
  { header: "Qty Net", accessorKey: "qty_net" },
  {
    header: "Net Revenue",
    accessorKey: "net",
    cell: ({ row }) => currencyFormat(row.original.net),
  },
  {
    header: "HPP Estimasi",
    accessorKey: "hpp_estimate",
    cell: ({ row }) => currencyFormat(row.original.hpp_estimate),
  },
  {
    header: "Laba Kotor Estimasi",
    accessorKey: "gross_profit_estimate",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.gross_profit_estimate)}
      </span>
    ),
  },
  {
    header: "Margin",
    accessorKey: "margin_percent",
    cell: ({ row }) => `${row.original.margin_percent.toFixed(1)}%`,
  },
]

const ProductSummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportProducts, "summary", params],
    queryFn: () => apiGetProductSummary(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const topProducts = data?.top_products ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
        skeletonCount={7}
      />

      <ReportChartCard
        title="Tren Revenue Produk"
        config={trendConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-80"
      >
        <AreaChart data={series}>
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
              <ChartTooltipContent formatter={currencyTooltip(trendConfig)} />
            }
          />
          <Area
            dataKey="net"
            type="monotone"
            fill="var(--primary)"
            fillOpacity={0.2}
            stroke="var(--primary)"
          />
        </AreaChart>
      </ReportChartCard>

      <ReportChartCard
        title="Top 10 Produk by Revenue"
        config={topConfig}
        loading={isLoading}
        empty={topProducts.length === 0}
        height="h-96"
      >
        <BarChart data={topProducts} layout="vertical">
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
            width={150}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                formatter={currencyTooltip(topConfig)}
              />
            }
          />
          <Bar dataKey="net" fill={getSeriesColor(0)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Top Produk"
        description="Margin dihitung dari HPP produk saat ini, bukan HPP saat transaksi terjadi"
        columns={columns}
        data={topProducts}
        loading={isLoading}
      />
    </div>
  )
}

export default ProductSummarySection
