import { useQuery } from "@tanstack/react-query"
import type {
  SalesTaxRow,
  SalesVoucherRow,
} from "@/services/api/@types/report-sales"
import { apiGetSalesDiscountTax } from "@/services/api/ReportService"
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
import { currencyTooltip, percentTooltip } from "../../utils/tooltipFormatter"

const sourceConfig = buildChartConfig([{ key: "amount", label: "Nilai" }])

const ratioConfig = buildChartConfig([
  {
    key: "discount_ratio",
    label: "Rasio Diskon (%)",
    color: "var(--chart-negative)",
  },
])

const taxConfig = buildChartConfig([
  {
    key: "total_tax",
    label: "Pajak Terkumpul",
    color: "var(--chart-positive)",
  },
])

const voucherColumns: DataTableColumnDef<SalesVoucherRow>[] = [
  { header: "Kode", accessorKey: "code", size: 140 },
  { header: "Nama Voucher", accessorKey: "name", size: 220 },
  {
    header: "Dipakai",
    accessorKey: "redemption_count",
    cell: ({ row }) => row.original.redemption_count.toLocaleString("id-ID"),
  },
  {
    header: "Member Unik",
    accessorKey: "member_count",
    cell: ({ row }) => row.original.member_count.toLocaleString("id-ID"),
  },
  {
    header: "Total Diskon",
    accessorKey: "total_discount",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.total_discount)}
      </span>
    ),
  },
]

const taxColumns: DataTableColumnDef<SalesTaxRow>[] = [
  { header: "Nama Pajak", accessorKey: "name", size: 200 },
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
    header: "Transaksi",
    accessorKey: "transaction_count",
    cell: ({ row }) => row.original.transaction_count.toLocaleString("id-ID"),
  },
]

const DiscountTaxSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "discount-tax", params],
    queryFn: () => apiGetSalesDiscountTax(params),
    select: (res) => res.data,
  })

  const sources = data?.sources ?? []
  const series = data?.series ?? []
  const taxes = data?.taxes ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Komposisi Diskon per Sumber"
          config={sourceConfig}
          loading={isLoading}
          empty={sources.every((row) => row.amount === 0)}
        >
          <BarChart data={sources}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="source" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value: number) => currencyFormat(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="source"
                  formatter={currencyTooltip(sourceConfig)}
                />
              }
            />
            <Bar dataKey="amount" radius={2}>
              {sources.map((row, index) => (
                <Cell key={row.source} fill={getSeriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Rasio Diskon terhadap Gross"
          description="Persentase diskon per periode"
          config={ratioConfig}
          loading={isLoading}
          empty={series.length === 0}
        >
          <LineChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={50}
              tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={percentTooltip(ratioConfig, 2)}
                />
              }
            />
            <Line
              dataKey="discount_ratio"
              type="monotone"
              stroke="var(--chart-negative)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>
      </div>

      <ReportChartCard
        title="Pajak Terkumpul per Jenis"
        config={taxConfig}
        loading={isLoading}
        empty={taxes.length === 0}
        height="h-72"
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
          <Bar dataKey="total_tax" fill={getSeriesColor(1)} radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Voucher Terpakai"
        description="Hanya redemption berstatus applied"
        columns={voucherColumns}
        data={data?.vouchers ?? []}
        loading={isLoading}
      />

      <ReportTableCard
        title="Pajak per Jenis"
        description="Dasar pengenaan dihitung dari pajak terkumpul dibagi rate"
        columns={taxColumns}
        data={taxes}
        loading={isLoading}
      />
    </div>
  )
}

export default DiscountTaxSection
