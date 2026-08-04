import { useQuery } from "@tanstack/react-query"
import type { ProductStockRow } from "@/services/api/@types/report-products"
import { apiGetProductStock } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  { key: "stock_value", label: "Nilai Stok" },
])

const columns: DataTableColumnDef<ProductStockRow>[] = [
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
  {
    header: "Stok Saat Ini",
    accessorKey: "quantity",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-medium",
          row.original.quantity <= 0
            ? "text-rose-600 dark:text-rose-400"
            : row.original.quantity <= 5
              ? "text-amber-600 dark:text-amber-400"
              : ""
        )}
      >
        {row.original.quantity}
      </span>
    ),
  },
  {
    header: "Harga",
    accessorKey: "price",
    cell: ({ row }) => currencyFormat(row.original.price),
  },
  {
    header: "HPP",
    accessorKey: "hpp",
    cell: ({ row }) => currencyFormat(row.original.hpp),
  },
  {
    header: "Nilai Stok",
    accessorKey: "stock_value",
    cell: ({ row }) => currencyFormat(row.original.stock_value),
  },
  { header: "Terjual Periode Ini", accessorKey: "sold_qty" },
  {
    header: "Rata-rata Harian",
    accessorKey: "daily_average",
    cell: ({ row }) => row.original.daily_average.toFixed(2),
  },
  {
    header: "Estimasi Hari Habis",
    accessorKey: "days_to_stockout",
    cell: ({ row }) =>
      row.original.days_to_stockout === null
        ? "-"
        : `${row.original.days_to_stockout} hari`,
  },
]

const StockSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportProducts, "stock", params],
    queryFn: () => apiGetProductStock(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []
  const topValue = [...rows]
    .sort((a, b) => b.stock_value - a.stock_value)
    .slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <AlertTitle>Stok adalah posisi saat ini, bukan riwayat</AlertTitle>
        <AlertDescription>
          Database tidak menyimpan pergerakan stok, hanya penghitung yang
          berjalan. Angka di sini tidak mengikuti rentang tanggal laporan dan
          bisa menyimpang pada produk yang pernah di-refund.
        </AlertDescription>
      </Alert>

      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={5}
        loading={isLoading}
        skeletonCount={5}
      />

      <ReportChartCard
        title="Nilai Stok Tertinggi"
        description="Kuantitas dikali HPP"
        config={valueConfig}
        loading={isLoading}
        empty={rows.length === 0}
        height="h-96"
      >
        <BarChart data={topValue} layout="vertical">
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
                formatter={(value) => currencyFormat(Number(value))}
              />
            }
          />
          <Bar dataKey="stock_value" radius={2}>
            {topValue.map((row, index) => (
              <Cell key={row.product_id} fill={getSeriesColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Posisi Stok Saat Ini"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default StockSection
