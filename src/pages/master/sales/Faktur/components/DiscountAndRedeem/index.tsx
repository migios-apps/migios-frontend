import React from "react"
import { useFieldArray } from "react-hook-form"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import { ReturnTransactionFormSchema } from "../../utils/validation"
import DiscountTabContent from "./DiscountTabContent"
import LoyaltyTabContent from "./LoyaltyTabContent"
import VoucherTabContent from "./VoucherTabContent"

interface DiscountAndRedeemProps {
  open: boolean
  onClose: () => void
  memberCode?: string | null
  formPropsTransaction: ReturnTransactionFormSchema
}

const DiscountAndRedeem: React.FC<DiscountAndRedeemProps> = ({
  open,
  onClose,
  memberCode,
  formPropsTransaction,
}) => {
  const { watch, control, setValue } = formPropsTransaction
  const watchTransaction = watch()
  const { append: appendTransactionItem } = useFieldArray({
    control,
    name: "items",
  })
  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control,
    name: "discounts",
  })

  // State lokal untuk pending changes (belum di-save)
  const [pendingDiscount, setPendingDiscount] = React.useState<{
    type: "default" | "custom" | null
    discount_type?: "percent" | "nominal"
    discount_amount?: number
  } | null>(null)
  const [pendingRedeemItems, setPendingRedeemItems] = React.useState<
    Array<LoyaltyType>
  >([])
  const [pendingVouchers, setPendingVouchers] = React.useState<
    Array<{
      id: number
      code: string
      name: string
      discount_type: "percent" | "nominal"
      discount_value: number
      min_purchase?: number
      max_discount?: number
      valid_until?: string
    }>
  >([])

  // State untuk custom discount input
  const [customDiscountType, setCustomDiscountType] = React.useState<
    "percent" | "nominal"
  >("percent")
  const [customDiscountValue, setCustomDiscountValue] = React.useState<
    number | string | null
  >(null)
  const [selectedDefaultDiscount, setSelectedDefaultDiscount] =
    React.useState<string>("")

  // Reset semua state lokal ketika sheet dibuka
  React.useEffect(() => {
    if (open) {
      setPendingDiscount(null)
      setPendingRedeemItems([])
      setPendingVouchers([])
      setCustomDiscountValue(null)
      setCustomDiscountType("percent")
      setSelectedDefaultDiscount("")
    }
  }, [open])

  const loyaltyRedeemItems = React.useMemo(() => {
    const items = watchTransaction.loyalty_redeem_items || []
    return items as LoyaltyType[]
  }, [watchTransaction.loyalty_redeem_items])

  const handleSelectReward = (reward: LoyaltyType) => {
    // Cek apakah reward sudah ditambahkan (di form state atau pending)
    const isAlreadyAddedInForm = loyaltyRedeemItems.some(
      (item) => item.id === reward.id
    )
    const isAlreadyAddedInPending = pendingRedeemItems.some(
      (item) => item.id === reward.id
    )

    if (isAlreadyAddedInPending) {
      // Unselect: hapus dari pending
      setPendingRedeemItems(
        pendingRedeemItems.filter((item) => item.id !== reward.id)
      )
      return
    }

    if (isAlreadyAddedInForm) {
      // Jika sudah di form state, tidak bisa di-unselect dari pending
      return
    }

    // Select: tambahkan original LoyaltyType ke pending
    setPendingRedeemItems([...pendingRedeemItems, reward])
  }

  const handleSelectVoucher = (voucher: {
    id: number
    code: string
    name: string
    discount_type: "percent" | "nominal"
    discount_value: number
    min_purchase?: number
    max_discount?: number
    valid_until?: string
  }) => {
    // Cek apakah voucher sudah ditambahkan (di form state atau pending)
    const isAlreadyAddedInForm = discountFields.some((_, index) => {
      const discount = watchTransaction.discounts?.[index]
      const discountWithVoucher = discount as any
      return discountWithVoucher?.voucher_code === voucher.code
    })
    const isAlreadyAddedInPending = pendingVouchers.some(
      (v) => v.id === voucher.id
    )

    if (isAlreadyAddedInPending) {
      // Unselect: hapus dari pending
      setPendingVouchers(pendingVouchers.filter((v) => v.id !== voucher.id))
      return
    }

    if (isAlreadyAddedInForm) {
      // Jika sudah di form state, tidak bisa di-unselect dari pending
      return
    }

    // Select: tambahkan ke pending
    setPendingVouchers([...pendingVouchers, voucher])
  }

  const handleSave = () => {
    // Apply pending discount ke form state
    if (pendingDiscount) {
      // Hapus discount manual yang sudah ada (jika ada)
      const manualDiscountFields = discountFields.filter(
        (field) => field.loyalty_reward_id === null
      )
      manualDiscountFields.forEach((field) => {
        const index = discountFields.findIndex((f) => f.id === field.id)
        if (index !== -1) {
          removeDiscount(index)
        }
      })

      // Tambahkan pending discount
      if (pendingDiscount.discount_type && pendingDiscount.discount_amount) {
        appendDiscount({
          discount_type: pendingDiscount.discount_type,
          discount_amount: pendingDiscount.discount_amount,
          loyalty_reward_id: null,
        })
      }
    }

    // Apply pending vouchers ke form state (sebagai discount)
    if (pendingVouchers.length > 0) {
      pendingVouchers.forEach((voucher) => {
        appendDiscount({
          discount_type: voucher.discount_type,
          discount_amount: voucher.discount_value,
          loyalty_reward_id: null,
          voucher_code: voucher.code,
        } as any)
      })
    }

    // Apply pending redeem items ke form state
    if (pendingRedeemItems.length > 0) {
      const currentRedeemItems = (watchTransaction.loyalty_redeem_items ||
        []) as LoyaltyType[]
      setValue(
        "loyalty_redeem_items",
        [...currentRedeemItems, ...pendingRedeemItems] as any,
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      )

      // Jika ada reward type = discount, tambahkan discount ke array discounts
      pendingRedeemItems.forEach((reward) => {
        if (
          reward.type === "discount" &&
          reward.discount_type &&
          reward.discount_value &&
          reward.discount_value > 0
        ) {
          appendDiscount({
            discount_type: reward.discount_type as "percent" | "nominal",
            discount_amount: reward.discount_value,
            loyalty_reward_id: reward.id,
          })
        }

        // Tambahkan free items ke transaction items jika type = free_item
        if (reward.type === "free_item" && reward.items) {
          reward.items.forEach((item) => {
            if (item.package_id) {
              appendTransactionItem({
                item_type: "package",
                package_id: item.package_id,
                product_id: null,
                name: item.name || "",
                quantity: item.quantity,
                price: item.price || 0,
                sell_price: item.price || 0,
                discount_type: item.discount_type || "nominal",
                discount: item.discount || 0,
                duration: item.duration || null,
                duration_type: item.duration_type || null,
                session_duration: item.session_duration || null,
                extra_session: item.extra_session || 0,
                extra_day: item.extra_day || 0,
                start_date: new Date(),
                notes: `Free item from loyalty reward: ${reward.name}`,
                is_promo: 0,
                loyalty_reward_id: reward.id,
                loyalty_reward_name: reward.name,
                loyalty_point: null,
                source_from: "redeem_item",
                allow_all_trainer: item.allow_all_trainer || false,
                package_type: item.type || null,
                classes: item.classes || [],
                instructors: [],
                trainers: null,
                data: item,
              } as any)
            } else if (item.product_id) {
              appendTransactionItem({
                item_type: "product",
                package_id: null,
                product_id: item.product_id,
                name: item.name || "",
                quantity: item.quantity,
                price: item.price || 0,
                sell_price: item.price || 0,
                discount_type: item.discount_type || "nominal",
                discount: item.discount || 0,
                duration: null,
                duration_type: null,
                session_duration: null,
                extra_session: null,
                extra_day: null,
                start_date: null,
                notes: `Free item from loyalty reward: ${reward.name}`,
                is_promo: 0,
                loyalty_reward_id: reward.id,
                loyalty_reward_name: reward.name,
                loyalty_point: null,
                source_from: "redeem_item",
                allow_all_trainer: false,
                package_type: null,
                classes: [],
                instructors: [],
                trainers: null,
                data: item,
              } as any)
            }
          })
        }
      })
    }

    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-[600px]"
        floating
      >
        <Form {...formPropsTransaction}>
          <form className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Diskon & Redeem</SheetTitle>
              <SheetDescription />
            </SheetHeader>

            <div className="flex-1 overflow-hidden px-2 pr-1">
              <Tabs defaultValue="discount" className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discount">Diskon</TabsTrigger>
                  <TabsTrigger value="loyalty">Redeem Poin</TabsTrigger>
                  <TabsTrigger value="voucher" disabled>
                    Voucher
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="discount"
                  className="flex-1 overflow-hidden"
                >
                  <DiscountTabContent
                    pendingDiscount={pendingDiscount}
                    setPendingDiscount={setPendingDiscount}
                    customDiscountType={customDiscountType}
                    setCustomDiscountType={setCustomDiscountType}
                    customDiscountValue={customDiscountValue}
                    setCustomDiscountValue={setCustomDiscountValue}
                    selectedDefaultDiscount={selectedDefaultDiscount}
                    setSelectedDefaultDiscount={setSelectedDefaultDiscount}
                  />
                </TabsContent>

                <TabsContent value="loyalty" className="flex-1 overflow-hidden">
                  <LoyaltyTabContent
                    memberCode={memberCode}
                    open={open}
                    loyaltyRedeemItems={loyaltyRedeemItems}
                    pendingRedeemItems={pendingRedeemItems}
                    onSelectReward={handleSelectReward}
                  />
                </TabsContent>

                <TabsContent value="voucher" className="flex-1 overflow-hidden">
                  <VoucherTabContent
                    formPropsTransaction={formPropsTransaction}
                    pendingVouchers={pendingVouchers}
                    onSelectVoucher={handleSelectVoucher}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <SheetFooter className="px-4 py-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Batal
              </Button>
              <Button type="button" onClick={handleSave}>
                Simpan
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default DiscountAndRedeem
