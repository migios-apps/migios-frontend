import { useState } from "react"
import { MemberDetail } from "@/services/api/@types/member"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { COLOR_1, COLOR_2, COLOR_3 } from "@/constants/chart.constant"
import { Card, CardContent } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface InformasiDetailProps {
  member: MemberDetail | null
}

const chartConfigDaily = {
  sesiSelesai: {
    label: "Sesi Selesai",
    color: COLOR_1,
  },
} satisfies ChartConfig

const chartConfigArea = {
  absensi: {
    label: "Absensi",
    color: COLOR_2,
  },
} satisfies ChartConfig

const chartConfigBar = {
  hadir: {
    label: "Hadir",
    color: COLOR_1,
  },
  terlambat: {
    label: "Terlambat",
    color: COLOR_2,
  },
  absen: {
    label: "Absen",
    color: COLOR_3,
  },
} satisfies ChartConfig

const InformasiDetail: React.FC<InformasiDetailProps> = ({
  member: _member,
}) => {
  // Dummy data untuk report sesi harian
  const [dailySessionData] = useState({
    series: [
      {
        name: "Sesi Selesai",
        data: [30, 40, 45, 50, 49, 60, 70],
      },
    ],
    categories: [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ],
  })

  // Dummy data untuk absensi mingguan (chart area)
  const [weeklyAttendanceArea] = useState({
    series: [
      {
        name: "Absensi",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
    ],
    categories: [
      "Minggu 1",
      "Minggu 2",
      "Minggu 3",
      "Minggu 4",
      "Minggu 5",
      "Minggu 6",
      "Minggu 7",
    ],
  })

  // Dummy data untuk absensi mingguan (chart bar)
  const [weeklyAttendanceBar] = useState({
    series: [
      {
        name: "Hadir",
        data: [44, 55, 41, 67, 22, 43, 21],
      },
      {
        name: "Terlambat",
        data: [13, 23, 20, 8, 13, 27, 33],
      },
      {
        name: "Absen",
        data: [11, 17, 15, 15, 21, 14, 15],
      },
    ],
    categories: [
      "Minggu 1",
      "Minggu 2",
      "Minggu 3",
      "Minggu 4",
      "Minggu 5",
      "Minggu 6",
      "Minggu 7",
    ],
  })

  // Transform data untuk Recharts
  const dailyChartData = dailySessionData.categories.map((cat, idx) => ({
    day: cat,
    sesiSelesai: dailySessionData.series[0]?.data[idx] || 0,
  }))

  const areaChartData = weeklyAttendanceArea.categories.map((cat, idx) => ({
    week: cat,
    absensi: weeklyAttendanceArea.series[0]?.data[idx] || 0,
  }))

  const barChartData = weeklyAttendanceBar.categories.map((cat, idx) => ({
    week: cat,
    hadir: weeklyAttendanceBar.series[0]?.data[idx] || 0,
    terlambat: weeklyAttendanceBar.series[1]?.data[idx] || 0,
    absen: weeklyAttendanceBar.series[2]?.data[idx] || 0,
  }))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Report Sesi Harian */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-4 text-lg font-semibold">Report Sesi Harian</h4>
          <ChartContainer
            config={chartConfigDaily}
            className="h-[300px] w-full"
          >
            <BarChart
              data={dailyChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="sesiSelesai"
                fill="var(--color-sesiSelesai)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Absensi Mingguan (Area Chart) */}
      <Card>
        <CardContent className="p-4">
          <h4 className="mb-4 text-lg font-semibold">
            Absensi Mingguan (Area)
          </h4>
          <ChartContainer config={chartConfigArea} className="h-[300px] w-full">
            <AreaChart
              data={areaChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAbsensi" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-absensi)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-absensi)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                type="monotone"
                dataKey="absensi"
                stroke="var(--color-absensi)"
                fill="url(#colorAbsensi)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Absensi Mingguan (Bar Chart) */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4">
          <h4 className="mb-4 text-lg font-semibold">
            Absensi Mingguan (Detail)
          </h4>
          <ChartContainer config={chartConfigBar} className="h-[300px] w-full">
            <BarChart
              data={barChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar
                dataKey="hadir"
                fill="var(--color-hadir)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="terlambat"
                fill="var(--color-terlambat)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="absen"
                fill="var(--color-absen)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default InformasiDetail
