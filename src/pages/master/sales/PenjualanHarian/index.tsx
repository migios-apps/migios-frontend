import { useState } from "react"
import dayjs from "dayjs"
import { Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import SalesLayout from "../Layout"

type TransactionData = {
  item_name: string
  total_sales: number | null
  total_returns: number | null
  gross_revenue: number | null
}

const PenjualanHarian = () => {
  const [selectedDate] = useState(new Date())
  const [useInvoiceDate, setUseInvoiceDate] = useState(false)

  // Dummy data - replace with actual API data
  const transactionData: TransactionData[] = [
    {
      item_name: "Membership",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "PT Program",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Classes",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Products",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Vouchers",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    { item_name: "Freeze", total_sales: 0, total_returns: 0, gross_revenue: 0 },
    {
      item_name: "Transfer member",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Sales by Vouchers Redeem",
      total_sales: 0,
      total_returns: null,
      gross_revenue: 0,
    },
    {
      item_name: "Gross Total Sales",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Net Total Sales",
      total_sales: 0,
      total_returns: 0,
      gross_revenue: 0,
    },
    {
      item_name: "Total Discount In Sales",
      total_sales: null,
      total_returns: null,
      gross_revenue: 0,
    },
    {
      item_name: "Total Sales Outstanding",
      total_sales: null,
      total_returns: null,
      gross_revenue: 0,
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  return (
    <SalesLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
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
            <div className="flex items-center gap-2">
              <Switch
                id="invoice-date"
                checked={useInvoiceDate}
                onCheckedChange={setUseInvoiceDate}
              />
              <Label htmlFor="invoice-date" className="text-sm">
                Berdasarkan tanggal invoice
              </Label>
            </div>

            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {dayjs(selectedDate).format("DD MMMM YYYY")}
            </Button>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipe Item</TableHead>
                    <TableHead className="text-right">
                      Total Penjualan
                    </TableHead>
                    <TableHead className="text-right">
                      Jumlah Pengembalian
                    </TableHead>
                    <TableHead className="text-right">
                      Pendapatan Kotor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionData.map((item) => (
                    <TableRow key={item.item_name}>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.total_sales === null ? "" : item.total_sales}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.total_returns === null ? "" : item.total_returns}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.gross_revenue === null
                          ? ""
                          : formatCurrency(item.gross_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              </CardContent>
            </Card>

            {/* Pembayaran Chart */}
            <Card className="gap-1 shadow-none">
              <CardHeader>
                <CardTitle>Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SalesLayout>
  )
}

export default PenjualanHarian
