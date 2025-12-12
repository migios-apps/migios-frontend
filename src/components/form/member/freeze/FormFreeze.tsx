import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMember } from "@/pages/members/store/useMember"
import { RekeningDetail } from "@/services/api/@types/finance"
import { CheckoutRequest } from "@/services/api/@types/sales"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import { apiCreateCheckout } from "@/services/api/SalesService"
import dayjs from "dayjs"
import { Save } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import {
  ReturnTransactionFreezeFormSchema,
  ValidationTransactionFreezeSchema,
  resetTransactionFreezeForm,
} from "./freezeValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnTransactionFreezeFormSchema
  onClose: () => void
}

const FormFreeze: React.FC<FormProps> = ({ open, formProps, onClose }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { member } = useMember()
  const club = useSessionUser((state) => state.club)
  const { watch, control, handleSubmit } = formProps

  const watchTransaction = watch()

  const handleClose = () => {
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
    const body = {
      club_id: club?.id as number,
      member_id: member?.id as number,
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
      payments: data.payments,
      refund_from: [],
    }

    createCheckout.mutate(body as unknown as CheckoutRequest)
    // setConfirmPartPaid(false)
  }

  const getRekeningList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<RekeningDetail, GroupBase<RekeningDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetRekeningList({
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
          {
            search_operator: "and",
            search_column: "show_in_payment",
            search_condition: "=",
            search_text: 1,
          },
          {
            search_operator: "or",
            search_column: "show_in_payment",
            search_condition: "=",
            search_text: 2,
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
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
                  {/* Member Info */}
                  <Card className="shadow-none">
                    <CardHeader>
                      <CardTitle>Informasi Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-foreground font-semibold capitalize">
                            {member?.name}
                          </span>
                          <span className="text-muted-foreground text-sm font-bold">
                            {member?.code}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Freeze Period */}
                  <Card className="shadow-none">
                    <CardHeader>
                      <CardTitle>Periode Freeze</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormFieldItem
                        control={control}
                        name={`items.${0}.start_date`}
                        label={<FormLabel>Tanggal Mulai</FormLabel>}
                        render={({ field }) => (
                          <DateTimePicker
                            value={
                              field.value
                                ? (field.value as unknown as Date)
                                : undefined
                            }
                            onChange={(date) => {
                              field.onChange(
                                date ? dayjs(date).format("YYYY-MM-DD") : null
                              )
                            }}
                            hideTime={true}
                            clearable
                          />
                        )}
                      />
                      <FormFieldItem
                        control={control}
                        name={`items.${0}.end_date`}
                        label={<FormLabel>Tanggal Selesai</FormLabel>}
                        render={({ field }) => (
                          <DateTimePicker
                            value={
                              field.value
                                ? (field.value as unknown as Date)
                                : undefined
                            }
                            onChange={(date) => {
                              field.onChange(
                                date ? dayjs(date).format("YYYY-MM-DD") : null
                              )
                            }}
                            hideTime={true}
                            clearable
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
                    </CardContent>
                  </Card>

                  {/* Payment */}
                  <Card className="shadow-none">
                    <CardHeader>
                      <CardTitle>Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormFieldItem
                        control={control}
                        name="balance_amount"
                        label={
                          <FormLabel>
                            Jumlah Pembayaran{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        render={({ field }) => (
                          <InputCurrency
                            value={field.value}
                            placeholder="0"
                            className="bg-primary/10 text-primary focus:bg-primary/10 h-20 text-center text-2xl font-bold"
                            onValueChange={(_value, _name, values) => {
                              field.onChange(values?.float)
                            }}
                          />
                        )}
                      />
                      <FormFieldItem
                        control={control}
                        name="payments"
                        label={
                          <FormLabel>
                            Metode Pembayaran{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        render={({ field }) => (
                          <SelectAsyncPaginate
                            isClearable
                            loadOptions={getRekeningList as any}
                            additional={{ page: 1 }}
                            placeholder="Pilih metode pembayaran"
                            value={field.value[0]}
                            cacheUniqs={[watchTransaction.payments[0]]}
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => option.id?.toString()}
                            debounceTimeout={500}
                            onChange={(val, ctx) => {
                              if (ctx.action === "clear") {
                                field.onChange([])
                                formProps.setValue(
                                  "balance_amount",
                                  watchTransaction.balance_amount
                                )
                                formProps.setError("payments", {
                                  type: "custom",
                                  message: "Payment method is required",
                                })
                              } else {
                                field.onChange([
                                  {
                                    id: val?.id,
                                    name: val?.name,
                                    amount: watchTransaction.balance_amount,
                                  },
                                ])
                                formProps.clearErrors("payments")
                              }
                            }}
                          />
                        )}
                      />
                    </CardContent>
                  </Card>
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
                    createCheckout.isPending || watch("payments").length < 1
                  }
                  className="min-w-[120px]"
                >
                  <Save className="mr-2 size-4" />
                  {createCheckout.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default FormFreeze
