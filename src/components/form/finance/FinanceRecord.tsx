import React from "react"
import { Controller, SubmitHandler } from "react-hook-form"
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
import InputCurrency from "@/components/ui/input-currency"
import {
  type ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Form, FormItem } from "@/components/ui/rh-form"
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
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
              } as any)
            : null,
          {
            search_operator: "and",
            search_column: "type",
            search_condition: "=",
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
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <FormItem
                asterisk
                label="Date"
                className="w-full"
                invalid={Boolean(errors.date)}
                errorMessage={errors.date?.message}
              >
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Date"
                    />
                  )}
                />
              </FormItem>
              <FormItem
                asterisk
                label="Type"
                className="w-full"
                invalid={Boolean(errors.type)}
                errorMessage={errors.type?.message}
              >
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex w-full items-center gap-2">
                      <Button
                        variant={
                          field.value === "income" ? "default" : "outline"
                        }
                        type="button"
                        className="w-full"
                        onClick={() => field.onChange("income")}
                      >
                        Income
                      </Button>
                      <Button
                        variant={
                          field.value === "expense" ? "default" : "outline"
                        }
                        type="button"
                        className={cn(
                          "w-full",
                          field.value === "expense" &&
                            "bg-yellow-500 hover:bg-yellow-600"
                        )}
                        onClick={() => field.onChange("expense")}
                      >
                        Expense
                      </Button>
                    </div>
                  )}
                />
              </FormItem>
              <FormItem
                asterisk
                label="Category"
                invalid={Boolean(errors.category)}
                errorMessage={errors.category?.message}
              >
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <SelectAsyncPaginate
                      isClearable
                      //   isLoading={isLoading}
                      isDisabled={!watchData.type}
                      loadOptions={getCategoryList as any}
                      additional={{ page: 1 }}
                      placeholder="Select Category"
                      value={field.value}
                      cacheUniqs={[watchData.type]}
                      getOptionLabel={(option) => option.name!}
                      getOptionValue={(option) => option.id.toString()}
                      debounceTimeout={500}
                      onChange={(option) => field.onChange(option)}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                asterisk
                label="Rekening"
                invalid={Boolean(errors.rekening)}
                errorMessage={errors.rekening?.message}
              >
                <Controller
                  name="rekening"
                  control={control}
                  render={({ field }) => (
                    <SelectAsyncPaginate
                      isClearable
                      //   isLoading={isLoading}
                      loadOptions={getRekeningList as any}
                      additional={{ page: 1 }}
                      placeholder="Select Rekening"
                      value={field.value}
                      //   cacheUniqs={[watchData.category]}
                      getOptionLabel={(option) => option.name!}
                      getOptionValue={(option) => option.id.toString()}
                      debounceTimeout={500}
                      onChange={(option) => field.onChange(option)}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                asterisk
                label="Amount"
                invalid={Boolean(errors.amount)}
                errorMessage={errors.amount?.message}
              >
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <InputCurrency
                      placeholder="Rp. 0"
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  )}
                />
              </FormItem>
              <FormItem
                label="Description"
                className="mb-2 w-full"
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      placeholder="description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </FormItem>
            </div>
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
