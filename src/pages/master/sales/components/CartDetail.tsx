import React, { Fragment } from "react"
import { useFieldArray } from "react-hook-form"
import { PaymentStatus, SalesDetailType } from "@/services/api/@types/sales"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import dayjs from "dayjs"
import { Gift, Location, SearchNormal1, Tag, Trash } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem } from "@/components/ui/form"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { generateCartData } from "../utils/generateCartData"
import {
  ReturnTransactionFormSchema,
  ReturnTransactionItemFormSchema,
} from "../utils/validation"
import CheckoutItemPackageCard from "./CheckoutItemPackageCard"
import CheckoutItemProductCard from "./CheckoutItemProductCard"
import DialogLoyaltyPoint from "./DialogLoyaltyPoint"
import FormPayment from "./FormPayment"

interface CartDetailProps {
  type: "create" | "update"
  detail?: SalesDetailType | null
  isPaid?: PaymentStatus
  transactionId?: number
  formPropsTransaction: ReturnTransactionFormSchema
  formPropsTransactionItem: ReturnTransactionItemFormSchema
  onBack: () => void
  setIndexItem: React.Dispatch<React.SetStateAction<number>>
  setOpenAddItem: React.Dispatch<React.SetStateAction<boolean>>
  setFormItemType: React.Dispatch<React.SetStateAction<"create" | "update">>
}

const CartDetail: React.FC<CartDetailProps> = ({
  type,
  detail = null,
  isPaid = 0,
  transactionId,
  formPropsTransaction,
  formPropsTransactionItem,
  onBack,
  setIndexItem,
  setOpenAddItem,
  setFormItemType,
}) => {
  const club = useSessionUser((state) => state.club)

  const formPropsItem = formPropsTransactionItem
  const {
    watch,
    control,
    setValue,
    formState: { errors },
  } = formPropsTransaction
  const watchTransaction = watch()
  console.log("watchTransaction", { watchTransaction, errors })

  const { remove: removeTransactionItem, append: appendTransactionItem } =
    useFieldArray({
      control,
      name: "items",
    })

  const cartDataGenerated = generateCartData(watchTransaction)
  console.log("cartDataGenerated", cartDataGenerated)
  const loyalty_point = cartDataGenerated.items.reduce(
    (acc: number, cur: any) =>
      acc +
      (typeof cur.loyalty_point === "object" && cur.loyalty_point !== null
        ? cur.loyalty_point.points || 0
        : typeof cur.loyalty_point === "number"
          ? cur.loyalty_point
          : 0),
    0
  )

  const memberFromForm = watchTransaction.member
  const memberCodeFromDetail = detail?.member?.code
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = React.useState(false)
  const [openRedeemDetailDialog, setOpenRedeemDetailDialog] =
    React.useState(false)
  const [selectedRedeemItem, setSelectedRedeemItem] =
    React.useState<LoyaltyType | null>(null)

  const memberCode = memberFromForm?.code || memberCodeFromDetail
  const loyaltyRedeemItems = watchTransaction.loyalty_redeem_items || []

  const handleRemoveRedeemItem = (redeemItemId: number) => {
    // Hapus dari loyalty_redeem_items
    const updatedRedeemItems = loyaltyRedeemItems.filter(
      (item) => item.id !== redeemItemId
    )
    setValue("loyalty_redeem_items", updatedRedeemItems, {
      shouldValidate: true,
      shouldDirty: true,
    })

    // Hapus items yang memiliki loyalty_reward_id yang sama
    const currentItems = watchTransaction.items || []
    const itemsToRemove: number[] = []
    currentItems.forEach((item, index) => {
      if (item.loyalty_reward_id === redeemItemId) {
        itemsToRemove.push(index)
      }
    })

    // Hapus items dari belakang ke depan untuk menghindari index shift
    itemsToRemove.reverse().forEach((index) => {
      removeTransactionItem(index)
    })
  }

  return (
    <Form {...formPropsTransaction}>
      <div className="grid h-full grid-cols-1 items-start lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
        <div className="flex w-full flex-col">
          <div className="flex flex-col gap-3 p-4 pb-0">
            {/* Bagian atas: Lokasi & Tanggal */}
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              {/* Lokasi */}
              <div className="flex w-full items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                <Location size="20" color="currentColor" variant="Outline" />
                <span className="text-sm font-semibold sm:text-base">
                  {club?.name}
                </span>
              </div>

              {/* Tanggal */}
              <FormFieldItem
                control={control}
                name="due_date"
                invalid={Boolean(errors.due_date)}
                errorMessage={errors.due_date?.message}
                render={({ field, fieldState }) => (
                  <DatePicker
                    selected={
                      field.value ? dayjs(field.value).toDate() : undefined
                    }
                    onSelect={(date) => {
                      field.onChange(
                        date ? dayjs(date).format("YYYY-MM-DD") : null
                      )
                    }}
                    placeholder="Start Date"
                    error={!!fieldState.error}
                    classNameBtn="w-fit justify-end"
                    disabled={
                      isPaid !== 0
                        ? () => true
                        : (date: Date) =>
                            date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                )}
              />
            </div>

            {/* Search Bar */}
            {isPaid === 0 ? (
              <div
                className="relative w-full cursor-pointer rounded-md bg-gray-100 py-2.5 pr-10 pl-4 text-sm text-gray-500 hover:bg-gray-200 sm:py-3 sm:text-base dark:bg-gray-800 dark:text-gray-200 hover:dark:bg-gray-700"
                onClick={onBack}
              >
                Cari item untuk di jual
                <SearchNormal1
                  size="20"
                  color="currentColor"
                  variant="Outline"
                  className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                />
              </div>
            ) : null}
          </div>
          <ScrollArea
            className={
              isPaid === 0 ? "h-[calc(100vh-200px)]" : "h-[calc(100vh-145px)]"
            }
          >
            <div className="flex flex-col gap-3 overflow-y-auto p-4">
              {cartDataGenerated.items?.map((item, index) => {
                return (
                  <Fragment key={index}>
                    {item.item_type === "product" ? (
                      <CheckoutItemProductCard
                        item={item}
                        showEdit={isPaid === 0}
                        onClick={() => {
                          formPropsItem.reset(item)
                          setIndexItem(index)
                          setOpenAddItem(true)
                          setFormItemType("update")
                        }}
                      />
                    ) : (
                      <CheckoutItemPackageCard
                        item={item}
                        showEdit={isPaid === 0}
                        onClick={() => {
                          formPropsItem.reset(item)
                          setIndexItem(index)
                          setOpenAddItem(true)
                          setFormItemType("update")
                        }}
                      />
                    )}
                  </Fragment>
                )
              })}

              <div className="mt-4 flex justify-end">
                <Card className="w-full max-w-md gap-0 shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Ringkasan Faktur</CardTitle>
                      {memberCode && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenLoyaltyDialog(true)}
                          className="gap-2"
                        >
                          <Gift size="16" />
                          Redeem Poin
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Loyalty Redeem Items */}
                    {loyaltyRedeemItems.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <span className="text-sm font-semibold">
                            Loyalty Redeem
                          </span>
                          {loyaltyRedeemItems.map((redeemItem, index) => (
                            <Card
                              key={index}
                              className="hover:bg-accent relative cursor-pointer p-0 shadow-none transition-colors"
                              onClick={() => {
                                setSelectedRedeemItem(redeemItem as any)
                                setOpenRedeemDetailDialog(true)
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold">
                                        {redeemItem.name}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {redeemItem.type === "discount" ? (
                                          <>
                                            <Tag className="mr-1 h-3 w-3" />
                                            Diskon
                                          </>
                                        ) : (
                                          <>
                                            <Gift className="mr-1 h-3 w-3" />
                                            Free Item
                                          </>
                                        )}
                                      </Badge>
                                    </div>
                                    {redeemItem.type === "discount" && (
                                      <div className="text-muted-foreground mt-1 text-xs">
                                        {redeemItem.discount_type === "percent"
                                          ? `Diskon ${redeemItem.discount_value}%`
                                          : `Diskon ${currencyFormat(redeemItem.discount_value || 0)}`}
                                      </div>
                                    )}
                                    {redeemItem.type === "free_item" &&
                                      redeemItem.items && (
                                        <div className="text-muted-foreground mt-1 text-xs">
                                          {redeemItem.items.length} item gratis
                                        </div>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="text-muted-foreground text-xs">
                                        Poin digunakan
                                      </div>
                                      <div className="text-sm font-bold">
                                        {redeemItem.points_required} Pts
                                      </div>
                                    </div>
                                    {isPaid === 0 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveRedeemItem(redeemItem.id!)
                                        }}
                                      >
                                        <Trash size={16} />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Subtotal & Tax */}
                    <div className="space-y-2">
                      <div className="m-0 flex justify-between text-sm">
                        <span className="text-muted-foreground">Sub total</span>
                        <span className="text-card-foreground font-medium">
                          {cartDataGenerated.fsubtotal}
                        </span>
                      </div>
                      <div className="m-0 flex justify-between text-sm">
                        <span className="text-muted-foreground">Diskon</span>
                        <span className="text-card-foreground font-medium">
                          -{cartDataGenerated.ftotal_discount}
                        </span>
                      </div>
                      <div className="m-0 flex justify-between text-sm">
                        <span className="text-muted-foreground">Pajak</span>
                        <span className="text-card-foreground font-medium">
                          {cartDataGenerated.ftotal_tax}
                        </span>
                      </div>
                    </div>
                    {/* Total */}
                    <div className="space-y-2">
                      <div className="m-0 flex justify-between">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-base font-semibold">
                          {cartDataGenerated.ftotal_amount}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex justify-between text-sm">
                        <span>Potensi mendapatkan poin</span>
                        <span>+{loyalty_point} Pts</span>
                      </div>
                    </div>

                    {detail && detail?.payments?.length > 0 ? (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <span className="text-sm font-semibold">
                            Pembayaran
                          </span>
                          {detail?.payments?.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex justify-between text-sm"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">
                                  {payment.rekening_name},
                                </span>
                                <span className="text-muted-foreground">
                                  {dayjs(payment.date).format("DD MMM YYYY")}
                                </span>
                              </div>
                              <span className="font-medium">
                                {payment.famount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : null}

                    {/* Remaining Payment */}
                    {cartDataGenerated.balance_amount > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-destructive text-sm font-semibold">
                            Sisa pembayaran
                          </span>
                          <span className="text-destructive text-sm font-semibold">
                            {cartDataGenerated.fbalance_amount}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="flex h-full flex-col border-l border-gray-200 dark:border-gray-700">
          <FormPayment
            type={type}
            detail={detail}
            formPropsTransaction={formPropsTransaction}
            transactionId={transactionId}
            isPaid={isPaid}
          />
        </div>
      </div>

      {/* Dialog Detail Loyalty Redeem */}
      <Dialog
        open={openRedeemDetailDialog}
        onOpenChange={setOpenRedeemDetailDialog}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Loyalty Redeem</DialogTitle>
            <DialogDescription>
              Detail reward yang telah di-redeem
            </DialogDescription>
          </DialogHeader>
          {selectedRedeemItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{selectedRedeemItem.name}</h3>
                  <Badge variant="outline">
                    {selectedRedeemItem.type === "discount" ? (
                      <>
                        <Tag className="mr-1 h-3 w-3" />
                        Diskon
                      </>
                    ) : (
                      <>
                        <Gift className="mr-1 h-3 w-3" />
                        Free Item
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Poin digunakan</span>
                  <span className="font-semibold">
                    {selectedRedeemItem.points_required} Pts
                  </span>
                </div>

                {selectedRedeemItem.type === "discount" && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="font-semibold">
                      {selectedRedeemItem.discount_type === "percent"
                        ? `${selectedRedeemItem.discount_value}%`
                        : currencyFormat(
                            selectedRedeemItem.discount_value || 0
                          )}
                    </span>
                  </div>
                )}

                {selectedRedeemItem.type === "free_item" &&
                  selectedRedeemItem.items &&
                  selectedRedeemItem.items.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-semibold">
                        Items Gratis
                      </span>
                      <div className="space-y-2">
                        {selectedRedeemItem.items.map((item, idx) => (
                          <Card key={idx}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-muted-foreground text-xs">
                                    Quantity: {item.quantity}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-muted-foreground text-xs line-through">
                                    {currencyFormat(item.original_price || 0)}
                                  </div>
                                  <div className="text-sm font-semibold text-green-600">
                                    Gratis
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                {!selectedRedeemItem.is_forever && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Berlaku hingga
                    </span>
                    <span>
                      {dayjs(selectedRedeemItem.end_date).format("DD MMM YYYY")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DialogLoyaltyPoint
        open={openLoyaltyDialog}
        onClose={() => setOpenLoyaltyDialog(false)}
        memberCode={memberCode}
        onSelectReward={(reward: LoyaltyType) => {
          const currentRedeemItems = watchTransaction.loyalty_redeem_items || []

          // Map items dari LoyaltyItemType ke format validation schema
          const mappedItems =
            reward.items && reward.items.length > 0
              ? reward.items.map((item) => ({
                  id: item.id,
                  reward_id:
                    item.reward_id || item.loyalty_reward_id || undefined,
                  package_id: item.package_id ?? undefined,
                  product_id: item.product_id ?? undefined,
                  quantity: item.quantity || 1,
                  item_type: item.item_type ?? undefined,
                  name: item.name || "",
                  original_price: item.original_price || 0,
                  price: item.price || 0,
                  discount_type: item.discount_type || "nominal",
                  discount: item.discount ?? 0, // Pastikan tidak null
                }))
              : null

          // Tambahkan reward ke loyalty_redeem_items
          const newRedeemItem = {
            id: reward.id!,
            name: reward.name,
            type: reward.type as "discount" | "free_item",
            points_required: reward.points_required,
            discount_type:
              (reward.discount_type as "percent" | "nominal" | null) || null,
            discount_value: reward.discount_value || null,
            items: mappedItems,
          }

          setValue(
            "loyalty_redeem_items",
            [...currentRedeemItems, newRedeemItem],
            {
              shouldValidate: true,
              shouldDirty: true,
            }
          )

          // Tambahkan free items ke transaction items jika type = free_item
          if (
            reward.type === "free_item" &&
            reward.items &&
            reward.items.length > 0
          ) {
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
                  session_duration: item.session_duration,
                  extra_session: item.extra_session || 0,
                  extra_day: item.extra_day || 0,
                  start_date: new Date(),
                  notes: `Free item from loyalty reward: ${reward.name}`,
                  is_promo: 0,
                  loyalty_reward_id: item.loyalty_reward_id,
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
                  loyalty_reward_id: item.loyalty_reward_id,
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
        }}
      />
    </Form>
  )
}

export default CartDetail
