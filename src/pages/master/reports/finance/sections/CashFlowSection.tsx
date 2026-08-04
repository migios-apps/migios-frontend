import { useQuery } from "@tanstack/react-query"
import type { FinanceCashFlowRow } from "@/services/api/@types/report-finance"
import { apiGetFinanceCashFlow } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import { currencyFormat } from "@/components/ui/input-currency"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const netConfig = buildChartConfig([{ key: "net", label: "Arus Kas Bersih" }])

const cumulativeConfig = buildChartConfig([
  {
    key: "cumulative",
    label: "Saldo Akhir Kumulatif",
    color: "var(--primary)",
  },
])

const columns: DataTableColumnDef<FinanceCashFlowRow>[] = [
  { header: "Periode", accessorKey: "label", size: 140 },
  {
    header: "Kas Masuk",
    accessorKey: "cash_in",
    cell: ({ row }) => currencyFormat(row.original.cash_in),
  },
  {
    header: "Kas Keluar",
    accessorKey: "cash_out",
    cell: ({ row }) => currencyFormat(row.original.cash_out),
  },
  {
    header: "Arus Bersih",
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
    header: "Saldo Akhir Kumulatif",
    accessorKey: "cumulative",
    cell: ({ row }) => currencyFormat(row.original.cumulative),
  },
]

const CashFlowSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, "cash-flow", params],
    queryFn: () => apiGetFinanceCashFlow(params),
    select: (res) => res.data,
  })

  const rows = data?.rows ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={4}
        loading={isLoading}
      />

      <ReportChartCard
        title="Arus Kas Bersih per Periode"
        description="Batang merah menandakan periode dengan arus kas negatif"
        config={netConfig}
        loading={isLoading}
        empty={rows.length === 0}
        height="h-80"
      >
        <BarChart data={rows}>
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
                nameKey="label"
                formatter={(value) => currencyFormat(Number(value))}
              />
            }
          />
          <Bar dataKey="net" radius={2}>
            {rows.map((row) => (
              <Cell
                key={row.bucket_key}
                fill={row.net < 0 ? "var(--chart-4)" : "var(--chart-2)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ReportChartCard>

      <ReportChartCard
        title="Saldo Akhir Kumulatif"
        config={cumulativeConfig}
        loading={isLoading}
        empty={rows.length === 0}
        height="h-72"
      >
        <AreaChart data={rows}>
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

      <ReportTableCard
        title="Arus Kas per Periode"
        description="Saldo kumulatif dihitung dari nol pada awal rentang, bukan saldo rekening sebenarnya"
        columns={columns}
        data={rows}
        loading={isLoading}
      />
    </div>
  )
}

export default CashFlowSection
