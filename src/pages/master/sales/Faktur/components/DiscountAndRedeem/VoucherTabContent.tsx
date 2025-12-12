import React from "react"
import { useFieldArray } from "react-hook-form"
import dayjs from "dayjs"
import { Ticket } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReturnTransactionFormSchema } from "../../utils/validation"

interface VoucherTabContentProps {
  formPropsTransaction: ReturnTransactionFormSchema
  pendingVouchers: Array<{
    id: number
    code: string
    name: string
    discount_type: "percent" | "nominal"
    discount_value: number
    min_purchase?: number
    max_discount?: number
    valid_until?: string
  }>
  onSelectVoucher: (voucher: {
    id: number
    code: string
    name: string
    discount_type: "percent" | "nominal"
    discount_value: number
    min_purchase?: number
    max_discount?: number
    valid_until?: string
  }) => void
}

const VoucherTabContent: React.FC<VoucherTabContentProps> = ({
  formPropsTransaction,
  pendingVouchers,
  onSelectVoucher,
}) => {
  const { watch, control } = formPropsTransaction
  const watchTransaction = watch()
  const { fields: discountFields } = useFieldArray({
    control,
    name: "discounts",
  })

  // State untuk search voucher
  const [voucherSearchCode, setVoucherSearchCode] = React.useState<string>("")

  // Dummy list voucher
  const dummyVouchers = React.useMemo(
    () => [
      {
        id: 1,
        code: "WELCOME10",
        name: "Welcome Discount",
        discount_type: "percent" as const,
        discount_value: 10,
        min_purchase: 100000,
        max_discount: 50000,
        valid_until: "2024-12-31",
      },
      {
        id: 2,
        code: "FLASH50",
        name: "Flash Sale",
        discount_type: "percent" as const,
        discount_value: 50,
        min_purchase: 200000,
        max_discount: 100000,
        valid_until: "2024-12-31",
      },
      {
        id: 3,
        code: "CASHBACK25K",
        name: "Cashback Special",
        discount_type: "nominal" as const,
        discount_value: 25000,
        min_purchase: 150000,
        valid_until: "2024-12-31",
      },
      {
        id: 4,
        code: "NEWYEAR30",
        name: "New Year Special",
        discount_type: "percent" as const,
        discount_value: 30,
        min_purchase: 300000,
        max_discount: 150000,
        valid_until: "2024-12-31",
      },
      {
        id: 5,
        code: "VIP100K",
        name: "VIP Discount",
        discount_type: "nominal" as const,
        discount_value: 100000,
        min_purchase: 500000,
        valid_until: "2024-12-31",
      },
    ],
    []
  )

  // Filter voucher berdasarkan search code
  const filteredVouchers = React.useMemo(() => {
    if (!voucherSearchCode.trim()) {
      return dummyVouchers
    }
    const searchLower = voucherSearchCode.toLowerCase().trim()
    return dummyVouchers.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(searchLower) ||
        voucher.name.toLowerCase().includes(searchLower)
    )
  }, [voucherSearchCode, dummyVouchers])

  const isVoucherAdded = (voucherCode: string) => {
    const isInForm = discountFields.some((_, index) => {
      const discount = watchTransaction.discounts?.[index]
      const discountWithVoucher = discount as any
      return discountWithVoucher?.voucher_code === voucherCode
    })
    const isInPending = pendingVouchers.some((v) => v.code === voucherCode)
    return isInForm || isInPending
  }

  return (
    <ScrollArea className="h-full px-2 pr-3">
      <div className="space-y-6 px-1 pb-4">
        {/* Input Search Voucher Code */}
        <div className="space-y-2">
          <FormLabel>
            Cari Voucher <span className="text-destructive">*</span>
          </FormLabel>
          <div className="relative">
            <Ticket className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Masukkan kode promo"
              value={voucherSearchCode}
              onChange={(e) => setVoucherSearchCode(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* List Voucher Available */}
        <div className="space-y-2">
          <div className="text-sm font-semibold">Voucher Tersedia:</div>
          {filteredVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground text-sm">
                {voucherSearchCode.trim()
                  ? "Voucher tidak ditemukan"
                  : "Tidak ada voucher tersedia"}
              </p>
            </div>
          ) : (
            filteredVouchers.map((voucher) => {
              const isAdded = isVoucherAdded(voucher.code)

              return (
                <Card
                  key={voucher.id}
                  className={`p-0 shadow-none transition-colors ${
                    isAdded
                      ? "border-primary cursor-pointer"
                      : "hover:bg-accent cursor-pointer"
                  }`}
                  onClick={() => onSelectVoucher(voucher)}
                >
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="m-0 flex items-center gap-2">
                          <h3 className="font-semibold">{voucher.name}</h3>
                          <Badge variant="outline">{voucher.code}</Badge>
                        </div>

                        <div className="text-muted-foreground m-0 text-sm">
                          {voucher.discount_type === "percent"
                            ? `Diskon ${voucher.discount_value}%`
                            : `Diskon ${currencyFormat(voucher.discount_value)}`}
                        </div>

                        {voucher.min_purchase && (
                          <div className="text-muted-foreground text-xs">
                            Min. pembelian:{" "}
                            {currencyFormat(voucher.min_purchase)}
                          </div>
                        )}

                        {voucher.max_discount && (
                          <div className="text-muted-foreground text-xs">
                            Maks. diskon: {currencyFormat(voucher.max_discount)}
                          </div>
                        )}

                        {voucher.valid_until && (
                          <div className="text-muted-foreground text-xs">
                            Berlaku hingga:{" "}
                            {dayjs(voucher.valid_until).format("DD MMM YYYY")}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

export default VoucherTabContent
