import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CategoryDetail,
  CreateFinancialRecord,
  RekeningDetail,
} from "@/services/api/@types/finance"
import {
  apiCreateFinancialRecord,
  apiDeleteFinancialRecord,
  apiGetCategoryList,
  apiGetRekeningList,
  apiUpdateFinancialRecord,
} from "@/services/api/FinancialService"
import dayjs from "dayjs"
import { Trash2 } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import {
  CreateFinancialRecordSchema,
  ReturnFinancialRecordFormSchema,
} from "./financeValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnFinancialRecordFormSchema
  onClose: () => void
}

const FinanceRecord: React.FC<FormProps> = ({
  open,
  type,
  formProps,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.financialRecord] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateFinancialRecord) => apiCreateFinancialRecord(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateFinancialRecord) =>
      apiUpdateFinancialRecord(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteFinancialRecord(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateFinancialRecordSchema> = (data) => {
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        financial_category_id: data.category.id,
        rekening_id: data.rekening.id,
        amount: parseFloat(data.amount as unknown as string),
        type: data.type,
        description: data?.description as string,
        editable: data.editable,
        date: dayjs(data.date).format("YYYY-MM-DD"),
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        financial_category_id: data.category.id,
        rekening_id: data.rekening.id,
        amount: parseFloat(data.amount as unknown as string),
        type: data.type,
        description: data?.description as string,
        editable: data.editable,
        date: dayjs(data.date).format("YYYY-MM-DD"),
      })
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

  const getCategoryList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<CategoryDetail, GroupBase<CategoryDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetCategoryList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          ...((inputValue || "").length > 0
            ? [
                {
                  search_column: "name",
                  search_condition: "like" as const,
                  search_text: `${inputValue}`,
                },
              ]
            : []),
          {
            search_operator: "and" as const,
            search_column: "type",
            search_condition: "=" as const,
            search_text: `${watchData.type}`,
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
    [watchData.type]
  )

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
          ...((inputValue || "").length > 0
            ? [
                {
                  search_column: "name",
                  search_condition: "like" as const,
                  search_text: `${inputValue}`,
                },
              ]
            : []),
          {
            search_operator: "and" as const,
            search_column: "enabled",
            search_condition: "=" as const,
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
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create"
                ? "Create Financial Record"
                : "Update Financial Record"}
            </DialogTitle>
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormFieldItem
                control={control}
                name="date"
                label={
                  <FormLabel>
                    Date <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.date)}
                errorMessage={errors.date?.message}
                render={({ field, fieldState }) => (
                  <DatePicker
                    selected={field.value}
                    onSelect={field.onChange}
                    placeholder="Date"
                    error={!!fieldState.error}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="type"
                label={
                  <FormLabel>
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.type)}
                errorMessage={errors.type?.message}
                render={({ field }) => (
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Button
                      variant={field.value === "income" ? "default" : "outline"}
                      type="button"
                      onClick={() => field.onChange("income")}
                      className={cn(
                        "w-full",
                        field.value === "income" &&
                          "bg-green-500 hover:bg-green-500/90"
                      )}
                    >
                      Income
                    </Button>
                    <Button
                      variant={
                        field.value === "expense" ? "destructive" : "outline"
                      }
                      type="button"
                      onClick={() => field.onChange("expense")}
                    >
                      Expense
                    </Button>
                  </div>
                )}
              />
              <FormFieldItem
                control={control}
                name="category"
                label={
                  <FormLabel>
                    Category <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.category)}
                errorMessage={errors.category?.message}
                render={({ field, fieldState }) => (
                  <SelectAsyncPaginate
                    isClearable
                    isDisabled={!watchData.type}
                    loadOptions={getCategoryList}
                    additional={{ page: 1 }}
                    placeholder="Select Category"
                    value={field.value as CategoryDetail | undefined}
                    cacheUniqs={[watchData.type]}
                    getOptionLabel={(option) => option.name!}
                    getOptionValue={(option) => option.id.toString()}
                    debounceTimeout={500}
                    onChange={(option) => field.onChange(option)}
                    error={!!fieldState.error}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="rekening"
                label={
                  <FormLabel>
                    Rekening <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.rekening)}
                errorMessage={errors.rekening?.message}
                render={({ field, fieldState }) => (
                  <SelectAsyncPaginate
                    isClearable
                    loadOptions={getRekeningList}
                    additional={{ page: 1 }}
                    placeholder="Select Rekening"
                    value={field.value as RekeningDetail | undefined}
                    getOptionLabel={(option) => option.name!}
                    getOptionValue={(option) => option.id.toString()}
                    debounceTimeout={500}
                    onChange={(option) => field.onChange(option)}
                    error={!!fieldState.error}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="amount"
                label={
                  <FormLabel>
                    Amount <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.amount)}
                errorMessage={errors.amount?.message}
                render={({ field }) => (
                  <InputCurrency
                    placeholder="Rp. 0"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="description"
                label={<FormLabel>Description</FormLabel>}
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                render={({ field }) => (
                  <Textarea
                    placeholder="Description"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
            </form>
          </Form>
          <DialogFooter className="flex items-center justify-between">
            {type === "update" ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <div></div>
            )}
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {create.isPending || update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Record"
        description="Are you sure want to delete this record?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FinanceRecord
