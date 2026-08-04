import { useQuery } from "@tanstack/react-query"
import type { MembershipRow } from "@/services/api/@types/report-packages"
import {
  apiGetMemberMembership,
  apiGetPackageMembership,
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
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { DataTableColumnDef } from "@/components/ui/data-table"
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import ReportTableCard from "../../components/ReportTableCard"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import { buildChartConfig, getSeriesColor } from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"

const activeConfig = buildChartConfig([
  { key: "active", label: "Paket Aktif", color: "var(--primary)" },
])

const statusConfig = buildChartConfig([{ key: "count", label: "Jumlah" }])

const STATUS_TONE: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground",
  expired: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  pending: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
}

const columns: DataTableColumnDef<MembershipRow>[] = [
  {
    header: "Member",
    accessorKey: "member_name",
    size: 200,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.member_name ?? "-"}</span>
        {row.original.member_code ? (
          <span className="text-muted-foreground text-xs">
            {row.original.member_code}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    header: "Paket",
    accessorKey: "package_name",
    size: 200,
    cell: ({ row }) => row.original.package_name ?? "-",
  },
  { header: "Tipe", accessorKey: "package_type" },
  {
    header: "Mulai",
    accessorKey: "start_date",
    cell: ({ row }) =>
      row.original.start_date
        ? dayjs(row.original.start_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Berakhir",
    accessorKey: "end_date",
    cell: ({ row }) =>
      row.original.end_date
        ? dayjs(row.original.end_date).format("DD MMM YYYY")
        : "-",
  },
  {
    header: "Sisa Hari",
    accessorKey: "remaining_days",
    cell: ({ row }) =>
      row.original.remaining_days === null ? (
        "-"
      ) : (
        <span
          className={cn(
            "font-medium",
            row.original.remaining_days < 0
              ? "text-rose-600 dark:text-rose-400"
              : row.original.remaining_days <= 7
                ? "text-amber-600 dark:text-amber-400"
                : ""
          )}
        >
          {row.original.remaining_days}
        </span>
      ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={STATUS_TONE[row.original.status] ?? ""}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    header: "Trainer",
    accessorKey: "trainer_name",
    cell: ({ row }) => row.original.trainer_name ?? "-",
  },
  {
    header: "Kelas",
    accessorKey: "class_name",
    cell: ({ row }) => row.original.class_name ?? "-",
  },
]

interface MembershipSectionProps {
  domain?: "packages" | "members"
}

const MembershipSection = ({ domain = "packages" }: MembershipSectionProps) => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [
      domain === "members" ? QUERY_KEY.reportMembers : QUERY_KEY.reportPackages,
      "membership",
      params,
    ],
    queryFn: () =>
      domain === "members"
        ? apiGetMemberMembership(params)
        : apiGetPackageMembership(params),
    select: (res) => res.data,
  })

  const statusDistribution = data?.status_distribution ?? []
  const remainingDistribution = data?.remaining_distribution ?? []
  const activeSeries = data?.active_series ?? []

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis)}
        columns={3}
        loading={isLoading}
        skeletonCount={6}
      />

      <ReportChartCard
        title="Tren Paket Aktif"
        description="Jumlah paket yang aktif pada setiap titik waktu"
        config={activeConfig}
        loading={isLoading}
        empty={activeSeries.length === 0}
        height="h-72"
      >
        <LineChart data={activeSeries}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={50} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="active"
            type="monotone"
            stroke="var(--primary)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportChartCard
          title="Distribusi Status Paket"
          config={statusConfig}
          loading={isLoading}
          empty={statusDistribution.length === 0}
        >
          <BarChart data={statusDistribution}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="status" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Bar dataKey="count" radius={2}>
              {statusDistribution.map((row, index) => (
                <Cell key={row.status} fill={getSeriesColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ReportChartCard>

        <ReportChartCard
          title="Distribusi Sisa Hari"
          config={statusConfig}
          loading={isLoading}
          empty={remainingDistribution.every((row) => row.count === 0)}
        >
          <BarChart data={remainingDistribution}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={50} />
            <ChartTooltip content={<ChartTooltipContent nameKey="bucket" />} />
            <Bar dataKey="count" fill={getSeriesColor(1)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>

      <ReportTableCard
        title="Akan Berakhir <= 30 Hari"
        description="Daftar follow-up perpanjangan"
        columns={columns}
        data={data?.expiring ?? []}
        loading={isLoading}
      />

      <ReportTableCard
        title="Seluruh Keanggotaan"
        description="Tidak dibatasi rentang tanggal; menampilkan seluruh paket member di club ini"
        columns={columns}
        data={data?.rows ?? []}
        loading={isLoading}
      />
    </div>
  )
}

export default MembershipSection
