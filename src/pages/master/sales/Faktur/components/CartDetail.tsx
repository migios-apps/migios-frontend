import React, { Fragment } from "react"
import { useFieldArray } from "react-hook-form"
import { PaymentStatus, SalesDetailType } from "@/services/api/@types/sales"
import { LoyaltyType } from "@/services/api/@types/settings/loyalty"
import { SettingsType } from "@/services/api/@types/settings/settings"
import dayjs from "dayjs"
import {
  Gift,
  Location,
  SearchNormal1,
  Tag,
  Trash,
  Warning2,
} from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { currencyFormat } from "@/components/ui/input-currency"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
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

  const {
    fields: discountFields,
    append: appendDiscount,
    remove: removeDiscount,
  } = useFieldArray({
    control,
    name: "discounts",
  })

  const cartDataGenerated = generateCartData(watchTransaction, settings)
  console.log("cartDataGenerated", JSON.stringify(cartDataGenerated, null, 2))
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

  // Cek status item untuk refund mode
  const refundEmptyState = React.useMemo(() => {
    if (detailType !== "refund") return null

    // Cek apakah ada item yang masih bisa di-refund
    const hasRefundableItems =
      detail?.items?.some(
        (item) =>
          item.source_from === "item" && item.quantity + item.qty_refund !== 0
      ) || false

    // Cek apakah ada item sama sekali
    const hasItems = detail?.items && detail.items.length > 0

    if (!hasItems) {
      return {
        title: "Tidak ada item",
        description: "Transaksi ini tidak memiliki item yang dapat di-refund.",
      }
    }

    if (!hasRefundableItems) {
      return {
        title: "Semua item sudah di-refund",
        description:
          "Semua item pada transaksi ini sudah di-refund sebelumnya. Tidak ada item lagi yang dapat di-refund.",
      }
    }

    return {
      title: "Tidak ada item yang dipilih untuk di-refund",
      description: "Pilih item yang ingin di-refund dari daftar item di atas.",
    }
  }, [detailType, detail?.items])

  const handleRemoveRedeemItem = (redeemItemId: number) => {
    // Hapus dari loyalty_redeem_items
    const updatedRedeemItems = loyaltyRedeemItems.filter(
      (item) => item.id !== redeemItemId
    )
    setValue("loyalty_redeem_items", updatedRedeemItems, {
      shouldValidate: true,
      shouldDirty: true,
    })

    // Hapus discount yang memiliki loyalty_reward_id yang sama
    const currentDiscounts = watchTransaction.discounts || []
    const discountIndexToRemove = currentDiscounts.findIndex(
      (discount) => discount.loyalty_reward_id === redeemItemId
    )
    if (discountIndexToRemove !== -1) {
      removeDiscount(discountIndexToRemove)
    }

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
            {/* alert refund mode */}
            {detailType === "refund" ? (
              <Alert className="items-center border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                <Warning2
                  className="h-8! w-8! text-amber-600 dark:text-amber-400"
                  variant="Bulk"
                  color="currentColor"
                />
                <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
                  Loyalty point, poin redeem, voucher yang dipakai, dan komisi
                  penjualan tidak dapat dikembalikan setelah refund. Untuk
                  pembatalan, silahkan gunakan fitur Dibatalkan.
                </AlertDescription>
              </Alert>
            ) : null}
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
          {groupedItems.length > 0 ? (
            <ScrollArea
              className={cn(
                detailType === "refund"
                  ? "h-[calc(100vh-190px)]"
                  : "h-[calc(100vh-185px)]"
              )}
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
                                          {redeemItem.discount_type ===
                                          "percent"
                                            ? `Diskon ${redeemItem.discount_value}%`
                                            : `Diskon ${currencyFormat(redeemItem.discount_value || 0)}`}
                                        </div>
                                      )}
                                      {redeemItem.type === "free_item" &&
                                        redeemItem.items && (
                                          <div className="text-muted-foreground mt-1 text-xs">
                                            {redeemItem.items.length} item
                                            gratis
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
                                            handleRemoveRedeemItem(
                                              redeemItem.id!
                                            )
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

                      {/* Discount Fields */}
                      {isPaid === 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <FormLabel>
                              Diskon Transaksi{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                appendDiscount({
                                  discount_type: "nominal",
                                  discount_amount: 0,
                                })
                              }}
                            >
                              <Tag className="mr-2 h-4 w-4" />
                              Tambah Diskon
                            </Button>
                          </div>
                          {discountFields.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                              Belum ada diskon. Klik "Tambah Diskon" untuk
                              menambahkan.
                            </p>
                          )}
                          {discountFields.map((field, index) => {
                            const discountError = errors.discounts?.[
                              index
                            ] as any
                            return (
                              <div
                                key={field.id}
                                className="flex items-start gap-2 rounded-lg border p-3"
                              >
                                <div className="flex-1 space-y-2">
                                  <FormFieldItem
                                    control={control}
                                    name={`discounts.${index}.discount_amount`}
                                    invalid={Boolean(
                                      discountError?.discount_amount
                                    )}
                                    errorMessage={
                                      discountError?.discount_amount?.message
                                    }
                                    render={({ field: amountField }) => {
                                      const watchDiscount =
                                        watchTransaction.discounts?.[index]
                                      return (
                                        <InputGroup>
                                          {watchDiscount?.discount_type ===
                                          "nominal" ? (
                                            <InputCurrency
                                              placeholder="Jumlah diskon"
                                              customInput={InputGroupInput}
                                              value={
                                                amountField.value || undefined
                                              }
                                              onValueChange={(
                                                _value,
                                                _name,
                                                values
                                              ) => {
                                                const valData = values?.float
                                                amountField.onChange(
                                                  valData || 0
                                                )
                                              }}
                                            />
                                          ) : (
                                            <InputGroupInput
                                              type="number"
                                              autoComplete="off"
                                              placeholder="10%"
                                              {...amountField}
                                              value={
                                                (amountField.value === 0
                                                  ? undefined
                                                  : amountField.value) ||
                                                undefined
                                              }
                                              onChange={(e) => {
                                                const value =
                                                  e.target.value === ""
                                                    ? 0
                                                    : Number(e.target.value)
                                                amountField.onChange(value)
                                              }}
                                            />
                                          )}
                                          <InputGroupAddon
                                            align="inline-end"
                                            className="pr-0"
                                          >
                                            <ButtonGroup>
                                              <InputGroupButton
                                                type="button"
                                                variant={
                                                  watchDiscount?.discount_type ===
                                                  "percent"
                                                    ? "default"
                                                    : "ghost"
                                                }
                                                size="sm"
                                                className={
                                                  watchDiscount?.discount_type ===
                                                  "percent"
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : ""
                                                }
                                                onClick={() => {
                                                  setValue(
                                                    `discounts.${index}.discount_type`,
                                                    "percent"
                                                  )
                                                }}
                                              >
                                                %
                                              </InputGroupButton>
                                              <InputGroupButton
                                                type="button"
                                                variant={
                                                  watchDiscount?.discount_type ===
                                                  "nominal"
                                                    ? "default"
                                                    : "ghost"
                                                }
                                                size="sm"
                                                className={
                                                  watchDiscount?.discount_type ===
                                                  "nominal"
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : ""
                                                }
                                                onClick={() => {
                                                  setValue(
                                                    `discounts.${index}.discount_type`,
                                                    "nominal"
                                                  )
                                                }}
                                              >
                                                Rp
                                              </InputGroupButton>
                                            </ButtonGroup>
                                          </InputGroupAddon>
                                        </InputGroup>
                                      )
                                    }}
                                  />
                                  <FormFieldItem
                                    control={control}
                                    name={`discounts.${index}.discount_type`}
                                    invalid={Boolean(
                                      discountError?.discount_type
                                    )}
                                    errorMessage={
                                      discountError?.discount_type?.message
                                    }
                                    render={() => <></>}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDiscount(index)}
                                  className="mt-0"
                                >
                                  <Trash className="text-destructive h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Subtotal & Tax */}
                      <div className="space-y-2">
                        <div className="m-0 flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Sub total
                          </span>
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
                        {cartDataGenerated.rounding_amount !== 0 ? (
                          <div className="m-0 flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Jumlah pembulatan
                            </span>
                            <span className="text-card-foreground font-medium">
                              {cartDataGenerated.frounding_amount}
                            </span>
                          </div>
                        ) : null}
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
          ) : (
            <div className="flex h-[calc(100vh-110px)] flex-col gap-3 overflow-y-auto p-4">
              {refundEmptyState ? (
                <div className="border-border bg-muted/50 flex flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
                  <div className="text-muted-foreground mb-2">
                    <Tag size="48" variant="Outline" className="opacity-50" />
                  </div>
                  <h3 className="text-base font-semibold">
                    {refundEmptyState.title}
                  </h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    {refundEmptyState.description}
                  </p>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Tidak ada item di faktur
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-border flex h-full flex-col border-l">
          <FormPayment
            detailType={detailType}
            detail={detail}
            formPropsTransaction={formPropsTransaction}
            transactionId={transactionId}
            isPaid={isPaid}
            settings={settings}
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
