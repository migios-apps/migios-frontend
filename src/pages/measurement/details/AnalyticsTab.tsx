import type { ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  type BMITrendData,
  type BodyCompositionData,
  type BodySizeData,
  type GetMeasurementAnalyticParams,
  type NutritionProgressHistory,
  type WeightTrendData,
} from "@/services/api/@types/measurement"
import {
  apiGetBMITrend,
  apiGetBodyCompositionTrend,
  apiGetBodySizeTrend,
  apiGetNutritionProgress,
  apiGetOverallProgress,
  apiGetRecommendation,
  apiGetResultTrend,
  apiGetWeightTrend,
} from "@/services/api/MeasurementService"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AnalyticsTabProps {
  memberId: number
  startDate?: string
  endDate?: string
}

const AnalyticsCard = ({
  title,
  description,
  children,
  contentClassName,
}: {
  title: string
  description?: string
  children: ReactNode
  contentClassName?: string
}) => (
  <Card className="shadow-none">
    <CardHeader className="pb-4">
      <CardTitle className="text-foreground text-base font-semibold">
        {title}
      </CardTitle>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </CardHeader>
    <CardContent className={cn("space-y-4", contentClassName)}>
      {children}
    </CardContent>
  </Card>
)

type ChartSeries = {
  name: string
  data: number[]
}

type AnalyticsChartProps = {
  type: "line" | "bar" | "area"
  series: ChartSeries[]
  xAxis: string[]
  className?: string
}

const chartColorTokens = Array.from(
  { length: 5 },
  (_, idx) => `hsl(var(--chart-${idx + 1}))`
)

const AnalyticsChart = ({
  type,
  series,
  xAxis,
  className = "h-[300px]",
}: AnalyticsChartProps) => {
  if (!series.length || !xAxis.length) {
    return null
  }

  const chartData = xAxis.map((label, idx) => {
    const entry: Record<string, string | number> = { label }
    series.forEach((serie, serieIdx) => {
      entry[`series_${serieIdx}`] = serie.data[idx] ?? 0
    })
    return entry
  })

  const config = series.reduce((acc, serie, idx) => {
    acc[`series_${idx}`] = {
      label: serie.name,
      color: chartColorTokens[idx % chartColorTokens.length],
    }
    return acc
  }, {} as ChartConfig)

  const commonAxes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent indicator="dot" />}
      />
    </>
  )

  let chart: ReactNode | null = null

  if (type === "line") {
    chart = (
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0 }}>
        {commonAxes}
        {series.map((_, idx) => (
          <Line
            key={idx}
            type="monotone"
            dataKey={`series_${idx}`}
            stroke={`var(--color-series_${idx})`}
            strokeWidth={3}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    )
  } else if (type === "bar") {
    chart = (
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0 }}>
        {commonAxes}
        {series.map((_, idx) => (
          <Bar
            key={idx}
            dataKey={`series_${idx}`}
            fill={`var(--color-series_${idx})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    )
  } else if (type === "area") {
    chart = (
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0 }}>
        {commonAxes}
        {series.map((_, idx) => (
          <Area
            key={idx}
            type="monotone"
            dataKey={`series_${idx}`}
            stroke={`var(--color-series_${idx})`}
            fill={`var(--color-series_${idx})`}
            fillOpacity={0.15}
          />
        ))}
      </AreaChart>
    )
  }

  if (!chart) {
    return null
  }

  return (
    <ChartContainer config={config} className={cn("w-full", className)}>
      {chart}
    </ChartContainer>
  )
}

const AnalyticsTab = ({ memberId, startDate, endDate }: AnalyticsTabProps) => {
  const params: GetMeasurementAnalyticParams = {
    member_id: memberId,
    ...(startDate && { start_date: startDate }),
    ...(endDate && { end_date: endDate }),
  }

  const { data: weightTrend } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "weight-trend", params],
    queryFn: async () => {
      const res = await apiGetWeightTrend(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: bodyComposition } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "body-composition", params],
    queryFn: async () => {
      const res = await apiGetBodyCompositionTrend(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: bodySize } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "body-size", params],
    queryFn: async () => {
      const res = await apiGetBodySizeTrend(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: bmiTrend } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "bmi", params],
    queryFn: async () => {
      const res = await apiGetBMITrend(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: resultTrend } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "result", params],
    queryFn: async () => {
      const res = await apiGetResultTrend(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: nutritionProgress } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "nutrition", params],
    queryFn: async () => {
      const res = await apiGetNutritionProgress(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: overallProgress } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "overall", params],
    queryFn: async () => {
      const res = await apiGetOverallProgress(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const { data: recommendation } = useQuery({
    queryKey: [QUERY_KEY.measurements, "analytics", "recommendation", params],
    queryFn: async () => {
      const res = await apiGetRecommendation(params)
      return (res as any).data || res
    },
    enabled: !!memberId,
  })

  const weightChartCategories =
    weightTrend?.data?.map((item: WeightTrendData) =>
      dayjs(item.date).format("DD MMM YYYY")
    ) ?? []
  const weightChartSeries = weightTrend
    ? [
        {
          name: "Berat Badan (Kg)",
          data: weightTrend.data.map(
            (item: WeightTrendData) => item.weight ?? 0
          ),
        },
      ]
    : []

  const bmiChartCategories =
    bmiTrend?.data?.map((item: BMITrendData) =>
      dayjs(item.date).format("DD MMM YYYY")
    ) ?? []
  const bmiChartSeries = bmiTrend
    ? [
        {
          name: "BMI",
          data: bmiTrend.data.map((item: BMITrendData) => item.bmi ?? 0),
        },
      ]
    : []

  const bodyCompositionCategories =
    bodyComposition?.data?.map((item: BodyCompositionData) =>
      dayjs(item.date).format("DD MMM YYYY")
    ) ?? []
  const bodyCompositionSeries = bodyComposition
    ? [
        {
          name: "Body Fat %",
          data: bodyComposition.data.map(
            (item: BodyCompositionData) => item.body_fat_percent ?? 0
          ),
        },
        {
          name: "Muscle Mass (Kg)",
          data: bodyComposition.data.map(
            (item: BodyCompositionData) => item.muscle_mass_kg ?? 0
          ),
        },
        {
          name: "Lean Body Mass (Kg)",
          data: bodyComposition.data.map(
            (item: BodyCompositionData) => item.lean_body_mass_kg ?? 0
          ),
        },
      ]
    : []

  const bodySizeCategories =
    bodySize?.data?.map((item: BodySizeData) =>
      dayjs(item.date).format("DD MMM YYYY")
    ) ?? []
  const bodySizeSeries = bodySize
    ? [
        {
          name: "Chest (Cm)",
          data: bodySize.data.map((item: BodySizeData) => item.chest ?? 0),
        },
        {
          name: "Abdominal (Cm)",
          data: bodySize.data.map((item: BodySizeData) => item.abdominal ?? 0),
        },
        {
          name: "Hip (Cm)",
          data: bodySize.data.map((item: BodySizeData) => item.hip ?? 0),
        },
        {
          name: "Right Arm (Cm)",
          data: bodySize.data.map((item: BodySizeData) => item.right_arm ?? 0),
        },
        {
          name: "Left Arm (Cm)",
          data: bodySize.data.map((item: BodySizeData) => item.left_arm ?? 0),
        },
      ]
    : []

  const resultLabelMap: Record<string, string> = {
    excellent: "Sangat Baik",
    good: "Baik",
    average: "Rata-rata",
    need_improvement: "Perlu Perbaikan",
    poor: "Buruk",
  }

  const resultChartEntries = resultTrend
    ? Object.entries(resultTrend.summary.result_counts)
    : []
  const resultChartCategories = resultChartEntries.map(
    ([key]) => resultLabelMap[key] || key
  )
  const resultChartSeries = resultChartEntries.length
    ? [
        {
          name: "Jumlah",
          data: resultChartEntries.map(([, value]) => Number(value) || 0),
        },
      ]
    : []

  const nutritionChartCategories =
    nutritionProgress?.history?.map((item: NutritionProgressHistory) =>
      dayjs(item.date).format("DD MMM YYYY")
    ) ?? []
  const nutritionChartSeries = nutritionProgress
    ? [
        {
          name: "Kalori",
          data: nutritionProgress.history.map(
            (item: NutritionProgressHistory) => item.calories ?? 0
          ),
        },
        {
          name: "Protein (g)",
          data: nutritionProgress.history.map(
            (item: NutritionProgressHistory) => item.protein ?? 0
          ),
        },
        {
          name: "Karbohidrat (g)",
          data: nutritionProgress.history.map(
            (item: NutritionProgressHistory) => item.carbs ?? 0
          ),
        },
        {
          name: "Lemak (g)",
          data: nutritionProgress.history.map(
            (item: NutritionProgressHistory) => item.fat ?? 0
          ),
        },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      {/* Overall Progress Summary */}
      {overallProgress?.summary && (
        <AnalyticsCard title="Ringkasan Progress Keseluruhan">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Total Pengukuran
              </span>
              <span className="text-lg font-semibold">
                {overallProgress.summary.total_measurements}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Pengukuran Pertama
              </span>
              <span className="text-lg font-semibold">
                {dayjs(overallProgress.summary.first_measurement_date).format(
                  "DD MMM YYYY"
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Pengukuran Terakhir
              </span>
              <span className="text-lg font-semibold">
                {dayjs(overallProgress.summary.last_measurement_date).format(
                  "DD MMM YYYY"
                )}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Perubahan Berat
              </span>
              <span
                className={`text-lg font-semibold ${
                  overallProgress.summary.weight.change > 0
                    ? "text-red-500"
                    : overallProgress.summary.weight.change < 0
                      ? "text-green-500"
                      : ""
                }`}
              >
                {overallProgress.summary.weight.change > 0 ? "+" : ""}
                {overallProgress.summary.weight.change.toFixed(2)} Kg
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Weight Trend */}
      {weightTrend && weightTrend.data.length > 0 && (
        <AnalyticsCard title="Trend Berat Badan" contentClassName="space-y-6">
          <AnalyticsChart
            type="line"
            series={weightChartSeries}
            xAxis={weightChartCategories}
            className="h-[350px]"
          />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Berat Pertama
              </span>
              <span className="font-semibold">
                {weightTrend.summary.first_weight
                  ? `${weightTrend.summary.first_weight} Kg`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Berat Terakhir
              </span>
              <span className="font-semibold">
                {weightTrend.summary.last_weight
                  ? `${weightTrend.summary.last_weight} Kg`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Perubahan</span>
              <span
                className={`font-semibold ${
                  weightTrend.summary.change > 0
                    ? "text-red-500"
                    : weightTrend.summary.change < 0
                      ? "text-green-500"
                      : ""
                }`}
              >
                {weightTrend.summary.change > 0 ? "+" : ""}
                {weightTrend.summary.change.toFixed(2)} Kg
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Persentase Perubahan
              </span>
              <span
                className={`font-semibold ${
                  weightTrend.summary.change_percent > 0
                    ? "text-red-500"
                    : weightTrend.summary.change_percent < 0
                      ? "text-green-500"
                      : ""
                }`}
              >
                {weightTrend.summary.change_percent > 0 ? "+" : ""}
                {weightTrend.summary.change_percent.toFixed(2)}%
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* BMI Trend */}
      {bmiTrend && bmiTrend.data.length > 0 && (
        <AnalyticsCard title="Trend BMI" contentClassName="space-y-6">
          <AnalyticsChart
            type="line"
            series={bmiChartSeries}
            xAxis={bmiChartCategories}
            className="h-[350px]"
          />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">BMI Pertama</span>
              <span className="font-semibold">
                {bmiTrend.summary.first_bmi
                  ? bmiTrend.summary.first_bmi.toFixed(2)
                  : "-"}
              </span>
              {bmiTrend.summary.first_category && (
                <span className="text-muted-foreground text-xs">
                  {bmiTrend.summary.first_category}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                BMI Terakhir
              </span>
              <span className="font-semibold">
                {bmiTrend.summary.last_bmi
                  ? bmiTrend.summary.last_bmi.toFixed(2)
                  : "-"}
              </span>
              {bmiTrend.summary.last_category && (
                <span className="text-muted-foreground text-xs">
                  {bmiTrend.summary.last_category}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Perubahan</span>
              <span
                className={`font-semibold ${
                  bmiTrend.summary.change && bmiTrend.summary.change > 0
                    ? "text-red-500"
                    : bmiTrend.summary.change && bmiTrend.summary.change < 0
                      ? "text-green-500"
                      : ""
                }`}
              >
                {bmiTrend.summary.change !== null
                  ? `${bmiTrend.summary.change > 0 ? "+" : ""}${bmiTrend.summary.change.toFixed(2)}`
                  : "-"}
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Body Composition Trend */}
      {bodyComposition && bodyComposition.data.length > 0 && (
        <AnalyticsCard
          title="Trend Komposisi Tubuh"
          contentClassName="space-y-6"
        >
          <AnalyticsChart
            type="line"
            series={bodyCompositionSeries}
            xAxis={bodyCompositionCategories}
            className="h-[350px]"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Body Fat</span>
              <span className="font-semibold">
                {bodyComposition.summary.body_fat.change !== null
                  ? `${bodyComposition.summary.body_fat.change > 0 ? "+" : ""}${bodyComposition.summary.body_fat.change.toFixed(2)}%`
                  : "-"}
              </span>
              <span className="text-muted-foreground text-xs">
                {bodyComposition.summary.body_fat.first !== null &&
                  bodyComposition.summary.body_fat.last !== null &&
                  `${bodyComposition.summary.body_fat.first.toFixed(2)}% → ${bodyComposition.summary.body_fat.last.toFixed(2)}%`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Muscle Mass</span>
              <span className="font-semibold">
                {bodyComposition.summary.muscle_mass.change !== null
                  ? `${bodyComposition.summary.muscle_mass.change > 0 ? "+" : ""}${bodyComposition.summary.muscle_mass.change.toFixed(2)} Kg`
                  : "-"}
              </span>
              <span className="text-muted-foreground text-xs">
                {bodyComposition.summary.muscle_mass.first !== null &&
                  bodyComposition.summary.muscle_mass.last !== null &&
                  `${bodyComposition.summary.muscle_mass.first.toFixed(2)} Kg → ${bodyComposition.summary.muscle_mass.last.toFixed(2)} Kg`}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Lean Body Mass
              </span>
              <span className="font-semibold">
                {bodyComposition.summary.lean_body_mass.change !== null
                  ? `${bodyComposition.summary.lean_body_mass.change > 0 ? "+" : ""}${bodyComposition.summary.lean_body_mass.change.toFixed(2)} Kg`
                  : "-"}
              </span>
              <span className="text-muted-foreground text-xs">
                {bodyComposition.summary.lean_body_mass.first !== null &&
                  bodyComposition.summary.lean_body_mass.last !== null &&
                  `${bodyComposition.summary.lean_body_mass.first.toFixed(2)} Kg → ${bodyComposition.summary.lean_body_mass.last.toFixed(2)} Kg`}
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Body Size Trend */}
      {bodySize && bodySize.data.length > 0 && (
        <AnalyticsCard title="Trend Ukuran Tubuh" contentClassName="space-y-6">
          <AnalyticsChart
            type="line"
            series={bodySizeSeries}
            xAxis={bodySizeCategories}
            className="h-[350px]"
          />
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Chest</span>
              <span className="font-semibold">
                {bodySize.summary.chest.change !== null
                  ? `${bodySize.summary.chest.change > 0 ? "+" : ""}${bodySize.summary.chest.change.toFixed(2)} Cm`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Abdominal</span>
              <span className="font-semibold">
                {bodySize.summary.abdominal.change !== null
                  ? `${bodySize.summary.abdominal.change > 0 ? "+" : ""}${bodySize.summary.abdominal.change.toFixed(2)} Cm`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Hip</span>
              <span className="font-semibold">
                {bodySize.summary.hip.change !== null
                  ? `${bodySize.summary.hip.change > 0 ? "+" : ""}${bodySize.summary.hip.change.toFixed(2)} Cm`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Right Arm</span>
              <span className="font-semibold">
                {bodySize.summary.right_arm.change !== null
                  ? `${bodySize.summary.right_arm.change > 0 ? "+" : ""}${bodySize.summary.right_arm.change.toFixed(2)} Cm`
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">Left Arm</span>
              <span className="font-semibold">
                {bodySize.summary.left_arm.change !== null
                  ? `${bodySize.summary.left_arm.change > 0 ? "+" : ""}${bodySize.summary.left_arm.change.toFixed(2)} Cm`
                  : "-"}
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Result Trend */}
      {resultTrend && resultTrend.data.length > 0 && (
        <AnalyticsCard
          title="Trend Hasil Penilaian"
          contentClassName="grid gap-6 md:grid-cols-2"
        >
          <div>
            <AnalyticsChart
              type="bar"
              series={resultChartSeries}
              xAxis={resultChartCategories}
              className="h-[300px]"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Hasil Pertama
              </span>
              <span className="text-lg font-semibold">
                {resultTrend.summary.first_result
                  ? resultTrend.summary.first_result === "excellent"
                    ? "Sangat Baik"
                    : resultTrend.summary.first_result === "good"
                      ? "Baik"
                      : resultTrend.summary.first_result === "average"
                        ? "Rata-rata"
                        : resultTrend.summary.first_result ===
                            "need_improvement"
                          ? "Perlu Perbaikan"
                          : resultTrend.summary.first_result === "poor"
                            ? "Buruk"
                            : resultTrend.summary.first_result
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Hasil Terakhir
              </span>
              <span className="text-lg font-semibold">
                {resultTrend.summary.last_result
                  ? resultTrend.summary.last_result === "excellent"
                    ? "Sangat Baik"
                    : resultTrend.summary.last_result === "good"
                      ? "Baik"
                      : resultTrend.summary.last_result === "average"
                        ? "Rata-rata"
                        : resultTrend.summary.last_result === "need_improvement"
                          ? "Perlu Perbaikan"
                          : resultTrend.summary.last_result === "poor"
                            ? "Buruk"
                            : resultTrend.summary.last_result
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                Total Pengukuran
              </span>
              <span className="text-lg font-semibold">
                {resultTrend.summary.total_measurements}
              </span>
            </div>
          </div>
        </AnalyticsCard>
      )}

      {/* Nutrition Progress */}
      {nutritionProgress && nutritionProgress.history.length > 0 && (
        <AnalyticsCard
          title="Progress Target Nutrisi"
          contentClassName="space-y-6"
        >
          {nutritionProgress.latest_targets && (
            <div className="grid gap-4 md:grid-cols-5">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  Target Kalori
                </span>
                <span className="font-semibold">
                  {nutritionProgress.latest_targets.calories
                    ? `${nutritionProgress.latest_targets.calories} Kcal`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  Target Protein
                </span>
                <span className="font-semibold">
                  {nutritionProgress.latest_targets.protein
                    ? `${nutritionProgress.latest_targets.protein} g`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  Target Karbohidrat
                </span>
                <span className="font-semibold">
                  {nutritionProgress.latest_targets.carbs
                    ? `${nutritionProgress.latest_targets.carbs} g`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  Target Lemak
                </span>
                <span className="font-semibold">
                  {nutritionProgress.latest_targets.fat
                    ? `${nutritionProgress.latest_targets.fat} g`
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm">
                  Skor Kepatuhan
                </span>
                <span className="font-semibold">
                  {nutritionProgress.latest_targets.adherence_score
                    ? `${nutritionProgress.latest_targets.adherence_score}/10`
                    : "-"}
                </span>
              </div>
            </div>
          )}
          <AnalyticsChart
            type="area"
            series={nutritionChartSeries}
            xAxis={nutritionChartCategories}
            className="h-[350px]"
          />
        </AnalyticsCard>
      )}

      {/* Recommendation */}
      {recommendation && !recommendation.message && (
        <AnalyticsCard title="Rekomendasi & Rencana">
          <div className="flex flex-col gap-6">
            {/* Summary */}
            {recommendation.summary && (
              <div className="flex flex-col gap-2">
                <h5 className="text-lg font-semibold">Ringkasan</h5>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {recommendation.summary}
                </p>
              </div>
            )}

            {/* Body Composition Recommendation */}
            {recommendation.body_composition && (
              <div className="flex flex-col gap-2">
                <h5 className="text-lg font-semibold">Komposisi Tubuh</h5>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {recommendation.body_composition}
                </p>
              </div>
            )}

            {/* Training Recommendation */}
            {recommendation.training && (
              <div className="flex flex-col gap-2">
                <h5 className="text-lg font-semibold">Latihan</h5>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {recommendation.training}
                </p>
              </div>
            )}

            {/* Nutrition Recommendation */}
            {recommendation.nutrition && (
              <div className="flex flex-col gap-2">
                <h5 className="text-lg font-semibold">Nutrisi</h5>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {recommendation.nutrition}
                </p>
              </div>
            )}

            {/* Next 4 Weeks Plan */}
            {recommendation.next_4_weeks_plan && (
              <div className="flex flex-col gap-2">
                <h5 className="text-lg font-semibold">
                  Rencana 4 Minggu Ke Depan
                </h5>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {recommendation.next_4_weeks_plan
                      .split("\n")
                      .map((line: string, index: number) => {
                        if (
                          line.trim().startsWith("•") ||
                          line.trim().startsWith("-")
                        ) {
                          return (
                            <div
                              key={index}
                              className="mt-1 flex items-start gap-2"
                            >
                              <span className="text-primary mt-1">•</span>
                              <span>{line.trim().substring(1).trim()}</span>
                            </div>
                          )
                        }
                        if (
                          line.trim().startsWith("**") &&
                          line.trim().endsWith("**")
                        ) {
                          return (
                            <div
                              key={index}
                              className="mt-3 mb-2 font-semibold"
                            >
                              {line.replace(/\*\*/g, "")}
                            </div>
                          )
                        }
                        return <div key={index}>{line}</div>
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Meta Information */}
            {recommendation.meta && (
              <div className="border-t pt-4">
                <h5 className="mb-4 text-lg font-semibold">
                  Statistik Periode
                </h5>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Periode
                    </span>
                    <span className="font-semibold">
                      {recommendation.meta.period_weeks} Minggu
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Perubahan Berat
                    </span>
                    <span
                      className={`font-semibold ${
                        recommendation.meta.weight_change > 0
                          ? "text-red-500"
                          : recommendation.meta.weight_change < 0
                            ? "text-green-500"
                            : ""
                      }`}
                    >
                      {recommendation.meta.weight_change > 0 ? "+" : ""}
                      {recommendation.meta.weight_change.toFixed(2)} Kg
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Perubahan Body Fat
                    </span>
                    <span
                      className={`font-semibold ${
                        recommendation.meta.body_fat_change > 0
                          ? "text-red-500"
                          : recommendation.meta.body_fat_change < 0
                            ? "text-green-500"
                            : ""
                      }`}
                    >
                      {recommendation.meta.body_fat_change > 0 ? "+" : ""}
                      {recommendation.meta.body_fat_change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Berat per Minggu
                    </span>
                    <span
                      className={`font-semibold ${
                        recommendation.meta.weight_per_week > 0
                          ? "text-red-500"
                          : recommendation.meta.weight_per_week < 0
                            ? "text-green-500"
                            : ""
                      }`}
                    >
                      {recommendation.meta.weight_per_week > 0 ? "+" : ""}
                      {recommendation.meta.weight_per_week.toFixed(2)} Kg/minggu
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Total Workout
                    </span>
                    <span className="font-semibold">
                      {recommendation.meta.workout_count} Sesi
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Workout per Minggu
                    </span>
                    <span className="font-semibold">
                      {recommendation.meta.workout_per_week} Sesi/minggu
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Rata-rata Adherence
                    </span>
                    <span className="font-semibold">
                      {recommendation.meta.avg_adherence}/10
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-sm">
                      Rata-rata Kalori
                    </span>
                    <span className="font-semibold">
                      {recommendation.meta.avg_calorie} Kcal
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="mt-4 border-t pt-4">
                  <h5 className="mb-3 text-lg font-semibold">
                    Status Evaluasi
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Progress Fat Loss:
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          recommendation.meta.status.progress_fat_loss ===
                          "GOOD"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : recommendation.meta.status.progress_fat_loss ===
                                "SLOW"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : recommendation.meta.status.progress_fat_loss ===
                                  "TOO_FAST"
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                : recommendation.meta.status
                                      .progress_fat_loss === "REVERSE"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {recommendation.meta.status.progress_fat_loss === "GOOD"
                          ? "Baik"
                          : recommendation.meta.status.progress_fat_loss ===
                              "SLOW"
                            ? "Lambat"
                            : recommendation.meta.status.progress_fat_loss ===
                                "TOO_FAST"
                              ? "Terlalu Cepat"
                              : recommendation.meta.status.progress_fat_loss ===
                                  "REVERSE"
                                ? "Naik"
                                : "Tidak Diketahui"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Training:
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          recommendation.meta.status.training === "HIGH"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : recommendation.meta.status.training === "OK"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : recommendation.meta.status.training === "LOW"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {recommendation.meta.status.training === "HIGH"
                          ? "Tinggi"
                          : recommendation.meta.status.training === "OK"
                            ? "Cukup"
                            : recommendation.meta.status.training === "LOW"
                              ? "Rendah"
                              : "Tidak Ada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Adherence:
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          recommendation.meta.status.adherence === "HIGH"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : recommendation.meta.status.adherence === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : recommendation.meta.status.adherence === "LOW"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {recommendation.meta.status.adherence === "HIGH"
                          ? "Tinggi"
                          : recommendation.meta.status.adherence === "MEDIUM"
                            ? "Sedang"
                            : recommendation.meta.status.adherence === "LOW"
                              ? "Rendah"
                              : "Tidak Diketahui"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AnalyticsCard>
      )}

      {/* Empty State */}
      {(!weightTrend || weightTrend.data.length === 0) &&
        (!bodyComposition || bodyComposition.data.length === 0) &&
        (!bodySize || bodySize.data.length === 0) &&
        (!bmiTrend || bmiTrend.data.length === 0) &&
        (!resultTrend || resultTrend.data.length === 0) &&
        (!nutritionProgress || nutritionProgress.history.length === 0) &&
        (!recommendation || recommendation.message) && (
          <Card className="shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-lg">
                Belum ada data analytics untuk ditampilkan
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Data analytics akan muncul setelah ada beberapa pengukuran
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  )
}

export default AnalyticsTab
