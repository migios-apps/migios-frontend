import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateCategory } from "@/services/api/@types/finance"
import {
  apiCreateCategory,
  apiDeleteCategory,
  apiUpdateCategory,
} from "@/services/api/FinancialService"
import { Trash2 } from "lucide-react"
import { useSessionUser } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import {
  CreateCategorySchema,
  ReturnCategoryFormSchema,
} from "./financeValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnCategoryFormSchema
  onClose: () => void
}

const CategoryForm: React.FC<FormProps> = ({
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
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.financialCategory] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateCategory) => apiCreateCategory(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateCategory) =>
      apiUpdateCategory(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteCategory(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateCategorySchema> = (data) => {
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        name: data.name,
        type: data.type,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        name: data.name,
        type: data.type,
      })
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Category" : "Update Category"}
            </DialogTitle>
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormFieldItem
                control={control}
                name="name"
                label={
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Name"
                    {...field}
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
                  <div className="flex w-full items-center gap-2">
                    <Button
                      variant={field.value === "income" ? "default" : "outline"}
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
                          "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      )}
                      onClick={() => field.onChange("expense")}
                    >
                      Expense
                    </Button>
                  </div>
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
        title="Delete Category"
        description="Are you sure want to delete this category?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default CategoryForm
