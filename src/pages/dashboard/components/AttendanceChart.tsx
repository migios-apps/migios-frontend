import type { FC } from "react"
import dayjs from "dayjs"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type AttendanceChartProps = {
  categories: string[]
  series: Array<{
    name: string
    data: number[]
  }>
}

const chartConfig = {
  checkin: {
    label: "Check-in",
    color: "var(--primary)",
  },
  checkout: {
    label: "Check-out",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

const AttendanceChart: FC<AttendanceChartProps> = ({ categories, series }) => {
  // Transform data untuk Recharts
  const chartData = categories.map((cat, idx) => {
    const checkinData = series.find((s) =>
      s.name.toLowerCase().includes("check-in")
    )
    const checkoutData = series.find((s) =>
      s.name.toLowerCase().includes("check-out")
    )

    return {
      date: cat,
      checkin: checkinData?.data[idx] || 0,
      checkout: checkoutData?.data[idx] || 0,
    }
  })

  return (
    <ChartContainer config={chartConfig} className="h-[390px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorCheckin" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-checkin)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-checkin)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="colorCheckout" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-checkout)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-checkout)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            return dayjs(value).isValid()
              ? dayjs(value).format("DD MMM")
              : value
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return dayjs(value).isValid()
                  ? dayjs(value).format("DD MMM YYYY")
                  : value
              }}
              indicator="dot"
            />
          }
        />
        <Area
          type="natural"
          dataKey="checkout"
          stroke="var(--color-checkout)"
          fillOpacity={1}
          fill="url(#colorCheckout)"
          stackId="a"
        />
        <Area
          type="natural"
          dataKey="checkin"
          stroke="var(--color-checkin)"
          fillOpacity={1}
          fill="url(#colorCheckin)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default AttendanceChart
