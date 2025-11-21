import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateLoyaltyType } from "@/services/api/@types/settings/loyalty"
import {
  apiCreateLoyalty,
  apiDeleteLoyalty,
  apiUpdateLoyalty,
} from "@/services/api/settings/LoyaltyService"
import { Minus, Plus, Trash2 } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { InputGroup, InputGroupText } from "@/components/ui/input-group"
import {
  CreateLoyaltySchema,
  ReturnLoyaltyFormSchema,
  resetLoyaltyForm,
} from "./validation"

type DialogFormDiscountProps = {
  formProps: ReturnLoyaltyFormSchema
  open: boolean
  type: "create" | "update"
  onClose: () => void
  onSuccess?: () => void
}

const DialogFormDiscount: React.FC<DialogFormDiscountProps> = ({
  formProps,
  open,
  type,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const { control, handleSubmit, watch } = formProps

  const watchData = watch()

  const handleClose = () => {
    resetLoyaltyForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    onSuccess?.()
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.loyaltyList] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateLoyaltyType) => apiCreateLoyalty(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateLoyaltyType) =>
      apiUpdateLoyalty(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteLoyalty(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

  const handleFormSubmit = (data: CreateLoyaltySchema) => {
    if (type === "update") {
      update.mutate({
        name: "Discount",
        discount_type: data.discount_type as "percent" | "nominal",
        discount_value: data.discount_value as number,
        reward_items: [],
        type: "discount",
        points_required: data.points_required,
        enabled: data.enabled,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        name: "Discount",
        discount_type: data.discount_type as "percent" | "nominal",
        discount_value: data.discount_value as number,
        reward_items: [],
        type: "discount",
        points_required: data.points_required,
        enabled: data.enabled,
      })
      return
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Diskon Baru" : "Ubah Diskon"}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <FormFieldItem
                control={control}
                name="points_required"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel>Point yang diperlukan</FormLabel>
                    <InputGroup>
                      <Input
                        type="number"
                        autoComplete="off"
                        placeholder="0 Point"
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? 0 : Number(e.target.value)
                          field.onChange(value)
                        }}
                      />
                      <InputGroupText>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={field.value <= 0}
                          onClick={() => {
                            const newValue = Number(field.value) - 1
                            if (newValue >= 1) {
                              field.onChange(newValue)
                            }
                          }}
                        >
                          <Minus className="size-4" />
                        </Button>
                      </InputGroupText>
                      <InputGroupText>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newValue = Number(field.value) + 1
                            field.onChange(newValue)
                          }}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </InputGroupText>
                    </InputGroup>
                  </div>
                )}
              />

              <FormFieldItem
                control={control}
                name="discount_value"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel>Jumlah Diskon</FormLabel>
                    <InputGroup>
                      {watchData.discount_type === "nominal" ? (
                        <InputCurrency
                          placeholder="0"
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      ) : (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="0"
                          {...field}
                        />
                      )}
                      <InputGroupText>
                        <Button
                          type="button"
                          variant={
                            watchData.discount_type === "percent"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            formProps.setValue("discount_type", "percent")
                            formProps.setValue("discount_value", undefined)
                          }}
                        >
                          %
                        </Button>
                      </InputGroupText>
                      <InputGroupText>
                        <Button
                          type="button"
                          variant={
                            watchData.discount_type === "nominal"
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            formProps.setValue("discount_type", "nominal")
                            formProps.setValue("discount_value", undefined)
                          }}
                        >
                          Rp
                        </Button>
                      </InputGroupText>
                    </InputGroup>
                  </div>
                )}
              />

              <DialogFooter>
                {type === "update" ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Hapus
                  </Button>
                ) : (
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Loyalty Discount"
        description="Are you sure want to delete this loyalty discount?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default DialogFormDiscount
