import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  FinanceCategoryRow,
  FinanceRecordRow,
} from "@/services/api/@types/report-finance"
import {
  apiGetFinanceExpense,
  apiGetFinanceIncome,
} from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { dayjs } from "@/utils/dayjs"
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

const categoryColumns: DataTableColumnDef<FinanceCategoryRow>[] = [
  { header: "Kategori", accessorKey: "name", size: 220 },
  {
    header: "Jumlah Catatan",
    accessorKey: "record_count",
    cell: ({ row }) => row.original.record_count.toLocaleString("id-ID"),
  },
  {
    header: "Nominal",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
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
    header: "Kategori",
    accessorKey: "category_name",
    size: 180,
    cell: ({ row }) => row.original.category_name ?? "-",
  },
  {
    header: "Rekening",
    accessorKey: "rekening_name",
    size: 160,
    cell: ({ row }) => row.original.rekening_name ?? "-",
  },
  {
    header: "Deskripsi",
    accessorKey: "description",
    size: 240,
    cell: ({ row }) => row.original.description ?? "-",
  },
  {
    header: "Faktur",
    accessorKey: "transaction_code",
    cell: ({ row }) => row.original.transaction_code ?? "-",
  },
  {
    header: "Karyawan",
    accessorKey: "employee_name",
    cell: ({ row }) => row.original.employee_name ?? "-",
  },
  {
    header: "Nominal",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
  },
]

interface LedgerSectionProps {
  type: "income" | "expense"
}

const LedgerSection = ({ type }: LedgerSectionProps) => {
  const params = useReportFilterParams()
  const label = type === "income" ? "Pemasukan" : "Pengeluaran"

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, type, params],
    queryFn: () =>
      type === "income"
        ? apiGetFinanceIncome(params)
        : apiGetFinanceExpense(params),
    select: (res) => res.data,
  })

  const categories = data?.categories ?? []
  const series = data?.series ?? []

  const trendConfig = useMemo(
    () =>
      buildChartConfig([
        {
          key: "amount",
          label,
          color:
            type === "income"
              ? "var(--chart-positive)"
              : "var(--chart-negative)",
        },
      ]),
    [label, type]
  )

  const categoryConfig = useMemo(
    () => buildChartConfig([{ key: "amount", label: `${label} per Kategori` }]),
    [label]
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
          title={`${label} per Kategori`}
          config={categoryConfig}
          loading={isLoading}
          empty={categories.length === 0}
          height="h-80"
        >
          <BarChart data={categories.slice(0, 10)} layout="vertical">
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
              width={140}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={currencyTooltip(categoryConfig)}
                />
              }
            />
            <Bar dataKey="amount" radius={2}>
              {categories.slice(0, 10).map((row, index) => (
                <Cell
                  key={`${row.category_id ?? index}`}
                  fill={getSeriesColor(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title={`Tren ${label}`}
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
          height="h-80"
        >
          <LineChart data={series}>
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
            <Line
              dataKey="amount"
              type="monotone"
              stroke={
                type === "income"
                  ? "var(--chart-positive)"
                  : "var(--chart-negative)"
              }
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title={`Rekap Kategori ${label}`}
        columns={categoryColumns}
        data={categories}
        loading={isLoading}
      />

      <ReportTableCard
        title={`Rincian ${label}`}
        description={
          type === "expense"
            ? "Nominal ditampilkan sebagai nilai absolut; di database tersimpan negatif"
            : undefined
        }
        columns={recordColumns}
        data={data?.records ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default LedgerSection
