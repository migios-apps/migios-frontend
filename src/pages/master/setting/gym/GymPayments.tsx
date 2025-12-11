import { useState } from "react"
import { Check, Clock, CreditCard, Download, Eye, X } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { currencyFormat } from "@/components/ui/input-currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import LayoutGymSetting from "./Layout"

interface PaymentHistory {
  id: string
  invoiceNumber: string
  planName: string
  planType: "basic" | "professional" | "enterprise"
  amount: number
  paymentDate: string
  dueDate: string
  status: "paid" | "pending" | "failed" | "cancelled"
  paymentMethod: string
  billingPeriod: string
  gymLocation: string
  memberCount: number
  features: string[]
}

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    planName: "Professional Plan",
    planType: "professional",
    amount: 2500000,
    paymentDate: "2024-01-15",
    dueDate: "2024-02-15",
    status: "paid",
    paymentMethod: "Transfer Bank",
    billingPeriod: "Bulanan",
    gymLocation: "FitZone Jakarta Pusat",
    memberCount: 500,
    features: ["Unlimited Members", "Advanced Analytics", "Priority Support"],
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    planName: "Enterprise Plan",
    planType: "enterprise",
    amount: 25000000,
    paymentDate: "2024-01-10",
    dueDate: "2025-01-10",
    status: "paid",
    paymentMethod: "Credit Card",
    billingPeriod: "Tahunan",
    gymLocation: "PowerGym Surabaya",
    memberCount: 1000,
    features: ["Unlimited Members", "Custom Features", "24/7 Support"],
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    planName: "Basic Plan",
    planType: "basic",
    amount: 750000,
    paymentDate: "2024-02-01",
    dueDate: "2024-03-01",
    status: "pending",
    paymentMethod: "Transfer Bank",
    billingPeriod: "Bulanan",
    gymLocation: "HealthClub Bandung",
    memberCount: 100,
    features: ["Up to 100 Members", "Basic Analytics"],
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    planName: "Professional Plan",
    planType: "professional",
    amount: 2500000,
    paymentDate: "2024-01-20",
    dueDate: "2024-02-20",
    status: "failed",
    paymentMethod: "Credit Card",
    billingPeriod: "Bulanan",
    gymLocation: "FitZone Jakarta Selatan",
    memberCount: 300,
    features: ["Unlimited Members", "Advanced Analytics", "Priority Support"],
  },
]

const GymPayments = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [planFilter, setPlanFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistory | null>(
    null
  )

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        variant: "default" as const,
        label: "Lunas",
        icon: Check,
      },
      pending: {
        variant: "secondary" as const,
        label: "Menunggu",
        icon: Clock,
      },
      failed: {
        variant: "destructive" as const,
        label: "Gagal",
        icon: X,
      },
      cancelled: {
        variant: "outline" as const,
        label: "Dibatalkan",
        icon: X,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <IconComponent className="size-3" />
        {config.label}
      </Badge>
    )
  }

  const getPlanBadge = (planType: string) => {
    const planConfig = {
      basic: {
        variant: "secondary" as const,
        label: "Basic",
      },
      professional: {
        variant: "default" as const,
        label: "Professional",
      },
      enterprise: {
        variant: "outline" as const,
        label: "Enterprise",
      },
    }

    const config = planConfig[planType as keyof typeof planConfig]

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  const filteredPayments = PAYMENT_HISTORY.filter((payment) => {
    const matchesSearch =
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.gymLocation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || payment.status === statusFilter
    const matchesPlan = !planFilter || payment.planType === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  return (
    <LayoutGymSetting>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              History Pembayaran
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola dan pantau history perpanjangan plan gym Anda
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              type="text"
              placeholder="Cari invoice, plan, atau lokasi..."
              value={searchTerm}
              className="flex-1"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) =>
                setStatusFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={planFilter || "all"}
              onValueChange={(value) =>
                setPlanFilter(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Plan</SelectItem>
                <SelectItem value="basic">Basic Plan</SelectItem>
                <SelectItem value="professional">Professional Plan</SelectItem>
                <SelectItem value="enterprise">Enterprise Plan</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={dateFilter}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDateFilter(e.target.value)
              }
            />
          </CardContent>
        </Card>

        {/* Payment History Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Invoice
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Plan
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Lokasi Gym
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Jumlah
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Tanggal Bayar
                    </th>
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Status
                    </th>
                    <th className="text-foreground px-4 py-3 text-center font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-border hover:bg-muted/50 border-b"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-foreground font-medium">
                            {payment.invoiceNumber}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {payment.billingPeriod}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-foreground font-medium">
                            {payment.planName}
                          </div>
                          {getPlanBadge(payment.planType)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-foreground">
                            {payment.gymLocation}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {payment.memberCount} members
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground font-semibold">
                          {currencyFormat(payment.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-foreground">
                            {dayjs(payment.paymentDate).format("DD-MM-YYYY")}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            Jatuh tempo:{" "}
                            {dayjs(payment.dueDate).format("DD-MM-YYYY")}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye className="size-4" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground">
                    Tidak ada data pembayaran yang ditemukan
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Detail Modal */}
        <Dialog
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pembayaran</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            {selectedPayment && (
              <>
                <div className="space-y-6">
                  {/* Invoice Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Nomor Invoice
                      </label>
                      <div className="text-foreground">
                        {selectedPayment.invoiceNumber}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div className="border-border border-t pt-4">
                    <h4 className="text-foreground mb-3 font-medium">
                      Informasi Plan
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Nama Plan
                        </label>
                        <div className="text-foreground">
                          {selectedPayment.planName}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Periode Billing
                        </label>
                        <div className="text-foreground">
                          {selectedPayment.billingPeriod}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Lokasi Gym
                        </label>
                        <div className="text-foreground">
                          {selectedPayment.gymLocation}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Jumlah Member
                        </label>
                        <div className="text-foreground">
                          {selectedPayment.memberCount} members
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-border border-t pt-4">
                    <h4 className="text-foreground mb-3 font-medium">
                      Informasi Pembayaran
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Jumlah Pembayaran
                        </label>
                        <div className="text-foreground text-lg font-semibold">
                          {currencyFormat(selectedPayment.amount)}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Metode Pembayaran
                        </label>
                        <div className="text-foreground flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {selectedPayment.paymentMethod}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Tanggal Pembayaran
                        </label>
                        <div className="text-foreground">
                          {dayjs(selectedPayment.paymentDate).format(
                            "DD-MM-YYYY"
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Tanggal Jatuh Tempo
                        </label>
                        <div className="text-foreground">
                          {dayjs(selectedPayment.dueDate).format("DD-MM-YYYY")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="border-border border-t pt-4">
                    <h4 className="text-foreground mb-3 font-medium">
                      Fitur yang Disertakan
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPayment.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-border mt-6 flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPayment(null)}
                  >
                    Tutup
                  </Button>
                  <Button>
                    <Download className="mr-2 size-4" />
                    Download Invoice
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutGymSetting>
  )
}

export default GymPayments
