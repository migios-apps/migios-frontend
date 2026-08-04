import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  FinanceRecordRow,
  FinanceRekeningRow,
} from "@/services/api/@types/report-finance"
import { apiGetFinanceRekening } from "@/services/api/ReportService"
import {
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
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
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

const balanceConfig = buildChartConfig([
  { key: "current_balance", label: "Saldo Saat Ini" },
])

const rekeningColumns: DataTableColumnDef<FinanceRekeningRow>[] = [
  {
    header: "Rekening",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.number ? (
          <span className="text-muted-foreground text-xs">
            {row.original.number}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: "Total Masuk",
    accessorKey: "total_in",
    cell: ({ row }) => currencyFormat(row.original.total_in),
  },
  {
    header: "Total Keluar",
    accessorKey: "total_out",
    cell: ({ row }) => currencyFormat(row.original.total_out),
  },
  {
    header: "Mutasi Bersih",
    accessorKey: "net",
    cell: ({ row }) => (
      <span
        className={cn(
          "font-medium",
          row.original.net < 0
            ? "text-rose-600 dark:text-rose-400"
            : "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {currencyFormat(row.original.net)}
      </span>
    ),
  },
  {
    header: "Saldo Saat Ini",
    accessorKey: "current_balance",
    cell: ({ row }) => currencyFormat(row.original.current_balance),
  },
  {
    header: "Kontribusi",
    accessorKey: "share_percent",
    cell: ({ row }) => `${row.original.share_percent.toFixed(1)}%`,
  },
]

const recordColumns: DataTableColumnDef<FinanceRecordRow>[] = [
  {
    header: "Tanggal",
    accessorKey: "date",
    cell: ({ row }) => dayjs(row.original.date).format("DD MMM YYYY"),
  },
  {
    header: "Tipe",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.type === "income"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }
      >
        {row.original.type === "income" ? "Masuk" : "Keluar"}
      </Badge>
    ),
  },
  {
    header: "Rekening",
    accessorKey: "rekening_name",
    size: 160,
    cell: ({ row }) => row.original.rekening_name ?? "-",
  },
  {
    header: "Kategori",
    accessorKey: "category_name",
    size: 160,
    cell: ({ row }) => row.original.category_name ?? "-",
  },
  {
    header: "Deskripsi",
    accessorKey: "description",
    size: 240,
    cell: ({ row }) => row.original.description ?? "-",
  },
  {
    header: "Nominal",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
  },
]

const RekeningSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, "rekening", params],
    queryFn: () => apiGetFinanceRekening(params),
    select: (res) => res.data,
  })

  const rekening = useMemo(() => data?.rekening ?? [], [data?.rekening])

  const shareConfig = useMemo(
    () =>
      buildChartConfig(
        rekening.map((row) => ({
          key: `rekening-${row.rekening_id ?? "none"}`,
          label: row.name,
        }))
      ),
    [rekening]
  )

  const rekeningSlices = useMemo(
    () => toPieSlices(rekening, (row) => row.total_in),
    [rekening]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Saldo per Rekening"
          description="Saldo saat ini, bukan saldo pada akhir rentang laporan"
          config={balanceConfig}
          loading={isLoading}
          empty={rekening.length === 0}
        >
          <BarChart data={rekening}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={currencyTooltip(balanceConfig)}
                />
              }
            />
            <Bar dataKey="current_balance" radius={2}>
              {rekening.map((row, index) => (
                <Cell
                  key={`${row.rekening_id ?? index}`}
                  fill={getSeriesColor(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Share Penerimaan per Rekening"
          config={shareConfig}
          loading={isLoading}
          empty={rekeningSlices.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={currencyTooltip(shareConfig)}
                />
              }
            />
            <Pie
              data={rekeningSlices}
              dataKey="total_in"
              nameKey="name"
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

      <ReportTableCard
        title="Ringkasan per Rekening"
        columns={rekeningColumns}
        data={rekening}
        loading={isLoading}
      />

      <ReportTableCard
        title="Detail Mutasi"
        description="Seluruh catatan keuangan pada rentang ini"
        columns={recordColumns}
        data={data?.records ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default RekeningSection
