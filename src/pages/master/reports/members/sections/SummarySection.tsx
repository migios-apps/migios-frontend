import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetMemberSummary } from "@/services/api/ReportService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
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
import ReportChartCard from "../../components/ReportChartCard"
import ReportKpiRow from "../../components/ReportKpiRow"
import { useReportFilterParams } from "../../hooks/report-filter-context"
import {
  buildChartConfig,
  getSeriesColor,
  toPieSlices,
} from "../../utils/chartConfig"
import { toKpiCards } from "../../utils/kpiCards"
import { pieCountLabel } from "../../utils/pieLabel"

const growthConfig = buildChartConfig([
  { key: "new_member", label: "Member Baru", color: "var(--primary)" },
  { key: "cumulative", label: "Kumulatif", color: "var(--chart-neutral)" },
])

const countConfig = buildChartConfig([{ key: "count", label: "Jumlah" }])

const MemberSummarySection = () => {
  const params = useReportFilterParams()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.reportMembers, "summary", params],
    queryFn: () => apiGetMemberSummary(params),
    select: (res) => res.data,
  })

  const newSeries = data?.new_series ?? []
  const statusDistribution = useMemo(
    () => data?.status_distribution ?? [],
    [data?.status_distribution]
  )
  const genderDistribution = useMemo(
    () => data?.gender_distribution ?? [],
    [data?.gender_distribution]
  )
  const ageDistribution = data?.age_distribution ?? []

  const statusConfig = useMemo(
    () =>
      buildChartConfig(
        statusDistribution.map((row) => ({
          key: row.status,
          label: row.status,
        }))
      ),
    [statusDistribution]
  )

  const genderConfig = useMemo(
    () =>
      buildChartConfig(
        genderDistribution.map((row) => ({ key: row.gender, label: row.label }))
      ),
    [genderDistribution]
  )

  const statusSlices = useMemo(
    () => toPieSlices(statusDistribution, (row) => row.count),
    [statusDistribution]
  )

  const genderSlices = useMemo(
    () => toPieSlices(genderDistribution, (row) => row.count),
    [genderDistribution]
  )

  return (
    <div className="flex flex-col gap-6">
      <ReportKpiRow
        items={toKpiCards(data?.kpis, data?.compare_period_label)}
        columns={4}
        loading={isLoading}
        skeletonCount={7}
      />

      <ReportChartCard
        title="Pertumbuhan Member"
        description="Member baru per periode dan akumulasinya"
        config={growthConfig}
        loading={isLoading}
        empty={newSeries.length === 0}
        height="h-80"
      >
        <AreaChart data={newSeries}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={50} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend />
          <Area
            dataKey="new_member"
            type="monotone"
            fill="var(--primary)"
            fillOpacity={0.2}
            stroke="var(--primary)"
          />
          <Line
            dataKey="cumulative"
            type="monotone"
            stroke="var(--chart-neutral)"
            dot={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ReportChartCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ReportChartCard
          title="Status Keanggotaan"
          config={statusConfig}
          loading={isLoading}
          empty={statusSlices.length === 0}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
            <Pie
              data={statusSlices}
              dataKey="count"
              nameKey="status"
              innerRadius={45}
              outerRadius={80}
              label={pieCountLabel}
            >
              {statusSlices.map((row) => (
                <Cell key={row.status} fill={row.sliceColor} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

        <ReportChartCard
          title="Demografi Gender"
          config={genderConfig}
          loading={isLoading}
          empty={genderSlices.length === 0}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={genderSlices}
              dataKey="count"
              nameKey="label"
              innerRadius={45}
              outerRadius={80}
              label={pieCountLabel}
            >
              {genderSlices.map((row) => (
                <Cell key={row.gender} fill={row.sliceColor} />
              ))}
            </Pie>
            <ChartLegend />
          </PieChart>
        </ReportChartCard>

        <ReportChartCard
          title="Kelompok Usia"
          config={countConfig}
          loading={isLoading}
          empty={ageDistribution.every((row) => row.count === 0)}
        >
          <BarChart data={ageDistribution}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent nameKey="bucket" />} />
            <Bar dataKey="count" fill={getSeriesColor(0)} radius={2} />
          </BarChart>
        </ReportChartCard>
      </div>
    </div>
  )
}

export default MemberSummarySection
