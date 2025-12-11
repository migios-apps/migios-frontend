import React from "react"
import { SubmitHandler } from "react-hook-form"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { MemberDetail } from "@/services/api/@types/member"
import {
  CheckoutRequest,
  PaymentStatus,
  RefundRequest,
  SalesDetailType,
  UpdateSalesPaymentDto,
} from "@/services/api/@types/sales"
import { SettingsType } from "@/services/api/@types/settings/settings"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import { apiGetMemberList } from "@/services/api/MembeService"
import {
  apiCreateCheckout,
  apiRefundSales,
  apiUpdateSales,
  apiUpdateSalesPayment,
  apiVoidSales,
} from "@/services/api/SalesService"
import {
  ArrowDown2,
  EmptyWalletRemove,
  Trash,
  WalletCheck,
  Warning2,
} from "iconsax-reactjs"
import { User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import parseToDecimal from "@/utils/parseToDecimal"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusPaymentColor } from "@/constants/utils"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormFieldItem } from "@/components/ui/form"
import InputCurrency, { currencyFormat } from "@/components/ui/input-currency"
import {
  ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { generateCartData } from "../utils/generateCartData"
import {
  ReturnTransactionFormSchema,
  ValidationTransactionSchema,
  resetTransactionForm,
} from "../utils/validation"

type FormPaymentProps = {
  detailType: "create" | "update" | "refund"
  detail?: SalesDetailType | null
  formPropsTransaction: ReturnTransactionFormSchema
  transactionId?: number
  isPaid?: PaymentStatus
  settings?: SettingsType | null
  onClose?: () => void
}

const FormPayment: React.FC<FormPaymentProps> = ({
  detailType,
  detail = null,
  formPropsTransaction,
  transactionId,
  isPaid = 0,
  settings,
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const [openDropdown, setOpenDropdown] = React.useState(false)
  const [confirmPartPaid, setConfirmPartPaid] = React.useState(false)
  const [confirmVoid, setConfirmVoid] = React.useState(false)
  const [confirmUnpaid, setConfirmUnpaid] = React.useState(false)
  const [confirmReturn, setConfirmReturn] = React.useState(false)
  const [pendingSubmitData, setPendingSubmitData] = React.useState<
    (ValidationTransactionSchema & { isPaid: PaymentStatus }) | null
  >(null)
  const [unpaidType, setUnpaidType] = React.useState<"unpaid" | "partial">(
    "unpaid"
  )

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/sales")
    }
  }

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formPropsTransaction
  const watchTransaction = watch()

  const cartDataGenerated = generateCartData(watchTransaction, settings)

  // console.log("watch", {
  //   data: watch(),
  //   error: errors,
  // })
  //   console.log('cartDataGenerated', cartDataGenerated)

  // const calculate = calculateDetailPayment({
  //   items: watchTransaction.items,
  //   discount_type: watchTransaction.discount_type,
  //   discount: watchTransaction.discount || 0,
  //   tax_rate: 0,
  // })

  // React.useEffect(() => {
  //   const totalPayment = watchTransaction.payments?.reduce(
  //     (acc: any, cur: any) => acc + cur.amount,
  //     0
  //   )
  //   formPropsTransaction.setValue(
  //     'balance_amount',
  //     calculate.totalAmount - totalPayment
  //   )
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [calculate.totalAmount])

  // Untuk refund mode, balance_amount dan total_amount sudah negatif
  const isRefundMode = detailType === "refund"
  const getTotal = isRefundMode
    ? Math.abs(cartDataGenerated.total_amount) -
      (cartDataGenerated.payments?.reduce(
        (acc: any, cur: any) => acc + Math.abs(cur.amount),
        0
      ) || 0)
    : cartDataGenerated.total_amount -
      (cartDataGenerated.payments?.reduce(
        (acc: any, cur: any) => acc + cur.amount,
        0
      ) || 0)
  const isPaidOf = isRefundMode
    ? Math.abs(cartDataGenerated.balance_amount) === 0
    : cartDataGenerated.balance_amount === 0

  // Cek apakah ada payment method yang sudah ditambahkan (untuk refund mode)
  const hasPaymentMethod = React.useMemo(() => {
    if (!isRefundMode) return true // Untuk mode normal, tidak perlu cek
    const payments = watchTransaction.payments || []
    return payments.some((payment) => payment.isDefault === false)
  }, [watchTransaction.payments, isRefundMode])

  //   const isPaidOf =
  //     (cartDataGenerated.payments?.reduce(
  //       (acc: any, cur: any) => acc + cur.amount,
  //       0
  //     ) || 0) >= cartDataGenerated.total_amount

  const getMemberList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<MemberDetail, GroupBase<MemberDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetMemberList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length >= 1,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    []
  )

  const getEmployeeList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetEmployeeList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        show_all: true,
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length > 0,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    []
  )

  const {
    data: rekenings,
    // fetchNextPage: fetchNextPageRekenings,
    // hasNextPage: hasNextPageRekenings,
    // isFetchingNextPage: isFetchingNextPageRekenings,
    isLoading: isLoadingRekenings,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.packages, club.id],
    initialPageParam: 1,
    enabled: isRefundMode || isPaid !== 1, // Untuk refund mode, selalu load rekening
    queryFn: async ({ pageParam }) => {
      const res = await apiGetRekeningList({
        page: pageParam,
        per_page: 12,
        sort_column: "id",
        sort_type: "desc",
        search: [
          {
            search_operator: "and",
            search_column: "enabled",
            search_condition: "=",
            search_text: "true",
          },
          {
            search_operator: "and",
            search_column: "show_in_payment",
            search_condition: "=",
            search_text: "1",
          },
          {
            search_operator: "or",
            search_column: "show_in_payment",
            search_condition: "=",
            search_text: "2",
          },
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listRekenings = React.useMemo(
    () => (rekenings ? rekenings.pages.flatMap((page) => page.data.data) : []),
    [rekenings]
  )
  // const totalRekening = rekenings?.pages[0]?.data.meta.total

  const handlePrefecth = (res?: any) => {
    const data = res?.data?.data
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.sales] })
    resetTransactionForm(formPropsTransaction)
    window.localStorage.removeItem("item_pos")
    navigate(`/sales/${data?.code}`)
  }

  const handleCheck: SubmitHandler<ValidationTransactionSchema> = () => {
    setConfirmPartPaid(true)
  }

  const handleSubmitWithReturnCheck: SubmitHandler<
    ValidationTransactionSchema & { isPaid: PaymentStatus }
  > = (data) => {
    if (cartDataGenerated.return_amount > 0 && !isRefundMode) {
      setPendingSubmitData(data)
      setConfirmReturn(true)
    } else {
      onSubmit(data)
    }
  }

  const voidSales = useMutation({
    mutationFn: (id: number | string) => apiVoidSales(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const createCheckout = useMutation({
    mutationFn: (data: CheckoutRequest) => apiCreateCheckout(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const updateSales = useMutation({
    mutationFn: (data: CheckoutRequest) => apiUpdateSales(data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const updateSalesPayment = useMutation({
    mutationFn: (data: UpdateSalesPaymentDto) => apiUpdateSalesPayment(data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const createRefund = useMutation({
    mutationFn: (data: RefundRequest) => apiRefundSales(data),
    onError: (error) => {
      console.log("error refund", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<
    ValidationTransactionSchema & { isPaid: PaymentStatus }
  > = (data) => {
    const body = {
      club_id: club?.id as number,
      member_id: data.member?.id,
      employee_id: data.employee?.id,
      is_paid: data.isPaid,
      discounts: data.discounts.map((discount) => ({
        discount_type: discount.discount_type,
        discount_amount: discount.discount_amount,
        ...(discount.loyalty_reward_id && {
          loyalty_reward_id: discount.loyalty_reward_id,
        }),
      })),
      due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
      items:
        (data.items.map((item) => {
          const {
            trainers,
            // package_type,
            // loyalty_point,
            // classes,
            // instructors,
            // name,
            // sell_price,
            // is_promo,
            // data: itemData,
            // ...rest
          } = item

          // Base payload dengan field yang selalu ada
          const basePayload = {
            item_type: item.item_type,
            quantity: item.quantity,
            price: item.price,
            discount_type: item.discount_type || "nominal",
            discount: item.discount || 0,
            source_from: item.source_from || "item",
            loyalty_reward_id: item.loyalty_reward_id || null,
          }

          // Spesifik payload berdasarkan item_type
          if (item.item_type === "package") {
            return {
              ...basePayload,
              trainer_id: trainers?.id || null,
              package_id: item.package_id,
              extra_session: item.extra_session || 0,
              extra_day: item.extra_day || 0,
              start_date: item.start_date || null,
            }
          }

          if (item.item_type === "product") {
            return {
              ...basePayload,
              product_id: item.product_id,
            }
          }

          // if (item.item_type === 'freeze') {
          //   return {
          //     ...basePayload,
          //     start_date: item.start_date || null,
          //     end_date: item.end_date || null,
          //   }
          // }

          return basePayload
        }) as CheckoutRequest["items"]) || [],
      loyalty_redeem_items:
        (data.loyalty_redeem_items?.map((redeemItem) => ({
          id: redeemItem.id,
          points_required: redeemItem.points_required,
        })) as CheckoutRequest["loyalty_redeem_items"]) || [],
      payments: data.payments,
      refund_from: (data.refund_from as CheckoutRequest["refund_from"]) || [],
    }
    const bodyUpdatePayment = {
      transaction_id: Number(transactionId),
      is_paid: data.isPaid,
      balance: data.balance_amount,
      payments: data.payments
        .filter((payment) => payment.isDefault === false)
        .map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          payment_date: dayjs(payment.date).format("YYYY-MM-DD"),
        })),
      refund_from: (data.refund_from as CheckoutRequest["refund_from"]) || [],
    }

    // console.log("body", body)

    if (detailType === "refund") {
      // Submit refund
      const refundBody: RefundRequest = {
        transaction_id: Number(transactionId || detail?.id),
        club_id: club?.id as number,
        member_id: data.member?.id as number,
        employee_id: data.employee?.id as number,
        is_paid: data.isPaid,
        due_date: dayjs(data.due_date).format("YYYY-MM-DD"),
        notes: data.notes || undefined,
        items: data.items.map((item) => {
          const { trainers } = item
          const baseItem = {
            item_type: item.item_type,
            quantity: item.quantity, // Sudah negatif dari transformedData
            price: Math.abs(item.price), // Price harus positif
          }

          if (item.item_type === "package") {
            return {
              ...baseItem,
              package_id: item.package_id as number,
              trainer_id: trainers?.id,
            }
          }

          if (item.item_type === "product") {
            return {
              ...baseItem,
              product_id: item.product_id as number,
            }
          }

          return baseItem
        }),
        payments: data.payments
          .filter((payment) => payment.isDefault === false)
          .map((payment) => ({
            id: payment.id,
            // Pastikan amount negatif untuk refund
            amount:
              payment.amount < 0 ? payment.amount : -Math.abs(payment.amount),
            payment_date: dayjs(payment.date || new Date()).format(
              "YYYY-MM-DD"
            ),
          })),
      }

      // console.log("refundBody", refundBody)

      createRefund.mutate(refundBody)
    } else if (detailType === "create") {
      createCheckout.mutate(body)
    } else {
      if (isPaid === 0) {
        updateSales.mutate({ ...body, transaction_id: Number(transactionId) })
      } else {
        updateSalesPayment.mutate(bodyUpdatePayment)
      }
    }
    setConfirmPartPaid(false)
  }
  return (
    <>
      <div className="flex h-full w-full flex-col">
        <ScrollArea className="h-[calc(100vh-490px)] flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            <FormFieldItem
              control={control}
              name="member"
              label={
                <div className="flex w-full items-center gap-2">
                  {watchTransaction.items?.some(
                    (item) => item.item_type === "package"
                  ) ? (
                    <>
                      Member <span className="text-destructive">*</span>
                    </>
                  ) : (
                    "Member (Optional)"
                  )}
                </div>
              }
              invalid={Boolean(errors.member)}
              errorMessage="Member is required when a package is included."
              render={({ field, fieldState }) => (
                <SelectAsyncPaginate
                  isClearable
                  loadOptions={getMemberList as any}
                  additional={{ page: 1 }}
                  placeholder="Select member"
                  value={field.value}
                  isDisabled={isPaid !== 0 || detailType === "refund"}
                  cacheUniqs={[watchTransaction.member]}
                  getOptionLabel={(option) => option.name!}
                  getOptionValue={(option) => `${option.id}`}
                  debounceTimeout={500}
                  error={!!fieldState.error}
                  formatOptionLabel={({ name, photo }) => {
                    return (
                      <div className="flex items-center justify-start gap-2">
                        <Avatar className="size-8">
                          {photo ? (
                            <AvatarImage src={photo} alt={name} />
                          ) : null}
                          <AvatarFallback>
                            <User className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{name}</span>
                      </div>
                    )
                  }}
                  onChange={(option) => field.onChange(option)}
                />
              )}
            />
            <FormFieldItem
              control={control}
              name="employee"
              label="Sales (Optional)"
              invalid={Boolean(errors.employee)}
              errorMessage={errors.employee?.message}
              render={({ field, fieldState }) => (
                <SelectAsyncPaginate
                  isClearable
                  loadOptions={getEmployeeList as any}
                  additional={{ page: 1 }}
                  placeholder="Select Employee"
                  value={field.value as any}
                  isDisabled={
                    detailType === "refund" || detail?.employee !== null
                      ? isPaid !== 0
                      : false
                  }
                  cacheUniqs={[watchTransaction.employee]}
                  getOptionLabel={(option: any) => option.name || ""}
                  getOptionValue={(option: any) => option.id?.toString() || ""}
                  debounceTimeout={500}
                  error={!!fieldState.error}
                  formatOptionLabel={(option: any) => {
                    const { name, photo } = option
                    return (
                      <div className="flex items-center justify-start gap-2">
                        <Avatar className="size-8">
                          {photo ? (
                            <AvatarImage src={photo} alt={name} />
                          ) : null}
                          <AvatarFallback>
                            <User className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{name}</span>
                      </div>
                    )
                  }}
                  onChange={(option) => field.onChange(option)}
                />
              )}
            />
            {(isPaid === 1 || detail?.is_void === 1) && !isRefundMode ? null : (
              <FormFieldItem
                control={control}
                name="balance_amount"
                label={
                  <div className="flex w-full items-center gap-2">
                    {isRefundMode ? "Pengembalian" : "Payment"}{" "}
                    <span className="text-destructive">*</span>
                  </div>
                }
                invalid={Boolean(errors.balance_amount)}
                errorMessage={errors.balance_amount?.message}
                render={({ field }) => {
                  React.useEffect(() => {
                    // Set balance_amount dari cartDataGenerated
                    // Untuk refund mode, balance_amount sudah negatif dari generateCartData
                    if (field.value !== cartDataGenerated.balance_amount) {
                      field.onChange(cartDataGenerated.balance_amount)
                    }
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                  }, [cartDataGenerated.balance_amount])
                  return (
                    <InputCurrency
                      value={field.value}
                      disabled={isPaidOf}
                      allowNegativeValue
                      className="bg-primary-subtle text-primary focus:bg-primary-subtle h-20 text-center text-3xl! font-bold"
                      onValueChange={field.onChange}
                    />
                  )
                }}
              />
            )}

            {/* Payment Method grid */}
            <div className="mt-4">
              {!isRefundMode && isPaid === 1 && detail?.is_void === 0 ? (
                (() => {
                  // Tentukan status berdasarkan kondisi
                  let statusKey = "paid"
                  if (detail?.is_refunded === 1) {
                    statusKey = "refunded"
                  } else if (detail?.status) {
                    statusKey = detail.status.toLowerCase().replace(/\s+/g, "_")
                  }
                  const colorClass =
                    statusPaymentColor[statusKey] ||
                    statusPaymentColor.paid ||
                    statusPaymentColor.unpaid
                  const statusDisplay =
                    detail?.status?.split("_").join(" ") ||
                    statusKey.split("_").join(" ").toUpperCase() ||
                    "PAID"
                  return (
                    <div
                      className={cn(
                        "col-span-2 flex flex-col items-center justify-center rounded-xl border px-4 py-8",
                        colorClass
                      )}
                    >
                      <div className="mb-2">
                        <WalletCheck color="currentColor" size="50" />
                      </div>
                      <h1 className="text-3xl font-bold uppercase">
                        {statusDisplay}
                      </h1>
                    </div>
                  )
                })()
              ) : !isRefundMode && detail?.is_void === 1 ? (
                (() => {
                  const colorClass =
                    statusPaymentColor.void || statusPaymentColor.unpaid
                  const statusDisplay =
                    detail?.status?.split("_").join(" ") || "VOID"
                  return (
                    <div
                      className={cn(
                        "col-span-2 flex flex-col items-center justify-center rounded-xl border px-4 py-8",
                        colorClass
                      )}
                    >
                      <div className="mb-2">
                        <WalletCheck color="currentColor" size="50" />
                      </div>
                      <h1 className="text-3xl font-bold uppercase">
                        {statusDisplay}
                      </h1>
                    </div>
                  )
                })()
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {isLoadingRekenings ? (
                    // Skeleton loading untuk rekening
                    <>
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className="border-border bg-accent h-14 animate-pulse rounded-xl"
                        />
                      ))}
                    </>
                  ) : listRekenings.length > 0 ? (
                    // Tampilan daftar rekening
                    listRekenings.map((rekening) => {
                      const currentBalance = parseToDecimal(
                        watchTransaction.balance_amount
                      )
                      const balanceCheck = isRefundMode
                        ? currentBalance < 0
                        : currentBalance > 0

                      return (
                        <Button
                          key={rekening.id}
                          variant="default"
                          disabled={isPaidOf || !balanceCheck}
                          type="button"
                          onClick={() => {
                            if (!isPaidOf && balanceCheck) {
                              const updatedPayments = [...watch("payments")]
                              const existingPaymentIndex =
                                updatedPayments.findIndex(
                                  (item) =>
                                    item.id === rekening.id &&
                                    item.isDefault === false
                                )

                              // Untuk refund mode, amount harus negatif
                              const paymentAmount = isRefundMode
                                ? -Math.abs(parseToDecimal(currentBalance))
                                : parseToDecimal(currentBalance)

                              if (existingPaymentIndex !== -1) {
                                // Gabungkan dengan payment yang sudah ada
                                updatedPayments[existingPaymentIndex].amount +=
                                  paymentAmount
                              } else {
                                // Tambahkan payment baru
                                updatedPayments.push({
                                  id: rekening.id,
                                  name: rekening.name,
                                  amount: paymentAmount,
                                  isDefault: false,
                                })
                              }

                              formPropsTransaction.setValue(
                                "payments",
                                updatedPayments
                              )
                              // Hitung balance_amount
                              const totalPaymentsAmount =
                                updatedPayments.reduce(
                                  (acc, curr) => acc + curr.amount,
                                  0
                                )
                              const newBalanceAmount =
                                cartDataGenerated.total_amount -
                                totalPaymentsAmount

                              formPropsTransaction.setValue(
                                "balance_amount",
                                newBalanceAmount
                              )
                              formPropsTransaction.clearErrors("payments")
                            }
                          }}
                        >
                          {rekening.name?.toUpperCase()}
                        </Button>
                      )
                    })
                  ) : (
                    // Tampilan ketika tidak ada rekening
                    <div className="border-border bg-accent col-span-2 flex flex-col items-center justify-center rounded-xl px-4 py-8">
                      <div className="text-muted-foreground mb-2">
                        <EmptyWalletRemove color="currentColor" size="50" />
                      </div>
                      <h3 className="text-base font-medium">
                        Belum ada metode pembayaran
                      </h3>
                      <p className="text-muted-foreground mt-1 text-center text-sm">
                        Silakan tambahkan metode pembayaran terlebih dahulu di
                        menu pengaturan
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="border-border bg-card flex flex-col gap-2.5 border-t p-4">
          {/* Payment Details */}
          {cartDataGenerated?.payments &&
          cartDataGenerated.payments.length > 0 ? (
            <div className="space-y-2">
              {cartDataGenerated.payments
                .filter((item) => item.isDefault === false)
                .map((item, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center justify-start gap-1">
                      <span className="font-semibold">{`${item.name}`}</span>
                      {item.isDefault ? (
                        <span className="text-xs">{`${item?.date ? dayjs(new Date(item?.date || "")).format("DD MMM YYYY") : ""}`}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {currencyFormat(item.amount)}
                      </span>
                      {!item.isDefault && (
                        <span
                          className="text-destructive hover:text-destructive-hover cursor-pointer p-1"
                          onClick={() => {
                            formPropsTransaction.setValue("payments", [
                              ...watch("payments").filter(
                                (val: any) =>
                                  !(
                                    val.id === item.id &&
                                    val.isDefault === false
                                  )
                              ),
                            ])
                            const getRemoveTotal =
                              parseToDecimal(watch("balance_amount")) +
                              parseToDecimal(item.amount)
                            formPropsTransaction.setValue(
                              "balance_amount",
                              getRemoveTotal <= 0 ? 0 : getRemoveTotal
                            )
                          }}
                        >
                          <Trash color="currentColor" size="14" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
          <div className="grid w-full grid-cols-2 gap-2">
            {detail?.status !== "void" ? (
              <>
                {isRefundMode ? (
                  <div> </div>
                ) : (
                  <DropdownMenu
                    open={openDropdown}
                    onOpenChange={setOpenDropdown}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full", {
                          "border-primary text-primary": openDropdown,
                        })}
                      >
                        Lainnya
                        <ArrowDown2
                          color="currentColor"
                          size={16}
                          className={cn(
                            "ml-1 transition-transform duration-200",
                            {
                              "rotate-180": openDropdown,
                            }
                          )}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {detailType === "update" && [1].includes(isPaid) ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            navigate(`/sales/${detail?.code}/refund`)
                          }
                        >
                          Pengembalian
                        </DropdownMenuItem>
                      ) : null}
                      {(detailType === "update" &&
                        [0, 1, 2, 3].includes(isPaid)) ||
                      detail?.is_refunded ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setConfirmVoid(true)}
                        >
                          Dibatalkan
                        </DropdownMenuItem>
                      ) : null}
                      {!isPaidOf &&
                      watch("payments")?.filter(
                        (item) => item.isDefault === false
                      )?.length > 0 ? (
                        <DropdownMenuItem
                          onClick={() => {
                            const loyaltyRedeemItems =
                              watchTransaction.loyalty_redeem_items || []
                            if (loyaltyRedeemItems.length > 0) {
                              setUnpaidType("partial")
                              setConfirmUnpaid(true)
                            } else {
                              handleSubmit(handleCheck)()
                            }
                          }}
                        >
                          Simpan Dibayar Sebagian
                        </DropdownMenuItem>
                      ) : null}
                      {detailType === "create" ? (
                        <DropdownMenuItem
                          onClick={() => {
                            const loyaltyRedeemItems =
                              watchTransaction.loyalty_redeem_items || []
                            if (loyaltyRedeemItems.length > 0) {
                              setUnpaidType("unpaid")
                              setConfirmUnpaid(true)
                            } else {
                              handleSubmit((data) => {
                                onSubmit({ ...data, isPaid: 0, payments: [] })
                              })()
                            }
                          }}
                        >
                          Simpan Belum Dibayar
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {isPaid === 1 && !isRefundMode ? (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleBack}
                  >
                    Tutup
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    disabled={
                      (isRefundMode
                        ? !hasPaymentMethod || getTotal > 0 // Untuk refund: harus ada payment method DAN total payment sudah sesuai (getTotal = 0)
                        : getTotal > 0) || // Untuk normal: disabled jika total > 0
                      createCheckout.isPending ||
                      updateSales.isPending ||
                      updateSalesPayment.isPending ||
                      createRefund.isPending
                    }
                    onClick={handleSubmit((data) =>
                      handleSubmitWithReturnCheck({ ...data, isPaid: 1 })
                    )}
                  >
                    {createCheckout.isPending ||
                    updateSales.isPending ||
                    updateSalesPayment.isPending ||
                    createRefund.isPending ? (
                      <Spinner className="mr-2" />
                    ) : null}
                    {detailType === "create"
                      ? "Bayar sekarang"
                      : detailType === "update"
                        ? "Perbarui pesanan"
                        : "Bayar Pengembalian"}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  className="col-span-2 w-full"
                  onClick={handleBack}
                >
                  Tutup
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <AlertConfirm
        open={confirmPartPaid}
        title="Simpan Dibayar Sebagian"
        description="Apakah Anda yakin ingin menyimpan pembayaran ini sebagai dibayar sebagian?"
        rightTitle="Simpan Dibayar Sebagian"
        leftTitle="Simpan dengan Paket Aktif"
        type="delete"
        className="w-auto"
        icon={
          <div className="mb-2 rounded-full bg-red-100 p-2">
            <Warning2 size="70" color="#FF8A65" variant="Bulk" />
          </div>
        }
        onClose={() => setConfirmPartPaid(false)}
        onRightClick={handleSubmit((data) => {
          onSubmit({ ...data, isPaid: 2 })
        })}
        onLeftClick={handleSubmit((data) => {
          onSubmit({ ...data, isPaid: 3 })
        })}
      />

      <AlertConfirm
        open={confirmVoid}
        title="Batalkan Pesanan"
        description="Apakah Anda yakin ingin membatalkan pesanan ini?"
        rightTitle="Batalkan"
        type="delete"
        className="w-auto"
        icon={
          <div className="mb-2 rounded-full bg-red-100 p-2">
            <Warning2 size="70" color="#FF8A65" variant="Bulk" />
          </div>
        }
        loading={voidSales.isPending}
        onClose={() => setConfirmVoid(false)}
        onLeftClick={() => setConfirmVoid(false)}
        onRightClick={() => {
          if (detail) {
            voidSales.mutate(detail.id)
          }
        }}
      />

      <AlertConfirm
        open={confirmUnpaid}
        title={
          unpaidType === "unpaid"
            ? "Tidak Dapat Simpan Belum Dibayar"
            : "Tidak Dapat Simpan Dibayar Sebagian"
        }
        description={
          unpaidType === "unpaid"
            ? "Tidak dapat menyimpan transaksi sebagai belum dibayar jika ada redeem point. Redeem point hanya dapat digunakan untuk transaksi yang sudah dibayar. Harap hapus redeem point terlebih dahulu atau simpan transaksi sebagai sudah dibayar."
            : "Tidak dapat menyimpan transaksi sebagai dibayar sebagian jika ada redeem point. Redeem point hanya dapat digunakan untuk transaksi yang sudah dibayar penuh. Harap hapus redeem point terlebih dahulu atau simpan transaksi sebagai sudah dibayar penuh."
        }
        rightTitle="Mengerti"
        type="confirm"
        className="w-auto"
        icon={
          <div className="mb-2 rounded-full bg-yellow-100 p-2">
            <Warning2 size="70" color="#FF8A65" variant="Bulk" />
          </div>
        }
        closable={true}
        onClose={() => setConfirmUnpaid(false)}
        onRightClick={() => setConfirmUnpaid(false)}
      />

      <AlertConfirm
        open={confirmReturn}
        title="Kelebihan Pembayaran"
        description={`Total pembayaran melebihi total transaksi. Ada kelebihan pembayaran sebesar ${cartDataGenerated.freturn_amount}. Apakah Anda ingin menyimpan transaksi dengan kembalian ini?`}
        leftTitle="Batal"
        rightTitle="Simpan dengan Kembalian"
        type="confirm"
        className="w-auto"
        icon={
          <div className="mb-2 rounded-full bg-blue-100 p-2">
            <WalletCheck size="70" color="#3B82F6" variant="Bulk" />
          </div>
        }
        onClose={() => {
          setConfirmReturn(false)
          setPendingSubmitData(null)
        }}
        onLeftClick={() => {
          setConfirmReturn(false)
          setPendingSubmitData(null)
        }}
        onRightClick={() => {
          if (pendingSubmitData) {
            onSubmit(pendingSubmitData)
            setConfirmReturn(false)
            setPendingSubmitData(null)
          }
        }}
      />
    </>
  )
}

export default FormPayment
