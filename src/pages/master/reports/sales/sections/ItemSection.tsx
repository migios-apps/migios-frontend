import { useQuery } from "@tanstack/react-query"
import type { SalesItemRow } from "@/services/api/@types/report-sales"
import { apiGetSalesByItem } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const ITEM_TYPE_LABELS: Record<string, string> = {
  package: "Paket",
  product: "Produk",
  service: "Layanan",
  freeze: "Freeze",
}

const revenueConfig = buildChartConfig([{ key: "net", label: "Net Revenue" }])

const quantityConfig = buildChartConfig([
  { key: "qty_net", label: "Qty Net", color: "var(--chart-2)" },
])

const columns: DataTableColumnDef<SalesItemRow>[] = [
  {
    header: "Tipe",
    accessorKey: "item_type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {ITEM_TYPE_LABELS[row.original.item_type] ?? row.original.item_type}
      </Badge>
    ),
  },
  { header: "Nama Item", accessorKey: "item_name", size: 240 },
  {
    header: "Qty Terjual",
    accessorKey: "qty_sold",
    cell: ({ row }) => row.original.qty_sold.toLocaleString("id-ID"),
  },
  {
    header: "Qty Retur",
    accessorKey: "qty_returned",
    cell: ({ row }) => row.original.qty_returned.toLocaleString("id-ID"),
  },
  {
    header: "Qty Net",
    accessorKey: "qty_net",
    cell: ({ row }) => row.original.qty_net.toLocaleString("id-ID"),
  },
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
    header: "Pajak",
    accessorKey: "tax",
    cell: ({ row }) => currencyFormat(row.original.tax),
  },
  {
    header: "Net Revenue",
    accessorKey: "net",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.net)}</span>
    ),
  },
  {
    header: "Kontribusi",
    accessorKey: "share_percent",
    cell: ({ row }) => `${row.original.share_percent.toFixed(1)}%`,
  },
]

const ItemSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "by-item", params],
    queryFn: () => apiGetSalesByItem(params),
    select: (res) => res.data,
  })

  const topByRevenue = data?.top_by_revenue ?? []
  const topByQuantity = data?.top_by_quantity ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Top 10 Item by Net Revenue"
          config={revenueConfig}
          loading={isLoading}
          empty={topByRevenue.length === 0}
          height="h-96"
        >
          <BarChart data={topByRevenue} layout="vertical">
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
              width={130}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="item_name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar dataKey="net" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Top 10 Item by Qty"
          config={quantityConfig}
          loading={isLoading}
          empty={topByQuantity.length === 0}
          height="h-96"
        >
          <BarChart data={topByQuantity} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="item_name"
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="item_name" />}
            />
            <Bar dataKey="qty_net" fill={getSeriesColor(1)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rincian per Item"
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default ItemSection
