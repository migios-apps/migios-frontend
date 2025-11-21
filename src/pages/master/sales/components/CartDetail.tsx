import React, { Fragment } from "react"
import { Controller } from "react-hook-form"
import { PaymentStatus, SalesDetailType } from "@/services/api/@types/sales"
import dayjs from "dayjs"
import { Calendar, Location, SearchNormal1 } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePicker, FormItem } from "@/components/ui"
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
    <>
      <div className="grid h-full grid-cols-1 items-start lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
        <div className="flex w-full flex-col">
          <div className="flex flex-col gap-3 p-4">
            {/* Bagian atas: Lokasi & Tanggal */}
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
              {/* Lokasi */}
              <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                <Location size="20" color="currentColor" variant="Outline" />
                <span className="text-sm font-semibold sm:text-base">
                  {club?.name}
                </span>
              </div>

              {/* Tanggal */}
              <FormItem
                label=""
                className="mb-0 w-full sm:w-auto"
                invalid={Boolean(errors.due_date)}
                errorMessage={errors.due_date?.message}
              >
                <Controller
                  name="due_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      inputFormat="DD-MM-YYYY"
                      placeholder="Start Date"
                      {...field}
                      disabled={isPaid !== 0}
                      size="sm"
                      className="w-full sm:w-auto"
                      inputPrefix={
                        <Calendar
                          size="20"
                          color="currentColor"
                          variant="Outline"
                        />
                      }
                      value={field.value ? dayjs(field.value).toDate() : null}
                    />
                  )}
                />
              </FormItem>
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
                <div className="w-full max-w-md rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-200">
                    Ringkasan Faktur
                  </h3>

                  {/* Subtotal & Tax */}
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Sub total
                      </span>
                      <span className="font-medium">
                        {cartDataGenerated.fsubtotal}
                      </span>
                    </div>
                    {/* <div className="flex justify-between text-sm">
                      <span className="text-primary cursor-pointer hover:underline">
                        Tambah diskon
                      </span>
                      <span className="text-sm text-gray-500">-</span>
                    </div> */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pajak
                      </span>
                      <span className="font-medium">
                        {cartDataGenerated.ftotal_tax}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-4 border-t border-gray-200 pt-3 dark:border-gray-600">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{cartDataGenerated.ftotal_amount}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-gray-600 italic dark:text-gray-400">
                      <span>Potensi mendapatkan poin</span>
                      <span>+{loyalty_point} Pts</span>
                    </div>

                    {detail && detail?.payments?.length > 0 ? (
                      <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
                        <span className="text-lg font-bold">Pembayaran</span>
                        {detail?.payments?.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex justify-between"
                          >
                            <div className="flex justify-start gap-1">
                              <span className="font-semibold">{`${payment.rekening_name},`}</span>
                              <span className="text-sm">{`${dayjs(payment.date).format("DD MMM YYYY")}`}</span>
                            </div>
                            <span className="font-semibold">
                              {payment.famount}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Remaining Payment */}
                    {cartDataGenerated.balance_amount > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
                        <div className="flex justify-between text-lg font-bold text-red-600 dark:text-red-400">
                          <span>Sisa pembayaran</span>
                          <span>{cartDataGenerated.fbalance_amount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="flex h-full flex-col border-l border-gray-200 dark:border-gray-700">
          <FormPayment
            type={type}
            detail={detail}
            formPropsTransaction={formPropsTransaction}
            formPropsTransactionItem={formPropsTransactionItem}
            transactionId={transactionId}
            isPaid={isPaid}
          />
        </div>
      </div>
    </>
  )
}

export default CartDetail
