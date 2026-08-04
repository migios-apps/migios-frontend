import { useQuery } from "@tanstack/react-query"
import type { PackageRow } from "@/services/api/@types/report-packages"
import { apiGetPackageByPackage } from "@/services/api/ReportService"
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

const TYPE_LABELS: Record<string, string> = {
  membership: "Membership",
  pt_program: "PT Program",
  class: "Kelas",
}

const chartConfig = buildChartConfig([{ key: "net", label: "Net Revenue" }])

const columns: DataTableColumnDef<PackageRow>[] = [
  {
    header: "Paket",
    accessorKey: "name",
    size: 220,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.name}</span>
        {row.original.is_promo ? <Badge variant="outline">Promo</Badge> : null}
      </div>
    ),
  },
  {
    header: "Tipe",
    accessorKey: "package_type",
    cell: ({ row }) =>
      TYPE_LABELS[row.original.package_type] ?? row.original.package_type,
  },
  { header: "Durasi", accessorKey: "duration" },
  { header: "Sesi", accessorKey: "session_duration" },
  {
    header: "Harga List",
    accessorKey: "list_price",
    cell: ({ row }) => currencyFormat(row.original.list_price),
  },
  {
    header: "Harga Realisasi",
    accessorKey: "avg_price",
    cell: ({ row }) => currencyFormat(row.original.avg_price),
  },
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

const PackageBreakdownSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportPackages, "by-package", params],
    queryFn: () => apiGetPackageByPackage(params),
    select: (res) => res.data,
  })

  const packages = data?.packages ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportChartCard
        title="Top 10 Paket by Net Revenue"
        config={chartConfig}
        loading={isLoading}
        empty={packages.length === 0}
        height="h-96"
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
          <Bar dataKey="net" fill={getSeriesColor(0)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Rincian per Paket"
        columns={columns}
        data={packages}
        loading={isLoading}
      />
    </div>
  )
}

export default PackageBreakdownSection
