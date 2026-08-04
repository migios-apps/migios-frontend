import { useQuery } from "@tanstack/react-query"
import type { ProductRow } from "@/services/api/@types/report-products"
import { apiGetProductByProduct } from "@/services/api/ReportService"
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
import { percentTooltip } from "../../utils/tooltipFormatter"

const marginConfig = buildChartConfig([
  { key: "margin_percent", label: "Margin (%)", color: "var(--chart-cat-2)" },
])

const columns: DataTableColumnDef<ProductRow>[] = [
  {
    header: "Produk",
    accessorKey: "name",
    size: 220,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.sku ? (
          <span className="text-muted-foreground text-xs">
            {row.original.sku}
          </span>
        ) : null}
      </div>
    ),
  },
  { header: "Qty Terjual", accessorKey: "qty_sold" },
  { header: "Qty Retur", accessorKey: "qty_returned" },
  { header: "Qty Net", accessorKey: "qty_net" },
  {
    header: "Harga Rata-rata",
    accessorKey: "avg_price",
    cell: ({ row }) => currencyFormat(row.original.avg_price),
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
    header: "Net Revenue",
    accessorKey: "net",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.net)}</span>
    ),
  },
  {
    header: "HPP Est",
    accessorKey: "hpp_estimate",
    cell: ({ row }) => currencyFormat(row.original.hpp_estimate),
  },
  {
    header: "Laba Kotor Est",
    accessorKey: "gross_profit_estimate",
    cell: ({ row }) => currencyFormat(row.original.gross_profit_estimate),
  },
  {
    header: "Margin",
    accessorKey: "margin_percent",
    cell: ({ row }) => `${row.original.margin_percent.toFixed(1)}%`,
  },
  {
    header: "Kontribusi",
    accessorKey: "share_percent",
    cell: ({ row }) => `${row.original.share_percent.toFixed(1)}%`,
  },
]

const ProductBreakdownSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportProducts, "by-product", params],
    queryFn: () => apiGetProductByProduct(params),
    select: (res) => res.data,
  })

  const products = data?.products ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportChartCard
        title="Margin per Produk"
        description="Estimasi, memakai HPP produk saat ini"
        config={marginConfig}
        loading={isLoading}
        empty={products.length === 0}
        height="h-96"
      >
        <BarChart data={products.slice(0, 15)} layout="vertical">
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
            width={150}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                formatter={percentTooltip(marginConfig, 1)}
              />
            }
          />
          <Bar dataKey="margin_percent" fill={getSeriesColor(1)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Rincian per Produk"
        columns={columns}
        data={products}
        loading={isLoading}
      />
    </div>
  )
}

export default ProductBreakdownSection
