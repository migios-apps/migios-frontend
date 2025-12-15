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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

  return (
    <Card className="relative gap-2 p-4">
      <CardHeader className="relative flex w-full flex-col items-center justify-between p-0 md:flex-row">
        <div className="flex flex-col">
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>
            Ringkasan keseluruhan penjualan, anggota, dan kehadiran member.
          </CardDescription>
        </div>
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
                  <ChartContainer
                    config={chartConfig}
                    className="h-[390px] w-full"
                  >
                    <AreaChart
                      data={overview.attendance.data.map((item) => ({
                        date: item.date,
                        checkin: item["Check-in"] || 0,
                        checkout: item["Check-out"] || 0,
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorCheckin"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                        <linearGradient
                          id="colorCheckout"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                        minTickGap={0}
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
                ) : (
                  <ChartContainer
                    config={chartConfig}
                    className="h-[390px] w-full"
                  >
                    <AreaChart
                      data={overview[selectedCategory].data}
                      margin={{
                        top: 10,
                        right: 30,
                        left: selectedCategory === "sales" ? 30 : 0,
                        bottom: 0,
                      }}
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
                        // width={selectedCategory === "sales" ? 50 : undefined}
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
