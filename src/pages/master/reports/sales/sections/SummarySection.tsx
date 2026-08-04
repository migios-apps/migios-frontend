import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  SalesCategoryRow,
  SalesRecapRow,
  SalesRekeningRow,
} from "@/services/api/@types/report-sales"
import { apiGetSalesSummary } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
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
import {
  buildChartConfig,
  getSeriesColor,
  toPieSlices,
} from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"
import { pieCurrencyLabel } from "../../utils/pieLabel"
import { currencyTooltip } from "../../utils/tooltipFormatter"

const trendConfig = buildChartConfig([
  { key: "net", label: "Net Sales", color: "var(--primary)" },
])

const compositionConfig = buildChartConfig([
  { key: "gross", label: "Gross" },
  { key: "discount", label: "Diskon" },
  { key: "tax", label: "Pajak" },
  { key: "net", label: "Net" },
])

const columns: DataTableColumnDef<SalesCategoryRow>[] = [
  { header: "Kategori", accessorKey: "label" },
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

const TOTAL_ROWS = new Set([
  "Gross Total Sales",
  "Net Total Sales",
  "Total Discount In Sales",
  "Total Rounding In Sales",
  "Total Sales Outstanding",
])

const recapColumns: DataTableColumnDef<SalesRecapRow>[] = [
  {
    header: "Item",
    accessorKey: "item_name",
    size: 240,
    cell: ({ row }) => (
      <span
        className={cn(
          TOTAL_ROWS.has(row.original.item_name) && "font-semibold"
        )}
      >
        {row.original.item_name}
      </span>
    ),
  },
  {
    header: "Total Sales",
    accessorKey: "total_sales",
    cell: ({ row }) =>
      row.original.total_sales === null
        ? "-"
        : row.original.total_sales.toLocaleString("id-ID"),
  },
  {
    header: "Total Returns",
    accessorKey: "total_returns",
    cell: ({ row }) =>
      row.original.total_returns === null
        ? "-"
        : row.original.total_returns.toLocaleString("id-ID"),
  },
  {
    header: "Gross Revenue",
    accessorKey: "gross_revenue",
    cell: ({ row }) => (
      <span
        className={cn(
          TOTAL_ROWS.has(row.original.item_name) && "font-semibold"
        )}
      >
        {row.original.fgross_revenue ??
          currencyFormat(row.original.gross_revenue ?? 0)}
      </span>
    ),
  },
]

const SummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "summary", params],
    queryFn: () => apiGetSalesSummary(params),
    select: (res) => res.data,
  })

  const rekening = useMemo<SalesRekeningRow[]>(
    () => data?.rekening ?? [],
    [data?.rekening]
  )

  const rekeningConfig = useMemo(
    () =>
      buildChartConfig(
        rekening.map((row) => ({
          key: `rekening-${row.rekening_id ?? "none"}`,
          label: row.rekening_name,
        }))
      ),
    [rekening]
  )

  const categoryConfig = useMemo(
    () =>
      buildChartConfig(
        (data?.categories ?? []).map((row) => ({
          key: row.category,
          label: row.label,
        }))
      ),
    [data?.categories]
  )

  const kpis = toKpiCards(data?.kpis, data?.compare_period_label)
  const series = data?.series ?? []
  const categories = useMemo(() => data?.categories ?? [], [data?.categories])

  const categorySlices = useMemo(
    () => toPieSlices(categories, (row) => row.net),
    [categories]
  )

  const rekeningSlices = useMemo(
    () => toPieSlices(rekening, (row) => row.total_in),
    [rekening]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={kpis}
        columns={4}
        loading={isLoading}
        skeletonCount={8}
      />

      <ReportChartCard
        title="Tren Net Sales"
        description="Penjualan bersih per periode"
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Komposisi Revenue per Kategori"
          config={categoryConfig}
          loading={isLoading}
          empty={categorySlices.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="label"
                  formatter={currencyTooltip(categoryConfig)}
                />
              }
            />
            <Pie
              data={categorySlices}
              dataKey="net"
              nameKey="label"
              innerRadius={50}
              outerRadius={80}
              label={pieCurrencyLabel}
            >
              {categorySlices.map((row) => (
                <Cell key={row.category} fill={row.sliceColor} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

        <ReportChartCard
          title="Pembayaran per Rekening"
          description="Total penerimaan masuk, belum dikurangi refund"
          config={rekeningConfig}
          loading={isLoading}
          empty={rekeningSlices.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="rekening_name"
                  formatter={currencyTooltip(rekeningConfig)}
                />
              }
            />
            <Pie
              data={rekeningSlices}
              dataKey="total_in"
              nameKey="rekening_name"
              innerRadius={50}
              outerRadius={80}
              label={pieCurrencyLabel}
            >
              {rekeningSlices.map((row) => (
                <Cell
                  key={`${row.rekening_id ?? row.sliceColor}`}
                  fill={row.sliceColor}
                />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>
      </div>

      <ReportChartCard
        title="Gross, Diskon, Pajak, dan Net"
        config={compositionConfig}
        loading={isLoading}
        empty={series.length === 0}
      >
        <BarChart data={series}>
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
                formatter={currencyTooltip(compositionConfig)}
              />
            }
          />
          <Bar dataKey="gross" fill={getSeriesColor(0)} radius={2} />
          <Bar dataKey="discount" fill={getSeriesColor(1)} radius={2} />
          <Bar dataKey="tax" fill={getSeriesColor(2)} radius={2} />
          <Bar dataKey="net" fill={getSeriesColor(3)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Rekap per Kategori"
        columns={columns}
        data={categories}
        loading={isLoading}
      />

      <ReportTableCard
        title="Rekap Penjualan"
        description=""
        columns={recapColumns}
        data={data?.recap ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default SummarySection
