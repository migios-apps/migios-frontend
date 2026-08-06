import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MemberDetail } from "@/services/api/@types/member"
import { CheckoutRequest } from "@/services/api/@types/sales"
import { apiGetMemberList } from "@/services/api/MembeService"
import { apiCreateCheckout } from "@/services/api/SalesService"
import { AlertCircle, Save, X } from "lucide-react"
import { useNavigate } from "react-router"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import FreezePaymentPicker from "./FreezePaymentPicker"
import FreezePeriodPicker from "./FreezePeriodPicker"
import FreezeQuotaInfo from "./FreezeQuotaInfo"
import {
  ReturnTransactionFreezeFormSchema,
  ValidationTransactionFreezeSchema,
  resetTransactionFreezeForm,
} from "./freezeValidation"
import { useFreezeRequest } from "./useFreezeRequest"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnTransactionFreezeFormSchema
  onClose: () => void
}

const FormGlobalFreeze: React.FC<FormProps> = ({
  open,
  formProps,
  onClose,
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const { watch, control, handleSubmit, setValue, formState } = formProps
  const [selectedMember, setSelectedMember] =
    React.useState<MemberDetail | null>(null)

  const watchTransaction = watch()
  const startDate = watchTransaction?.items?.[0]?.start_date
  const endDate = watchTransaction?.items?.[0]?.end_date

  const {
    quota,
    requestedDays,
    earliestStartDate,
    periodHint,
    packageEndDate,
    capByPackage,
    startKey,
    durationError,
    freezeFee,
    feeExplanation,
    blockSubmit,
  } = useFreezeRequest({
    memberCode: selectedMember?.code,
    startDate,
    endDate,
  })

  const sudahDirapikan = React.useRef(false)

  React.useEffect(() => {
    if (!open) sudahDirapikan.current = false
  }, [open])

  React.useEffect(() => {
    if (sudahDirapikan.current) return
    if (!earliestStartDate || !startDate) return

    const from = dayjs(startDate).isBefore(dayjs(earliestStartDate), "day")
      ? dayjs(earliestStartDate)
      : dayjs(startDate)

    const cap =
      quota?.remaining_days != null
        ? from.add(Math.max(quota.remaining_days, 1) - 1, "day")
        : null

    let to = endDate ? dayjs(endDate) : from
    if (to.isBefore(from, "day")) to = from
    if (!endDate || to.isSame(from, "day")) to = cap ?? from
    if (cap && to.isAfter(cap, "day")) to = cap
    sudahDirapikan.current = true

    if (!from.isSame(dayjs(startDate), "day")) {
      setValue("items.0.start_date", from.toDate() as never)
    }
    if (!endDate || !to.isSame(dayjs(endDate), "day")) {
      setValue("items.0.end_date", to.toDate() as never)
    }
  }, [earliestStartDate, startDate, endDate, quota?.remaining_days, setValue])

  React.useEffect(() => {
    setValue("balance_amount", freezeFee)
    const payment = watchTransaction.payments?.[0]
    if (payment) {
      setValue("payments", [{ ...payment, amount: freezeFee }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freezeFee, setValue])

  const periodError =
    formState.errors.items?.[0]?.start_date?.message ??
    formState.errors.items?.[0]?.end_date?.message

  const handleClose = () => {
    setSelectedMember(null)
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.freezeProgram] })
    handleClose()
    resetTransactionFreezeForm(formProps)
  }

  // Mutations
  const createCheckout = useMutation({
    mutationFn: (data: CheckoutRequest) => apiCreateCheckout(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: (data: any) => {
      handlePrefecth()
      navigate(`/sales/${data.data.updated_transaction.code}`)
    },
  })

  const onSubmit: SubmitHandler<ValidationTransactionFreezeSchema> = (data) => {
    if (!selectedMember) return

    const body = {
      club_id: club?.id as number,
      member_id: selectedMember.id as number,
      balance_amount: data.balance_amount,
      is_paid: 1,
      discount_type: "nominal",
      discount: 0,
      tax_rate: data.tax_rate || 0,
      due_date: dayjs().format("YYYY-MM-DD"),
      items: data.items.map((item) => ({
        ...item,
        item_type: "freeze",
        name: "Freeze",
        price: data.balance_amount,
        quantity: 1,
        start_date: dayjs(item.start_date).format("YYYY-MM-DD"),
        end_date: dayjs(item.end_date).format("YYYY-MM-DD"),
        notes: data.notes,
      })),
      payments: freezeFee > 0 ? data.payments : [],
      refund_from: [],
    }

    createCheckout.mutate(body as unknown as CheckoutRequest)
  }

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
                search_operator: "or",
              } as any)
            : null,
          (inputValue || "").length > 0
            ? ({
                search_column: "code",
                search_condition: "like",
                search_text: `${inputValue}`,
                search_operator: "or",
              } as any)
            : null,
        ],
      })
      const eligible = response.data.data.filter(
        (member) => Number(member.membeship_status_code) === 1
      )
      const meta = response.data.meta

      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: eligible,
          hasMore: meta.page < meta.total_page,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    []
  )

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent floating className="gap-0 sm:max-w-xl">
        <Form {...formProps}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <SheetHeader>
              <SheetTitle>Tambah Freeze</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden px-2 pr-1">
              <ScrollArea className="h-full px-2 pr-3">
                <div className="space-y-6 px-1 pb-4">
                  {/* Select Member - Hidden when member selected */}
                  {!selectedMember && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Pilih Member</h3>
                        <p className="text-muted-foreground text-sm">
                          Hanya member berpaket aktif dan belum sedang freeze
                          yang bisa dipilih
                        </p>
                      </div>
                      <SelectAsyncPaginate<MemberDetail>
                        isClearable
                        loadOptions={getMemberList as any}
                        additional={{ page: 1 }}
                        placeholder="Cari nama atau kode member..."
                        noOptionsMessage={() =>
                          "Tidak ada member berpaket aktif yang cocok"
                        }
                        value={selectedMember}
                        cacheUniqs={[selectedMember]}
                        getOptionLabel={(option) =>
                          `${option?.name} - ${option?.code}`
                        }
                        getOptionValue={(option) =>
                          option?.id?.toString() || ""
                        }
                        debounceTimeout={500}
                        onChange={(val) => {
                          setSelectedMember(val)
                        }}
                      />
                    </div>
                  )}

                  {selectedMember && (
                    <>
                      {/* Member Info with Remove Button */}
                      <div className="bg-muted/50 relative rounded-lg p-4">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 size-8"
                          onClick={() => setSelectedMember(null)}
                        >
                          <X className="size-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                          {selectedMember.photo && (
                            <img
                              src={selectedMember.photo}
                              alt={selectedMember.name}
                              className="size-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="text-foreground font-semibold capitalize">
                              {selectedMember.name}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {selectedMember.code}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Freeze Period */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Periode Freeze
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Tentukan durasi freeze member
                          </p>
                        </div>
                        <FreezeQuotaInfo
                          memberCode={selectedMember?.code}
                          requestedDays={requestedDays}
                          startDate={startKey}
                        />
                        {durationError ? (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{durationError}</AlertDescription>
                          </Alert>
                        ) : null}
                        <FormFieldItem
                          control={control}
                          name={`items.${0}.start_date`}
                          label={<FormLabel>Rentang Tanggal</FormLabel>}
                          invalid={Boolean(periodError)}
                          errorMessage={periodError}
                          description={periodHint}
                          render={() => (
                            <FreezePeriodPicker
                              start={startDate}
                              end={endDate}
                              earliest={earliestStartDate}
                              remainingDays={quota?.remaining_days}
                              packageEndDate={packageEndDate}
                              capByPackage={capByPackage}
                              error={Boolean(durationError || periodError)}
                              onChange={(from, to) => {
                                setValue("items.0.start_date", from as never, {
                                  shouldDirty: true,
                                })
                                setValue("items.0.end_date", to as never, {
                                  shouldDirty: true,
                                })
                              }}
                            />
                          )}
                        />
                        <FormFieldItem
                          control={control}
                          name="notes"
                          label={<FormLabel>Keterangan</FormLabel>}
                          render={({ field }) => (
                            <Textarea
                              placeholder="Tambahkan keterangan freeze"
                              autoComplete="off"
                              {...field}
                              value={field.value ?? ""}
                            />
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Payment */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold">Pembayaran</h3>
                          <p className="text-muted-foreground text-sm">
                            Tentukan jumlah dan metode pembayaran
                          </p>
                        </div>
                        <FreezePaymentPicker
                          fee={freezeFee}
                          feeExplanation={feeExplanation}
                          rekeningId={watchTransaction.payments?.[0]?.id}
                          onChangeRekening={(id, name) =>
                            setValue("payments", [
                              { id, name, amount: freezeFee },
                            ] as never)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
            <SheetFooter className="px-4 py-2">
              <div className="flex w-full items-center justify-end gap-2">
                <Button variant="outline" type="button" onClick={handleClose}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !selectedMember ||
                    createCheckout.isPending ||
                    (freezeFee > 0 && watch("payments").length < 1) ||
                    blockSubmit
                  }
                  className="min-w-[120px]"
                >
                  <Save className="mr-2 size-4" />
                  {createCheckout.isPending
                    ? "Menyimpan..."
                    : quota?.require_approval === false
                      ? "Freeze Sekarang"
                      : "Simpan"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default FormGlobalFreeze
