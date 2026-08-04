import { useQuery } from "@tanstack/react-query"
import type { MemberLoyaltyRow } from "@/services/api/@types/report-members"
import { apiGetMemberLoyalty } from "@/services/api/ReportService"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import {
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const trendConfig = buildChartConfig([
  { key: "earned", label: "Poin Diperoleh", color: "var(--chart-positive)" },
  { key: "redeemed", label: "Poin Ditukar", color: "var(--chart-negative)" },
])

const rewardConfig = buildChartConfig([
  { key: "redeem_count", label: "Jumlah Redemption" },
])

const memberColumns: DataTableColumnDef<MemberLoyaltyRow>[] = [
  {
    header: "Member",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name ?? "-"}</span>
        {row.original.code ? (
          <span className="text-muted-foreground text-xs">
            {row.original.code}
          </span>
        ) : null}
      </div>
    ),
  },
  { header: "Diperoleh", accessorKey: "earned" },
  { header: "Ditukar", accessorKey: "redeemed" },
  { header: "Kadaluarsa", accessorKey: "expired" },
  {
    header: "Saldo",
    accessorKey: "balance",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.balance}</span>
    ),
  },
  {
    header: "Redeem Terakhir",
    accessorKey: "last_redeem",
    cell: ({ row }) =>
      row.original.last_redeem
        ? dayjs(row.original.last_redeem).format("DD MMM YYYY")
        : "-",
  },
]

const LoyaltySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportMembers, "loyalty", params],
    queryFn: () => apiGetMemberLoyalty(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []
  const rewards = data?.rewards ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={5}
        loading={isLoading}
        skeletonCount={5}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Tren Earn vs Redeem"
          config={trendConfig}
          loading={isLoading}
          empty={series.length === 0}
        >
          <LineChart data={series}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend />
            <Line
              dataKey="earned"
              type="monotone"
              stroke="var(--chart-positive)"
              dot={false}
              strokeWidth={2}
            />
            <Line
              dataKey="redeemed"
              type="monotone"
              stroke="var(--chart-negative)"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ReportChartCard>

        <ReportChartCard
          title="Reward Paling Sering Ditukar"
          config={rewardConfig}
          loading={isLoading}
          empty={rewards.length === 0}
        >
          <BarChart data={rewards} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Bar dataKey="redeem_count" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Poin per Member"
        columns={memberColumns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default LoyaltySection
