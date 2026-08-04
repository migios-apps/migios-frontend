import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { PackageTypeRow } from "@/services/api/@types/report-packages"
import { apiGetPackageSummary } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
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
  { key: "net", label: "Revenue Paket", color: "var(--primary)" },
])

const columns: DataTableColumnDef<PackageTypeRow>[] = [
  { header: "Tipe Paket", accessorKey: "label", size: 180 },
  {
    header: "Qty Terjual",
    accessorKey: "qty_sold",
    cell: ({ row }) => row.original.qty_sold.toLocaleString("id-ID"),
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
    header: "Kontribusi",
    accessorKey: "share_percent",
    cell: ({ row }) => `${row.original.share_percent.toFixed(1)}%`,
  },
]

const PackageSummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportPackages, "summary", params],
    queryFn: () => apiGetPackageSummary(params),
    select: (res) => res.data,
  })

  const types = useMemo(() => data?.types ?? [], [data?.types])
  const series = data?.series ?? []

  const typeConfig = useMemo(
    () =>
      buildChartConfig(
        types.map((row) => ({ key: row.package_type, label: row.label }))
      ),
    [types]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
        skeletonCount={7}
      />

      <ReportChartCard
        title="Tren Penjualan Paket"
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

      <ReportChartCard
        title="Revenue per Tipe Paket"
        config={typeConfig}
        loading={isLoading}
        empty={types.length === 0}
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
          <Pie data={types} dataKey="net" nameKey="label" innerRadius={50}>
            {types.map((row, index) => (
              <Cell key={row.package_type} fill={getSeriesColor(index)} />
            ))}
          </Pie>
          <ChartLegend />
        </PieChart>
      </ReportChartCard>

      <ReportTableCard
        title="Rekap per Tipe Paket"
        columns={columns}
        data={types}
        loading={isLoading}
      />
    </div>
  )
}

export default PackageSummarySection
