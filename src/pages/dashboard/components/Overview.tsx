import type { ReactNode } from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetOverviewChart } from "@/services/api/analytic"
import dayjs from "dayjs"
import { Moneys } from "iconsax-reactjs"
import { UserCheck, UserPlus } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { getMenuShortcutDatePickerByType } from "@/hooks/use-date-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import DatePickerAIO, {
  DatePickerAIOPropsValue,
} from "@/components/ui/date-picker/date-picker-aio"
import { currencyFormat } from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import AttendanceChart from "./AttendanceChart"

type Category = "sales" | "members" | "attendance"

type StatisticCardProps = {
  title: string
  value: number | ReactNode
  icon: ReactNode
  iconClass: string
  label: Category
  compareFrom?: string | ReactNode
  active: boolean
  onClick: (label: Category) => void
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--primary)",
  },
  members: {
    label: "Members",
    color: "var(--primary)",
  },
  attendance: {
    label: "Attendance",
    color: "var(--primary)",
  },
  checkin: {
    label: "Check-in",
    color: "var(--primary)",
  },
  checkout: {
    label: "Check-out",
    color: "var(--primary)",
  },
  value: {
    label: "Value",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const StatisticCard = (props: StatisticCardProps) => {
  const { title, value, label, icon, iconClass, active, compareFrom, onClick } =
    props

  return (
    <button
      className={cn(
        "cursor-pointer rounded-2xl p-4 transition duration-150 outline-none ltr:text-left rtl:text-right",
        active
          ? "bg-background ring-border shadow-md ring-1"
          : "border-border hover:bg-accent/50 border"
      )}
      onClick={() => onClick(label)}
    >
      <div className="relative flex justify-between gap-2 md:flex-col-reverse 2xl:flex-row">
        <div>
          <div className="mb-2 text-sm font-semibold">{title}</div>
          <div className="mb-1">{value}</div>
          {compareFrom ? (
            <div className="inline-flex flex-wrap items-center gap-1">
              {compareFrom}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex max-h-12 min-h-12 max-w-12 min-w-12 items-center justify-center rounded-full text-2xl",
            iconClass
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  )
}

const Overview = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("sales")

  const defaultMenu = getMenuShortcutDatePickerByType("thisMonth").menu
  const [valueDateRangePicker, setValueDateRangePicker] =
    useState<DatePickerAIOPropsValue>({
      type: defaultMenu?.type,
      name: defaultMenu.name,
      date: [
        defaultMenu.options.defaultStartDate,
        defaultMenu.options.defaultEndDate,
      ],
    })

  const {
    data: overview,
    isLoading,
    // error,
  } = useQuery({
    queryKey: [QUERY_KEY.overview, valueDateRangePicker],
    queryFn: () =>
      apiGetOverviewChart({
        start_date: dayjs(valueDateRangePicker.date[0]).format("YYYY-MM-DD"),
        end_date: dayjs(valueDateRangePicker.date[1]).format("YYYY-MM-DD"),
      }),
    select: (res) => res.data,
    enabled: !!valueDateRangePicker,
  })

  // const isLoading = false
  // const overview = {
  //   sales: {
  //     total_sales: 102450000,
  //     categories: [
  //       "2025-12-01",
  //       "2025-12-02",
  //       "2025-12-03",
  //       "2025-12-04",
  //       "2025-12-05",
  //       "2025-12-06",
  //       "2025-12-07",
  //       "2025-12-08",
  //       "2025-12-09",
  //       "2025-12-10",
  //       "2025-12-11",
  //       "2025-12-12",
  //       "2025-12-13",
  //       "2025-12-14",
  //       "2025-12-15",
  //       "2025-12-16",
  //       "2025-12-17",
  //       "2025-12-18",
  //       "2025-12-19",
  //       "2025-12-20",
  //       "2025-12-21",
  //       "2025-12-22",
  //       "2025-12-23",
  //       "2025-12-24",
  //       "2025-12-25",
  //       "2025-12-26",
  //       "2025-12-27",
  //       "2025-12-28",
  //       "2025-12-29",
  //       "2025-12-30",
  //       "2025-12-31",
  //     ],
  //     series: [
  //       {
  //         name: "All Sales",
  //         data: [
  //           2500000, 3200000, 1800000, 4100000, 2900000, 3500000, 4800000,
  //           2100000, 3300000, 2700000, 4500000, 3100000, 2600000, 3900000,
  //           2800000, 3400000, 4200000, 2300000, 3600000, 2900000, 4700000,
  //           3000000, 2500000, 3800000, 1900000, 3100000, 4300000, 2600000,
  //           3700000, 2400000, 4600000,
  //         ],
  //       },
  //     ],
  //   },
  //   members: {
  //     total_members: 467,
  //     categories: [
  //       "2025-12-01",
  //       "2025-12-02",
  //       "2025-12-03",
  //       "2025-12-04",
  //       "2025-12-05",
  //       "2025-12-06",
  //       "2025-12-07",
  //       "2025-12-08",
  //       "2025-12-09",
  //       "2025-12-10",
  //       "2025-12-11",
  //       "2025-12-12",
  //       "2025-12-13",
  //       "2025-12-14",
  //       "2025-12-15",
  //       "2025-12-16",
  //       "2025-12-17",
  //       "2025-12-18",
  //       "2025-12-19",
  //       "2025-12-20",
  //       "2025-12-21",
  //       "2025-12-22",
  //       "2025-12-23",
  //       "2025-12-24",
  //       "2025-12-25",
  //       "2025-12-26",
  //       "2025-12-27",
  //       "2025-12-28",
  //       "2025-12-29",
  //       "2025-12-30",
  //       "2025-12-31",
  //     ],
  //     series: [
  //       {
  //         name: "Members",
  //         data: [
  //           12, 15, 8, 20, 14, 18, 25, 10, 16, 13, 22, 15, 11, 19, 14, 17, 21,
  //           9, 18, 12, 24, 16, 13, 20, 8, 15, 23, 11, 19, 10, 22,
  //         ],
  //       },
  //     ],
  //   },
  //   attendance: {
  //     total_checkin: 3045,
  //     total_checkout: 2980,
  //     categories: [
  //       "2025-12-01",
  //       "2025-12-02",
  //       "2025-12-03",
  //       "2025-12-04",
  //       "2025-12-05",
  //       "2025-12-06",
  //       "2025-12-07",
  //       "2025-12-08",
  //       "2025-12-09",
  //       "2025-12-10",
  //       "2025-12-11",
  //       "2025-12-12",
  //       "2025-12-13",
  //       "2025-12-14",
  //       "2025-12-15",
  //       "2025-12-16",
  //       "2025-12-17",
  //       "2025-12-18",
  //       "2025-12-19",
  //       "2025-12-20",
  //       "2025-12-21",
  //       "2025-12-22",
  //       "2025-12-23",
  //       "2025-12-24",
  //       "2025-12-25",
  //       "2025-12-26",
  //       "2025-12-27",
  //       "2025-12-28",
  //       "2025-12-29",
  //       "2025-12-30",
  //       "2025-12-31",
  //     ],
  //     series: [
  //       {
  //         name: "Check-in",
  //         data: [
  //           85, 92, 78, 110, 95, 105, 130, 82, 98, 88, 115, 94, 80, 108, 90,
  //           102, 125, 75, 100, 85, 128, 96, 84, 112, 70, 93, 120, 86, 106, 78,
  //           122,
  //         ],
  //       },
  //       {
  //         name: "Check-out",
  //         data: [
  //           82, 90, 75, 108, 93, 102, 128, 80, 95, 85, 112, 91, 78, 105, 88,
  //           100, 122, 72, 98, 82, 125, 94, 81, 110, 68, 90, 118, 84, 104, 75,
  //           120,
  //         ],
  //       },
  //     ],
  //   },
  // }

  return (
    <Card className="gap-2 p-4">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle>Overview</CardTitle>
          <DatePickerAIO
            variant="range"
            align="end"
            options={[
              "thisWeek",
              "sevenDaysAgo",
              "thisMonth",
              "lastMonth",
              "thisYear",
              "lastYear",
              "custom",
            ]}
            value={valueDateRangePicker}
            onChange={(value) => {
              setValueDateRangePicker(value)
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <>
            <div className="bg-muted/50 grid grid-cols-1 gap-4 rounded-2xl p-3 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border-border cursor-pointer rounded-2xl border p-4"
                >
                  <div className="relative flex justify-between gap-2 md:flex-col-reverse 2xl:flex-row">
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="mb-1 h-8 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Skeleton className="h-[390px] w-full rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted/50 grid grid-cols-1 gap-4 rounded-2xl p-3 md:grid-cols-3">
              <StatisticCard
                title="Total penjualan"
                value={
                  <h3 className="text-2xl font-semibold">
                    {currencyFormat(overview?.sales.total_sales || 0)}
                  </h3>
                }
                iconClass="bg-primary/10 text-primary"
                icon={<Moneys className="h-8 w-8" variant="Bulk" />}
                label="sales"
                active={selectedCategory === "sales"}
                compareFrom={
                  <span className="flex flex-col text-sm">
                    {dayjs(valueDateRangePicker.date[0]).format("DD MMM YYYY")}{" "}
                    -{" "}
                    {dayjs(valueDateRangePicker.date[1]).format("DD MMM YYYY")}
                  </span>
                }
                onClick={setSelectedCategory}
              />
              <StatisticCard
                title="Total member baru"
                value={
                  <h3 className="text-2xl font-semibold">
                    {(overview?.members.total_members || 0).toLocaleString(
                      "id-ID"
                    )}
                  </h3>
                }
                iconClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                icon={<UserPlus className="h-8 w-8" />}
                label="members"
                active={selectedCategory === "members"}
                compareFrom={
                  <span className="flex flex-col text-sm">
                    {dayjs(valueDateRangePicker.date[0]).format("DD MMM YYYY")}{" "}
                    -{" "}
                    {dayjs(valueDateRangePicker.date[1]).format("DD MMM YYYY")}
                  </span>
                }
                onClick={setSelectedCategory}
              />
              <StatisticCard
                title="Total kehadiran"
                value={
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-semibold">
                        {overview?.attendance.total_checkin}
                      </h3>
                      <p className="text-sm">Check-in</p>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-semibold">
                        {overview?.attendance.total_checkout}
                      </h3>
                      <p className="text-sm">Check-out</p>
                    </div>
                  </div>
                }
                iconClass="bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
                icon={<UserCheck className="h-8 w-8" />}
                label="attendance"
                active={selectedCategory === "attendance"}
                onClick={setSelectedCategory}
              />
            </div>
            {overview && (
              <div className="mt-6">
                {selectedCategory === "attendance" ? (
                  <AttendanceChart
                    categories={overview.attendance.categories}
                    series={overview.attendance.series}
                  />
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[390px] w-full"
                  >
                    <AreaChart
                      data={overview[selectedCategory].categories.map(
                        (cat, idx) => ({
                          date: cat,
                          value:
                            overview[selectedCategory].series[0]?.data[idx] ||
                            0,
                        })
                      )}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-value)"
                            stopOpacity={1.0}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-value)"
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
                        minTickGap={0}
                        tickFormatter={(value) => {
                          return dayjs(value).isValid()
                            ? dayjs(value).format("DD MMM")
                            : value
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => {
                          if (selectedCategory === "sales") {
                            return currencyFormat(value)
                          }
                          return value.toLocaleString("id-ID")
                        }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => {
                              return dayjs(value).isValid()
                                ? dayjs(value).format("DD MMM YYYY")
                                : value
                            }}
                            formatter={(value) => {
                              if (selectedCategory === "sales") {
                                return currencyFormat(Number(value))
                              }
                              return value
                            }}
                            indicator="dot"
                          />
                        }
                      />
                      <Area
                        type="natural"
                        dataKey="value"
                        stroke="var(--color-value)"
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default Overview
