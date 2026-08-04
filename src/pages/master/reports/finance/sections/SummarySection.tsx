import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { FinanceCategoryRow } from "@/services/api/@types/report-finance"
import { apiGetFinanceSummary } from "@/services/api/ReportService"
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

const flowConfig = buildChartConfig([
  { key: "cash_in", label: "Pemasukan", color: "var(--chart-2)" },
  { key: "cash_out", label: "Pengeluaran", color: "var(--chart-4)" },
])

const balanceConfig = buildChartConfig([
  { key: "cumulative", label: "Saldo Kumulatif", color: "var(--primary)" },
])

const categoryColumns: DataTableColumnDef<FinanceCategoryRow>[] = [
  { header: "Kategori", accessorKey: "name", size: 220 },
  {
    header: "Tipe",
    accessorKey: "type",
    cell: ({ row }) =>
      row.original.type === "income" ? "Pemasukan" : "Pengeluaran",
  },
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

const FinanceSummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, "summary", params],
    queryFn: () => apiGetFinanceSummary(params),
    select: (res) => res.data,
  })

  const series = useMemo(() => data?.series ?? [], [data?.series])
  const incomeCategories = useMemo(
    () => data?.income_categories ?? [],
    [data?.income_categories]
  )
  const expenseCategories = useMemo(
    () => data?.expense_categories ?? [],
    [data?.expense_categories]
  )

  const runningBalance = useMemo(() => {
    let cumulative = 0
    return series.map((point) => {
      cumulative += Number(point.cash_in) - Number(point.cash_out)
      return { ...point, cumulative }
    })
  }, [series])

  const incomeConfig = useMemo(
    () =>
      buildChartConfig(
        incomeCategories.map((row) => ({
          key: `income-${row.category_id ?? "none"}`,
          label: row.name,
        }))
      ),
    [incomeCategories]
  )

  const expenseConfig = useMemo(
    () =>
      buildChartConfig(
        expenseCategories.map((row) => ({
          key: `expense-${row.category_id ?? "none"}`,
          label: row.name,
        }))
      ),
    [expenseCategories]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis, data?.compare_period_label)}
        columns={4}
        loading={isLoading}
        skeletonCount={8}
      />

      <ReportChartCard
        title="Pemasukan vs Pengeluaran"
        description="Perbandingan arus masuk dan keluar per periode"
        config={flowConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-80"
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
          <ChartLegend />
          <Bar dataKey="cash_in" fill="var(--chart-2)" radius={2} />
          <Bar dataKey="cash_out" fill="var(--chart-4)" radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportChartCard
        title="Saldo Kumulatif Berjalan"
        description="Akumulasi arus kas bersih sepanjang periode"
        config={balanceConfig}
        loading={isLoading}
        empty={runningBalance.length === 0}
        height="h-72"
      >
        <AreaChart data={runningBalance}>
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
            dataKey="cumulative"
            type="monotone"
            fill="var(--primary)"
            fillOpacity={0.2}
            stroke="var(--primary)"
          />
        </AreaChart>
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Komposisi Pemasukan"
          config={incomeConfig}
          loading={isLoading}
          empty={incomeCategories.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Pie
              data={incomeCategories}
              dataKey="amount"
              nameKey="name"
              innerRadius={50}
            >
              {incomeCategories.map((row, index) => (
                <Cell
                  key={`${row.category_id ?? "none"}`}
                  fill={getSeriesColor(index)}
                />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

        <ReportChartCard
          title="Komposisi Pengeluaran"
          config={expenseConfig}
          loading={isLoading}
          empty={expenseCategories.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Pie
              data={expenseCategories}
              dataKey="amount"
              nameKey="name"
              innerRadius={50}
            >
              {expenseCategories.map((row, index) => (
                <Cell
                  key={`${row.category_id ?? "none"}`}
                  fill={getSeriesColor(index + 2)}
                />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rekap per Kategori"
        columns={categoryColumns}
        data={[...incomeCategories, ...expenseCategories]}
        loading={isLoading}
      />
    </div>
  )
}

export default FinanceSummarySection
