import React from "react"
import { useFieldArray } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import {
  apiGetAvailableVouchers,
  apiValidateVoucher,
} from "@/services/api/VoucherService"
import { Ticket } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ReturnTransactionFormSchema } from "../../utils/validation"

interface VoucherTabContentProps {
  formPropsTransaction: ReturnTransactionFormSchema
  subtotal: number
  memberId?: number
  pendingVouchers: Array<{
    id: number
    code: string
    name: string
    discount_type: "percent" | "nominal"
    discount_value: number
    min_purchase?: number
    max_discount?: number
    valid_until?: string
    discount_amount: number
    eligible?: boolean
    scope?: "all" | "specific_items"
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
    discount_amount: number
    eligible?: boolean
    scope?: "all" | "specific_items"
  }) => void
}

const VoucherTabContent: React.FC<VoucherTabContentProps> = ({
  formPropsTransaction,
  subtotal,
  memberId,
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

  const { data: availableData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.availableVouchers, subtotal, memberId],
    queryFn: async () =>
      apiGetAvailableVouchers({
        subtotal,
        ...(memberId ? { member_id: memberId } : {}),
      }),
  })

  const policy = availableData?.data.policy
  const totalVouchers = availableData?.data.total ?? 0

  const apiVouchers = React.useMemo(
    () =>
      (availableData?.data.data ?? []).map((voucher) => ({
        id: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        min_purchase: Number(voucher.min_purchase),
        max_discount:
          voucher.max_discount === null || voucher.max_discount === undefined
            ? undefined
            : Number(voucher.max_discount),
        valid_until: voucher.valid_until,
        discount_amount: voucher.discount_amount,
        eligible: voucher.eligible,
        scope: voucher.scope,
        items: voucher.items ?? [],
      })),
    [availableData]
  )

  // Filter voucher berdasarkan search code
  const filteredVouchers = React.useMemo(() => {
    if (!voucherSearchCode.trim()) {
      return apiVouchers
    }
    const searchLower = voucherSearchCode.toLowerCase().trim()
    return apiVouchers.filter(
      (voucher) =>
        voucher.code.toLowerCase().includes(searchLower) ||
        voucher.name.toLowerCase().includes(searchLower)
    )
  }, [voucherSearchCode, apiVouchers])

  const cartLines = React.useMemo(
    () =>
      (watchTransaction.items ?? []).map((item) => ({
        package_id: item.package_id ?? null,
        product_id: item.product_id ?? null,
        net_amount: Number(item.sell_price ?? 0),
      })),
    [watchTransaction.items]
  )

  const matchesCart = (voucher: (typeof apiVouchers)[number]) => {
    if (voucher.scope !== "specific_items") return true
    const packageIds = voucher.items
      .map((item) => item.package_id)
      .filter(Boolean)
    const productIds = voucher.items
      .map((item) => item.product_id)
      .filter(Boolean)
    return cartLines.some(
      (line) =>
        (line.package_id && packageIds.includes(line.package_id)) ||
        (line.product_id && productIds.includes(line.product_id))
    )
  }

  const handleSelect = async (voucher: (typeof apiVouchers)[number]) => {
    if (voucher.scope !== "specific_items") {
      onSelectVoucher(voucher)
      return
    }

    try {
      const res = await apiValidateVoucher({
        code: voucher.code,
        subtotal,
        ...(memberId ? { member_id: memberId } : {}),
        items: cartLines,
      })
      onSelectVoucher({
        ...voucher,
        discount_amount: res.discount_amount,
        eligible: true,
      })
    } catch {
      return
    }
  }

  const maxPerTransaction = policy?.voucher_max_per_transaction ?? 1
  const selectedVoucherCount =
    (watchTransaction.discounts ?? []).filter(
      (item) => (item as { voucher_id?: number | null })?.voucher_id
    ).length + pendingVouchers.length
  const quotaReached = selectedVoucherCount >= maxPerTransaction

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
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Voucher Tersedia:</div>
            <span className="text-muted-foreground text-xs">
              {selectedVoucherCount}/{maxPerTransaction} voucher
            </span>
          </div>
          {quotaReached ? (
            <p className="text-muted-foreground text-xs">
              Batas voucher per transaksi sudah tercapai. Lepas salah satu untuk
              memilih yang lain.
            </p>
          ) : null}
          {filteredVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? "Memuat voucher..."
                  : policy && !policy.voucher_enabled
                    ? "Fitur voucher belum diaktifkan. Nyalakan di Pengaturan > Voucher."
                    : voucherSearchCode.trim()
                      ? "Voucher tidak ditemukan"
                      : totalVouchers > 0
                        ? `Ada ${totalVouchers} voucher di club ini, tapi tidak ada yang berlaku saat ini. Periksa tanggal mulai, masa berlaku, kuota, dan statusnya di menu Master Voucher.`
                        : "Belum ada voucher. Buat dulu di menu Master Voucher."}
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
                      ? "border-primary bg-primary/5 cursor-pointer"
                      : quotaReached || !matchesCart(voucher)
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-accent cursor-pointer"
                  }`}
                  onClick={() => {
                    if (quotaReached && !isAdded) return
                    if (!matchesCart(voucher)) return
                    void handleSelect(voucher)
                  }}
                >
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isAdded}
                        className="pointer-events-none mt-1"
                        tabIndex={-1}
                        aria-label={
                          isAdded ? "Voucher dipakai" : "Voucher tidak dipakai"
                        }
                      />
                      <div className="flex-1 space-y-2">
                        <div className="m-0 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{voucher.name}</h3>
                          <Badge variant="outline">{voucher.code}</Badge>
                          {voucher.scope === "specific_items" ? (
                            <Badge variant="secondary">
                              {matchesCart(voucher)
                                ? "Item tertentu"
                                : "Item tidak ada di keranjang"}
                            </Badge>
                          ) : null}
                          {isAdded ? <Badge>Dipakai</Badge> : null}
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
