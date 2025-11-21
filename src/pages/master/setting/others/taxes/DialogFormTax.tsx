import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateTaxesType } from "@/services/api/@types/settings/taxes"
import {
  apiCreateTax,
  apiDeleteTax,
  apiUpdateTax,
} from "@/services/api/settings/TaxesService"
import { Trash2 } from "lucide-react"
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  CreateTaxSchema,
  ReturnTaxFormSchema,
  resetTaxForm,
} from "./validation"

type DialogFormTaxProps = {
  type: "create" | "update"
  formProps: ReturnTaxFormSchema
  open: boolean
  onClose: () => void
}

const DialogFormTax: React.FC<DialogFormTaxProps> = ({
  type,
  formProps,
  open,
  onClose,
}) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const queryClient = useQueryClient()
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = formProps
  const watchData = watch()

  const handleClose = () => {
    resetTaxForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.taxList] })
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.taxDefaultSaleItem] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateTaxesType) => apiCreateTax(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateTaxesType) =>
      apiUpdateTax(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteTax(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmitTax = (data: CreateTaxSchema) => {
    if (type === "update") {
      update.mutate({
        name: data.name,
        rate: data.rate,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        name: data.name,
        rate: data.rate,
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
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Tarif Pajak Baru" : "Ubah Tarif Pajak"}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmitTax)}>
              <div className="space-y-4">
                <FormFieldItem
                  control={control}
                  name="name"
                  label={
                    <FormLabel>
                      Nama <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.name)}
                  errorMessage={errors.name?.message}
                  render={({ field }) => (
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Nama"
                      {...field}
                    />
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="rate"
                  label={<FormLabel>Rate</FormLabel>}
                  invalid={Boolean(errors.rate)}
                  errorMessage={errors.rate?.message}
                  render={({ field }) => (
                    <InputGroup>
                      <InputGroupInput
                        type="number"
                        autoComplete="off"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                      />
                      <InputGroupAddon>%</InputGroupAddon>
                    </InputGroup>
                  )}
                />
              </div>
              <div className="mt-6 flex gap-4">
                {type === "update" ? (
                  <Button
                    variant="destructive"
                    type="button"
                    className="w-1/2"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Hapus
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    type="button"
                    className="w-1/2"
                    onClick={handleClose}
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  className="w-1/2"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Tax"
        description="Are you sure want to delete this tax?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default DialogFormTax
