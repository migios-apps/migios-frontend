import React, { Fragment } from "react"
import { useFieldArray } from "react-hook-form"
import { PaymentStatus, SalesDetailType } from "@/services/api/@types/sales"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { SettingsType } from "@/services/api/@types/settings/settings"
import dayjs from "dayjs"
import { Gift, Location, SearchNormal1, Tag, Trash } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem } from "@/components/ui/form"
import { currencyFormat } from "@/components/ui/input-currency"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { calculateLoyaltyPoint } from "../utils/calculateLoyaltyPoint"
import { generateCartData } from "../utils/generateCartData"
import {
  groupItemsByRedeem,
  GroupedDisplayItem,
} from "../utils/groupItemsByRedeem"
import {
  ReturnTransactionFormSchema,
  ReturnTransactionItemFormSchema,
} from "../utils/validation"
import CheckoutItemPackageCard from "./CheckoutItemPackageCard"
import CheckoutItemProductCard from "./CheckoutItemProductCard"
import CheckoutItemRedeemCollectionCard from "./CheckoutItemRedeemCollectionCard"
import DialogDetailLoyaltyRedeem from "./DialogDetailLoyaltyRedeem"
import DialogLoyaltyPoint from "./DialogLoyaltyPoint"
import FormPayment from "./FormPayment"

interface CartDetailProps {
  detailType: "create" | "update" | "refund"
  detail?: SalesDetailType | null
  isPaid?: PaymentStatus
  transactionId?: number
  formPropsTransaction: ReturnTransactionFormSchema
  formPropsTransactionItem: ReturnTransactionItemFormSchema
  settings?: SettingsType | null
  onBack?: () => void
  setIndexItem: React.Dispatch<React.SetStateAction<number>>
  setOpenAddItem: React.Dispatch<React.SetStateAction<boolean>>
  setFormItemType: React.Dispatch<React.SetStateAction<"create" | "update">>
}

const CartDetail: React.FC<CartDetailProps> = ({
  detailType,
  detail = null,
  isPaid = 0,
  transactionId,
  formPropsTransaction,
  formPropsTransactionItem,
  settings,
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
  // console.log("watchTransaction", { watchTransaction, errors })

  const memberFromForm = watchTransaction.member
  const memberCodeFromDetail = detail?.member?.code
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = React.useState(false)
  const [openRedeemDetailDialog, setOpenRedeemDetailDialog] =
    React.useState(false)
  const [selectedRedeemItem, setSelectedRedeemItem] =
    React.useState<LoyaltyType | null>(null)

  const memberCode = memberFromForm?.code || memberCodeFromDetail
  const loyaltyRedeemItems = React.useMemo(
    () => watchTransaction.loyalty_redeem_items || [],
    [watchTransaction.loyalty_redeem_items]
  )

  const { remove: removeTransactionItem } = useFieldArray({
    control,
    name: "items",
  })

  const cartDataGenerated = generateCartData(watchTransaction)
  // console.log("cartDataGenerated", cartDataGenerated)
  // Calculate loyalty point - hanya jika transaksi belum dibayar
  const isUnpaid = isPaid === 0 || detail?.status === "unpaid"
  const loyalty_point = isUnpaid
    ? calculateLoyaltyPoint({
        items: cartDataGenerated.items,
        total_amount: cartDataGenerated.total_amount,
        settings: settings || null,
        hasRedeemItems: loyaltyRedeemItems.length > 0,
      })
    : 0

  // Group redeem items by loyalty_reward_id
  const groupedItems: GroupedDisplayItem[] = React.useMemo(() => {
    return groupItemsByRedeem(cartDataGenerated.items || [])
  }, [cartDataGenerated.items])

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
              <div className="flex w-full items-center gap-2 font-medium">
                <Location size="20" color="currentColor" variant="Outline" />
                <span className="text-sm font-semibold sm:text-base">
                  {club?.name}
                </span>
              </div>

              {/* Tanggal */}
              {detailType === "refund" ? null : (
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
              )}
            </div>

            {/* Search Bar */}
            {isPaid === 0 ? (
              <div
                className="border-border bg-card hover:bg-accent relative w-full cursor-pointer rounded-md border py-2.5 pr-10 pl-4 text-sm text-gray-500 sm:py-3 sm:text-base"
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
              {groupedItems.map((groupedItem, groupIndex) => {
                if (groupedItem.type === "redeem_collection") {
                  return (
                    <CheckoutItemRedeemCollectionCard
                      key={`redeem-${groupedItem.rewardId}-${groupIndex}`}
                      rewardId={groupedItem.rewardId}
                      rewardName={groupedItem.rewardName}
                      items={groupedItem.items}
                      showEditProduct={isPaid === 0}
                      showEditPackage={isPaid === 0}
                      showDelete={isPaid === 0}
                      onClickProduct={(item, originalIndex) => {
                        formPropsItem.reset(item)
                        setIndexItem(originalIndex)
                        setOpenAddItem(true)
                        setFormItemType("update")
                      }}
                      onClickPackage={(item, originalIndex) => {
                        formPropsItem.reset(item)
                        setIndexItem(originalIndex)
                        setOpenAddItem(true)
                        setFormItemType("update")
                      }}
                      onDelete={handleRemoveRedeemItem}
                      originalIndices={groupedItem.originalIndices}
                    />
                  )
                }

                // Regular item (source_from = 'item')
                const { item, originalIndex } = groupedItem
                return (
                  <Fragment key={`item-${originalIndex}-${groupIndex}`}>
                    {item.item_type === "product" ? (
                      <CheckoutItemProductCard
                        item={item}
                        showEdit={isPaid === 0}
                        onClick={() => {
                          formPropsItem.reset(item)
                          setIndexItem(originalIndex)
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
                          setIndexItem(originalIndex)
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
                      {(detailType == "create" && !memberCode) ||
                      (detailType === "update" && !isUnpaid) ||
                      detailType === "refund" ? null : (
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
                        <div className="flex flex-col gap-2">
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
                      {loyalty_point > 0 ? (
                        <div className="text-muted-foreground flex justify-between text-sm">
                          <span>Potensi mendapatkan poin</span>
                          <span>+{loyalty_point} Pts</span>
                        </div>
                      ) : null}
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
        <div className="border-border flex h-full flex-col border-l">
          <FormPayment
            detailType={detailType}
            detail={detail}
            formPropsTransaction={formPropsTransaction}
            transactionId={transactionId}
            isPaid={isPaid}
          />
        </div>
      </div>

      {/* Dialog Detail Loyalty Redeem */}
      <DialogDetailLoyaltyRedeem
        open={openRedeemDetailDialog}
        onClose={() => setOpenRedeemDetailDialog(false)}
        selectedRedeemItem={selectedRedeemItem}
      />

      <DialogLoyaltyPoint
        open={openLoyaltyDialog}
        onClose={() => setOpenLoyaltyDialog(false)}
        memberCode={memberCode}
        formPropsTransaction={formPropsTransaction}
      />
    </Form>
  )
}

export default CartDetail
