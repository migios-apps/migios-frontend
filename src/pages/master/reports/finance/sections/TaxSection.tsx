import { useQuery } from "@tanstack/react-query"
import type { FinanceTaxRow } from "@/services/api/@types/report-finance"
import { apiGetFinanceTax } from "@/services/api/ReportService"
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

const taxConfig = buildChartConfig([
  { key: "total_tax", label: "Pajak Terkumpul" },
])

const trendConfig = buildChartConfig([
  { key: "tax", label: "Pajak", color: "var(--chart-positive)" },
])

const columns: DataTableColumnDef<FinanceTaxRow>[] = [
  { header: "Nama Pajak", accessorKey: "name", size: 220 },
  {
    header: "Rate",
    accessorKey: "rate",
    cell: ({ row }) => `${row.original.rate}%`,
  },
  {
    header: "Dasar Pengenaan",
    accessorKey: "base_amount",
    cell: ({ row }) => currencyFormat(row.original.base_amount),
  },
  {
    header: "Pajak Terkumpul",
    accessorKey: "total_tax",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.total_tax)}
      </span>
    ),
  },
  {
    header: "Transaksi Terkena",
    accessorKey: "transaction_count",
    cell: ({ row }) => row.original.transaction_count.toLocaleString("id-ID"),
  },
]

const TaxSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportFinance, "tax", params],
    queryFn: () => apiGetFinanceTax(params),
    select: (res) => res.data,
  })

  const taxes = data?.taxes ?? []
  const series = data?.series ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={3}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Pajak Terkumpul per Jenis"
          config={taxConfig}
          loading={isLoading}
          empty={taxes.length === 0}
        >
          <BarChart data={taxes}>
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
                  formatter={currencyTooltip(taxConfig)}
                />
              }
            />
            <Bar dataKey="total_tax" radius={2}>
              {taxes.map((row, index) => (
                <Cell
                  key={`${row.tax_id ?? index}`}
                  fill={getSeriesColor(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Tren Pajak Terkumpul"
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
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
              dataKey="tax"
              type="monotone"
              stroke="var(--chart-positive)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Pajak per Jenis"
        description="Dasar pengenaan dihitung dari pajak terkumpul dibagi rate"
        columns={columns}
        data={taxes}
        loading={isLoading}
      />
    </div>
  )
}

export default TaxSection
