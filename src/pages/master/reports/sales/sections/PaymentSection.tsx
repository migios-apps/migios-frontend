import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  SalesAgingRow,
  SalesOutstandingRow,
  SalesRekeningRow,
} from "@/services/api/@types/report-sales"
import { apiGetSalesPayment } from "@/services/api/ReportService"
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

const cashConfig = buildChartConfig([
  { key: "amount", label: "Penerimaan", color: "var(--primary)" },
])

const agingConfig = buildChartConfig([
  { key: "outstanding", label: "Outstanding", color: "var(--chart-negative)" },
])

const AGING_TONE: Record<string, string> = {
  "0-7": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "8-30": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "31-60": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "61-90": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ">90": "bg-red-500/15 text-red-600 dark:text-red-400",
}

const rekeningColumns: DataTableColumnDef<SalesRekeningRow>[] = [
  { header: "Rekening", accessorKey: "rekening_name", size: 200 },
  {
    header: "Jumlah Pembayaran",
    accessorKey: "payment_count",
    cell: ({ row }) => row.original.payment_count.toLocaleString("id-ID"),
  },
  {
    header: "Masuk",
    accessorKey: "total_in",
    cell: ({ row }) => currencyFormat(row.original.total_in),
  },
  {
    header: "Refund Keluar",
    accessorKey: "total_out",
    cell: ({ row }) => currencyFormat(Math.abs(row.original.total_out)),
  },
  {
    header: "Net",
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

const outstandingColumns: DataTableColumnDef<SalesOutstandingRow>[] = [
  { header: "Faktur", accessorKey: "code", size: 140 },
  {
    header: "Member",
    accessorKey: "member_name",
    size: 180,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Tanggal",
    accessorKey: "created_at",
    cell: ({ row }) => dayjs(row.original.created_at).format("DD MMM YYYY"),
  },
  {
    header: "Jatuh Tempo",
    accessorKey: "due_date",
    cell: ({ row }) =>
      row.original.due_date
        ? dayjs(row.original.due_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Total",
    accessorKey: "total_amount",
    cell: ({ row }) => currencyFormat(row.original.total_amount),
  },
  {
    header: "Terbayar",
    accessorKey: "paid_amount",
    cell: ({ row }) => currencyFormat(row.original.paid_amount),
  },
  {
    header: "Sisa",
    accessorKey: "outstanding",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.outstanding)}
      </span>
    ),
  },
  {
    header: "Umur",
    accessorKey: "age_days",
    cell: ({ row }) => `${row.original.age_days} hari`,
  },
  {
    header: "Aging",
    accessorKey: "aging_bucket",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={AGING_TONE[row.original.aging_bucket] ?? ""}
      >
        {row.original.aging_bucket}
      </Badge>
    ),
  },
]

const PaymentSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "payment", params],
    queryFn: () => apiGetSalesPayment(params),
    select: (res) => res.data,
  })

  const rekening = useMemo(() => data?.rekening ?? [], [data?.rekening])
  const aging: SalesAgingRow[] = data?.aging ?? []
  const series = data?.series ?? []

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

  const rekeningSlices = useMemo(
    () => toPieSlices(rekening, (row) => row.total_in),
    [rekening]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <ReportChartCard
        title="Tren Penerimaan Kas"
        description="Total pembayaran masuk per periode"
        config={cashConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-72"
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
              <ChartTooltipContent formatter={currencyTooltip(cashConfig)} />
            }
          />
          <Area
            dataKey="amount"
            type="monotone"
            fill="var(--primary)"
            fillOpacity={0.2}
            stroke="var(--primary)"
          />
        </AreaChart>
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Share Penerimaan per Rekening"
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

        <ReportChartCard
          title="Aging Piutang"
          description="Sisa tagihan berdasarkan umur faktur"
          config={agingConfig}
          loading={isLoading}
          empty={aging.every((row) => row.outstanding === 0)}
        >
          <BarChart data={aging}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="bucket"
                  formatter={currencyTooltip(agingConfig)}
                />
              }
            />
            <Bar dataKey="outstanding" fill={getSeriesColor(3)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Penerimaan per Rekening"
        columns={rekeningColumns}
        data={rekening}
        loading={isLoading}
      />

      <ReportTableCard
        title="Faktur Outstanding"
        description="Faktur belum lunas beserta umur piutangnya"
        columns={outstandingColumns}
        data={data?.outstanding ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default PaymentSection
