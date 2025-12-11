import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ReportSalesType } from "@/services/api/@types/sales"
import {
  apiReportSales,
  apiReportSalesByRekening,
} from "@/services/api/SalesService"
import dayjs from "dayjs"
import { ChevronDown } from "lucide-react"
import { Pie, PieChart } from "recharts"
import { getMenuShortcutDatePickerByType } from "@/hooks/use-date-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import DatePickerAIO, {
  DatePickerAIOPropsValue,
} from "@/components/ui/date-picker/date-picker-aio"
import { currencyFormat } from "@/components/ui/input-currency"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import SalesLayout from "../Layout"

const PenjualanHarianSkeleton = () => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-2">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-24" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-60" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col gap-6">
        {/* Table Skeleton */}
        <Card className="gap-0 shadow-none">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart 1 */}
          <Card className="gap-1 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Chart 2 */}
          <Card className="gap-1 shadow-none">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const PenjualanHarian = () => {
  const defaultMenu = getMenuShortcutDatePickerByType("today").menu
  const [valueDateRangePicker, setValueDateRangePicker] =
    useState<DatePickerAIOPropsValue>({
      type: defaultMenu?.type,
      name: defaultMenu.name,
      date: [
        defaultMenu.options.defaultStartDate,
        defaultMenu.options.defaultEndDate,
      ],
    })
  const [useInvoiceDate, setUseInvoiceDate] = useState(false)

  // Fetch report sales data
  const {
    data: reportData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["report-sales", valueDateRangePicker, useInvoiceDate],
    queryFn: async () => {
      const res = await apiReportSales({
        start_date: dayjs(valueDateRangePicker.date[0]).format("YYYY-MM-DD"),
        end_date: dayjs(valueDateRangePicker.date[1]).format("YYYY-MM-DD"),
        use_invoice_date: useInvoiceDate,
      })
      return res.data
    },
    enabled: !!valueDateRangePicker,
  })

  // Fetch report sales by rekening data
  const { data: reportByRekeningData } = useQuery({
    queryKey: [
      "report-sales-by-rekening",
      valueDateRangePicker,
      useInvoiceDate,
    ],
    queryFn: async () => {
      const res = await apiReportSalesByRekening({
        start_date: dayjs(valueDateRangePicker.date[0]).format("YYYY-MM-DD"),
        end_date: dayjs(valueDateRangePicker.date[1]).format("YYYY-MM-DD"),
        use_invoice_date: useInvoiceDate,
      })
      return res.data
    },
    enabled: !!valueDateRangePicker,
  })

  const transactionData: ReportSalesType[] = reportData || [
    {
      item_name: "Membership",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "PT Program",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Classes",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Products",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Freeze",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Transfer member",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Vouchers Redeem",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Gross Total Sales",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Net Total Sales",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Total Discount In Sales",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
    {
      item_name: "Total Sales Outstanding",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
      fgross_revenue: currencyFormat(0),
    },
  ]

  const chartKeys: Record<string, string> = {
    Membership: "membership",
    "PT Program": "pt-program",
    Classes: "classes",
    Products: "products",
    Freeze: "freeze",
    "Transfer member": "transfer-member",
  }

  const chartData = transactionData
    .filter((item) => chartKeys[item.item_name])
    .map((item) => {
      const key = chartKeys[item.item_name]
      return {
        dataKey: key,
        amount: item.gross_revenue || 0,
        famount: item.fgross_revenue || "0",
        fill: `var(--color-${key})`,
      }
    })
  const chartConfig = {
    amount: {
      label: "Pendapatan",
      color: "var(--color-primary)",
    },
    membership: {
      label: "Membership",
      color: "var(--chart-1)",
    },
    "pt-program": {
      label: "PT Program",
      color: "var(--chart-2)",
    },
    classes: {
      label: "Classes",
      color: "var(--chart-3)",
    },
    products: {
      label: "Products",
      color: "var(--chart-4)",
    },
    freeze: {
      label: "Freeze",
      color: "var(--chart-5)",
    },
    "transfer-member": {
      label: "Transfer member",
      color: "var(--primary)",
    },
  } satisfies ChartConfig

  const chartDataPayment = (reportByRekeningData || []).map((item, index) => ({
    dataKey: item.rekening_name,
    amount: item.total_payment,
    famount: item.ftotal_payment,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  const chartConfigPayment = (reportByRekeningData || []).reduce(
    (acc, item, index) => {
      acc[item.rekening_name] = {
        label: item.rekening_name,
        color: `var(--chart-${(index % 5) + 1})`,
      }
      return acc
    },
    {
      amount: {
        label: "Pembayaran",
        color: "var(--color-primary)",
      },
    } as ChartConfig
  )

  return (
    <SalesLayout>
      {isLoading ? (
        <PenjualanHarianSkeleton />
      ) : (
        <div className="mx-auto flex max-w-5xl flex-col gap-2">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="invoice-date-mode"
                  checked={useInvoiceDate}
                  onCheckedChange={setUseInvoiceDate}
                />
                <Label htmlFor="invoice-date-mode">Use Invoice Date</Label>
              </div>
              <DatePickerAIO
                variant="range"
                align="end"
                options={[
                  "today",
                  "yesterday",
                  "thisWeek",
                  "sevenDaysAgo",
                  "thisMonth",
                  "lastMonth",
                  "custom",
                ]}
                value={valueDateRangePicker}
                onChange={(value) => {
                  setValueDateRangePicker(value)
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6">
            {/* Transaksi Table */}
            <Card className="gap-0 shadow-none">
              <CardHeader>
                <CardTitle>Transaksi</CardTitle>
              </CardHeader>
              <CardContent>
                {isError ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-destructive text-sm">
                      Error: {error?.message || "Gagal memuat data"}
                    </p>
                  </div>
                ) : (
                  <Table className="border-collapse">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="border-r border-b px-4 py-2 font-bold last:border-r-0">
                          Tipe Item
                        </TableHead>
                        <TableHead className="border-r border-b px-4 py-2 text-right font-bold last:border-r-0">
                          Total Penjualan
                        </TableHead>
                        <TableHead className="border-r border-b px-4 py-2 text-right font-bold last:border-r-0">
                          Jumlah Pengembalian
                        </TableHead>
                        <TableHead className="border-r border-b px-4 py-2 text-right font-bold last:border-r-0">
                          Pendapatan Kotor
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr:last-child_td]:border-b-0">
                      {transactionData.map((item, index) => (
                        <TableRow
                          key={item.item_name}
                          className={index % 2 === 0 ? "bg-accent" : ""}
                        >
                          <TableCell className="border-r border-b px-4 py-2 font-medium last:border-r-0">
                            {item.item_name}
                          </TableCell>
                          <TableCell className="border-r border-b px-4 py-2 text-right last:border-r-0">
                            {item.total_sales === null ? "" : item.total_sales}
                          </TableCell>
                          <TableCell className="border-r border-b px-4 py-2 text-right last:border-r-0">
                            {item.total_returns === null
                              ? ""
                              : item.total_returns}
                          </TableCell>
                          <TableCell className="border-r border-b px-4 py-2 text-right last:border-r-0">
                            {item.fgross_revenue}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Charts Grid - 2 Columns */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Pendapatan Kotor Chart */}
              <Card className="gap-1 shadow-none">
                <CardHeader>
                  <CardTitle>Pendapatan Kotor</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.reduce((acc, curr) => acc + curr.amount, 0) > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[350px] pb-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              className="w-[150px]"
                              formatter={(_value, name, item, _index) => (
                                <div className="flex w-full items-start gap-2">
                                  <div
                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                    style={
                                      {
                                        "--color-bg": `var(--color-${name})`,
                                      } as React.CSSProperties
                                    }
                                  />
                                  <div className="flex min-w-[130px] flex-col gap-1 text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      {chartConfig[
                                        name as keyof typeof chartConfig
                                      ]?.label || name}
                                    </span>
                                    <span className="text-foreground font-mono font-medium tabular-nums">
                                      {item.payload.famount}
                                    </span>
                                  </div>
                                </div>
                              )}
                            />
                          }
                        />
                        <Pie
                          isAnimationActive={true}
                          outerRadius={80}
                          data={chartData}
                          dataKey="amount"
                          label={({ payload }) => payload.famount}
                          nameKey="dataKey"
                        />
                        <ChartLegend
                          content={<ChartLegendContent nameKey="dataKey" />}
                          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                      <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 3v18h18" />
                          <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                        <p className="text-sm">No Result</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pembayaran Chart */}
              <Card className="gap-1 shadow-none">
                <CardHeader>
                  <CardTitle>Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartDataPayment.reduce(
                    (acc, curr) => acc + curr.amount,
                    0
                  ) > 0 ? (
                    <ChartContainer
                      config={chartConfigPayment}
                      className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[350px] pb-0"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              className="w-[150px]"
                              formatter={(_value, name, item, _index) => (
                                <div className="flex w-full items-start gap-2">
                                  <div
                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                                    style={
                                      {
                                        "--color-bg": item.payload.fill,
                                      } as React.CSSProperties
                                    }
                                  />
                                  <div className="flex min-w-[130px] flex-col gap-1 text-xs">
                                    <span className="text-muted-foreground font-medium">
                                      {chartConfigPayment[
                                        name as keyof typeof chartConfigPayment
                                      ]?.label || name}
                                    </span>
                                    <span className="text-foreground font-mono font-medium tabular-nums">
                                      {item.payload.famount}
                                    </span>
                                  </div>
                                </div>
                              )}
                            />
                          }
                        />
                        <Pie
                          isAnimationActive={true}
                          outerRadius={80}
                          data={chartDataPayment}
                          dataKey="amount"
                          label={({ payload }) => payload.famount}
                          nameKey="dataKey"
                        />
                        <ChartLegend
                          content={<ChartLegendContent nameKey="dataKey" />}
                          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                      <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 3v18h18" />
                          <path d="m19 9-5 5-4-4-3 3" />
                        </svg>
                        <p className="text-sm">No Result</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </SalesLayout>
  )
}

export default PenjualanHarian
