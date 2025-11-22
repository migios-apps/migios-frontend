import React, { Fragment } from "react"
import { PaymentStatus, SalesDetailType } from "@/services/api/@types/sales"
import dayjs from "dayjs"
import { Location, SearchNormal1 } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { generateCartData } from "../utils/generateCartData"
import {
  ReturnTransactionFormSchema,
  ReturnTransactionItemFormSchema,
} from "../utils/validation"
import CheckoutItemPackageCard from "./CheckoutItemPackageCard"
import CheckoutItemProductCard from "./CheckoutItemProductCard"
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
    formState: { errors },
  } = formPropsTransaction
  const watchTransaction = watch()

  const cartDataGenerated = generateCartData(watchTransaction)
  const loyalty_point = cartDataGenerated.items.reduce(
    (acc: any, cur: any) => acc + cur.loyalty_point,
    0
  )

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
                    <CardTitle>Ringkasan Faktur</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Subtotal & Tax */}
                    <div className="space-y-2">
                      <div className="m-0 flex justify-between text-sm">
                        <span className="text-muted-foreground">Sub total</span>
                        <span className="text-card-foreground font-medium">
                          {cartDataGenerated.fsubtotal}
                        </span>
                      </div>
                      <div className="m-0 flex justify-between text-sm">
                        <span className="text-muted-foreground">Pajak</span>
                        <span className="text-card-foreground font-medium">
                          {cartDataGenerated.ftotal_tax}
                        </span>
                      </div>
                    </div>

                    <Separator />

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
    </Form>
  )
}

export default CartDetail
