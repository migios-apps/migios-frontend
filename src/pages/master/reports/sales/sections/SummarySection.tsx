import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { SalesCategoryRow } from "@/services/api/@types/report-sales"
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

const SummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "summary", params],
    queryFn: () => apiGetSalesSummary(params),
    select: (res) => res.data,
  })

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
  const categories = data?.categories ?? []

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
              <ChartTooltipContent
                formatter={(value) => currencyFormat(Number(value))}
              />
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
          empty={categories.length === 0}
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
              data={categories}
              dataKey="net"
              nameKey="label"
              innerRadius={50}
            >
              {categories.map((row, index) => (
                <Cell key={row.category} fill={getSeriesColor(index)} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

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
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Bar dataKey="gross" fill={getSeriesColor(0)} radius={2} />
            <Bar dataKey="discount" fill={getSeriesColor(1)} radius={2} />
            <Bar dataKey="tax" fill={getSeriesColor(2)} radius={2} />
            <Bar dataKey="net" fill={getSeriesColor(3)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rekap per Kategori"
        columns={columns}
        data={categories}
        loading={isLoading}
      />
    </div>
  )
}

export default SummarySection
