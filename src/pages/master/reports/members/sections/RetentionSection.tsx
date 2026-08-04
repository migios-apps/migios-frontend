import { useQuery } from "@tanstack/react-query"
import type {
  MemberChurnRow,
  MemberRetentionRow,
} from "@/services/api/@types/report-members"
import { apiGetMemberRetention } from "@/services/api/ReportService"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { dayjs } from "@/utils/dayjs"
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
import { buildChartConfig } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const chartConfig = buildChartConfig([
  { key: "new_member", label: "Member Baru", color: "var(--chart-positive)" },
  { key: "churn", label: "Churn", color: "var(--chart-negative)" },
])

const newColumns: DataTableColumnDef<MemberRetentionRow>[] = [
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
  {
    header: "Tanggal Join",
    accessorKey: "join_date",
    cell: ({ row }) =>
      row.original.join_date
        ? dayjs(row.original.join_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Paket Pertama",
    accessorKey: "first_package",
    size: 180,
    cell: ({ row }) => row.original.first_package ?? "-",
  },
  {
    header: "Transaksi Pertama",
    accessorKey: "first_transaction_value",
    cell: ({ row }) => currencyFormat(row.original.first_transaction_value),
  },
  {
    header: "Karyawan Penjual",
    accessorKey: "employee_name",
    cell: ({ row }) => row.original.employee_name ?? "-",
  },
]

const churnColumns: DataTableColumnDef<MemberChurnRow>[] = [
  {
    header: "Member",
    accessorKey: "name",
    size: 200,
    cell: ({ row }) => row.original.name ?? "-",
  },
  {
    header: "Paket Terakhir",
    accessorKey: "last_package",
    size: 180,
    cell: ({ row }) => row.original.last_package ?? "-",
  },
  {
    header: "Berakhir",
    accessorKey: "ended_at",
    cell: ({ row }) =>
      row.original.ended_at
        ? dayjs(row.original.ended_at).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Lama Jadi Member",
    accessorKey: "membership_days",
    cell: ({ row }) => `${row.original.membership_days} hari`,
  },
  {
    header: "Total Belanja Seumur Hidup",
    accessorKey: "lifetime_value",
    cell: ({ row }) => (
      <span className="font-medium">
        {currencyFormat(row.original.lifetime_value)}
      </span>
    ),
  },
]

const RetentionSection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportMembers, "retention", params],
    queryFn: () => apiGetMemberRetention(params),
    select: (res) => res.data,
  })

  const series = data?.series ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={5}
        loading={isLoading}
        skeletonCount={5}
      />

      <ReportChartCard
        title="Member Baru vs Churn"
        description="Churn dihitung dari paket yang berakhir dan tidak diperpanjang"
        config={chartConfig}
        loading={isLoading}
        empty={series.length === 0}
        height="h-80"
      >
        <BarChart data={series}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={50} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend />
          <Bar dataKey="new_member" fill="var(--chart-positive)" radius={2} />
          <Bar dataKey="churn" fill="var(--chart-negative)" radius={2} />
        </BarChart>
      </ReportChartCard>

      <ReportTableCard
        title="Member Baru"
        columns={newColumns}
        data={data?.new_members ?? []}
        loading={isLoading}
      />

      <ReportTableCard
        title="Member Churn"
        columns={churnColumns}
        data={data?.churned ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default RetentionSection
