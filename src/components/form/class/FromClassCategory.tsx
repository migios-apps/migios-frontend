import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateClassCategoryPage } from "@/services/api/@types/class"
import {
  apiCreateClassCategory,
  apiDeleteClassCategory,
  apiUpdateClassCategory,
} from "@/services/api/ClassService"
import { Trash2 } from "lucide-react"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  ClassCategoryPageFormSchema,
  ReturnClassCategoryPageFormSchema,
  resetClassCategoryPageForm,
} from "./validation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnClassCategoryPageFormSchema
  onClose: () => void
}

const FromClassCategory: React.FC<FormProps> = ({
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
    resetClassCategoryPageForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.financialCategory] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateClassCategoryPage) => apiCreateClassCategory(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateClassCategoryPage) =>
      apiUpdateClassCategory(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteClassCategory(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<ClassCategoryPageFormSchema> = (data) => {
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        name: data.name,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        name: data.name,
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
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Category" : "Update Category"}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormFieldItem
                  control={control}
                  name="name"
                  label={
                    <FormLabel>
                      Name <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  render={({ field }) => (
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Name"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mt-6 flex items-center justify-between gap-2 text-right">
                {type === "update" ? (
                  <Button
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-1"
                    variant="destructive"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
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

export default FromClassCategory
