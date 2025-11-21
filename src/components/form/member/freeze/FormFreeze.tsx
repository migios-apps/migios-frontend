import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useMember } from "@/pages/members/store/useMember"
import { RekeningDetail } from "@/services/api/@types/finance"
import { CheckoutRequest } from "@/services/api/@types/sales"
import { apiGetRekeningList } from "@/services/api/FinancialService"
import { apiCreateCheckout } from "@/services/api/SalesService"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
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
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Tambah Freeze</SheetTitle>
        </SheetHeader>
        <Form {...formProps}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
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
              <FormFieldItem
                control={control}
                name={`items.${0}.start_date`}
                label="Start Date"
                render={({ field }) => (
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
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name={`items.${0}.end_date`}
                label="End Date"
                render={({ field }) => (
                  <DatePicker
                    selected={
                      field.value ? dayjs(field.value).toDate() : undefined
                    }
                    onSelect={(date) => {
                      field.onChange(
                        date ? dayjs(date).format("YYYY-MM-DD") : null
                      )
                    }}
                    placeholder="End Date"
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="notes"
                label="Description"
                render={({ field }) => (
                  <Textarea
                    placeholder="Add Freeze Description"
                    autoComplete="off"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="balance_amount"
                label={
                  <FormLabel>
                    Payment <span className="text-destructive">*</span>
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
                    Payment Method <span className="text-destructive">*</span>
                  </FormLabel>
                }
                render={({ field }) => (
                  <SelectAsyncPaginate
                    isClearable
                    loadOptions={getRekeningList as any}
                    additional={{ page: 1 }}
                    placeholder="Select Payment"
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
            </div>
            <SheetFooter>
              <Button
                type="submit"
                disabled={
                  createCheckout.isPending || watch("payments").length < 1
                }
              >
                {createCheckout.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default FormFreeze
