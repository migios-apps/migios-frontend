import { useQuery } from "@tanstack/react-query"
import type {
  SalesRefundRow,
  SalesVoidRow,
} from "@/services/api/@types/report-sales"
import { apiGetSalesRefundVoid } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const trendConfig = buildChartConfig([
  { key: "refund", label: "Refund", color: "var(--chart-negative)" },
  { key: "void_amount", label: "Void", color: "var(--chart-cat-6)" },
])

const categoryConfig = buildChartConfig([
  { key: "amount", label: "Nilai Refund" },
])

const refundColumns: DataTableColumnDef<SalesRefundRow>[] = [
  {
    header: "Tanggal",
    accessorKey: "refund_date",
    cell: ({ row }) => dayjs(row.original.refund_date).format("DD MMM YYYY"),
  },
  { header: "Faktur", accessorKey: "code", size: 140 },
  {
    header: "Member",
    accessorKey: "member_name",
    size: 180,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Nominal",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
  },
  {
    header: "Persentase",
    accessorKey: "percentage",
    cell: ({ row }) =>
      row.original.percentage !== null ? `${row.original.percentage}%` : "-",
  },
  {
    header: "Rekening",
    accessorKey: "rekening_name",
    cell: ({ row }) => row.original.rekening_name ?? "-",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    header: "Diproses oleh",
    accessorKey: "processed_by_name",
    cell: ({ row }) => row.original.processed_by_name ?? "-",
  },
]

const voidColumns: DataTableColumnDef<SalesVoidRow>[] = [
  {
    header: "Tanggal",
    accessorKey: "void_date",
    cell: ({ row }) => dayjs(row.original.void_date).format("DD MMM YYYY"),
  },
  { header: "Faktur", accessorKey: "code", size: 140 },
  {
    header: "Member",
    accessorKey: "member_name",
    size: 180,
    cell: ({ row }) => row.original.member_name ?? "-",
  },
  {
    header: "Nominal",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium">{currencyFormat(row.original.amount)}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    header: "Diproses oleh",
    accessorKey: "processed_by_name",
    cell: ({ row }) => row.original.processed_by_name ?? "-",
  },
  {
    header: "Catatan",
    accessorKey: "notes",
    size: 220,
    cell: ({ row }) => row.original.notes ?? "-",
  },
]

const RefundVoidSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportSales, "refund-void", params],
    queryFn: () => apiGetSalesRefundVoid(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const byCategory = data?.by_category ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <ReportChartCard
        title="Tren Refund dan Void"
        config={trendConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-72"
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
              <ChartTooltipContent
                formatter={(value) => currencyFormat(Number(value))}
              />
            }
          />
          <ChartLegend />
          <Line
            dataKey="refund"
            type="monotone"
            stroke="var(--chart-negative)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            dataKey="void_amount"
            type="monotone"
            stroke="var(--chart-cat-6)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Refund per Kategori Item"
          config={categoryConfig}
          loading={isLoading}
          empty={byCategory.length === 0}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  formatter={(value) => currencyFormat(Number(value))}
                />
              }
            />
            <Pie
              data={byCategory}
              dataKey="amount"
              nameKey="category"
              innerRadius={50}
            >
              {byCategory.map((row, index) => (
                <Cell key={row.category} fill={getSeriesColor(index)} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

        <ReportChartCard
          title="Qty Refund per Kategori"
          config={buildChartConfig([{ key: "qty", label: "Qty Refund" }])}
          loading={isLoading}
          empty={byCategory.length === 0}
        >
          <BarChart data={byCategory}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="category" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip
              content={<ChartTooltipContent nameKey="category" />}
            />
            <Bar dataKey="qty" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Rincian Refund"
        columns={refundColumns}
        data={data?.refunds ?? []}
        loading={isLoading}
      />

      <ReportTableCard
        title="Rincian Void"
        columns={voidColumns}
        data={data?.voids ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default RefundVoidSection
