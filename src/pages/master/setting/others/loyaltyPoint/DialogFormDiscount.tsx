import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateLoyaltyType } from "@/services/api/@types/settings/loyalty"
import {
  apiCreateLoyalty,
  apiDeleteLoyalty,
  apiUpdateLoyalty,
} from "@/services/api/settings/LoyaltyService"
import { Trash2 } from "lucide-react"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
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
    const baseData = {
      name: "Discount",
      discount_type: data.discount_type as "percent" | "nominal",
      discount_value: data.discount_value as number,
      reward_items: [],
      type: "discount" as const,
      points_required: data.points_required,
      enabled: data.enabled,
      is_forever: data.is_forever,
      start_date: data.is_forever ? undefined : data.start_date?.toISOString(),
      end_date: data.is_forever ? undefined : data.end_date?.toISOString(),
    }

    if (type === "update") {
      update.mutate(baseData)
      return
    }
    if (type === "create") {
      create.mutate(baseData)
      return
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent floating className="gap-0 sm:max-w-xl">
          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex h-full flex-col"
            >
              <SheetHeader>
                <SheetTitle>
                  {type === "create" ? "Diskon Baru" : "Ubah Diskon"}
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <div className="flex-1 overflow-hidden px-2 pr-1">
                <ScrollArea className="h-full px-2 pr-3">
                  <div className="space-y-6 px-1 pb-4">
                    <FormFieldItem
                      control={control}
                      name="points_required"
                      label={<>Point yang diperlukan</>}
                      render={({ field }) => (
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            autoComplete="off"
                            placeholder="1000"
                            {...field}
                            value={field.value === 0 ? "" : field.value}
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value)
                              field.onChange(value)
                            }}
                          />
                          <InputGroupAddon align="inline-end">
                            Pts
                          </InputGroupAddon>
                        </InputGroup>
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="discount_value"
                      label={<>Jumlah Diskon</>}
                      render={({ field }) => (
                        <InputGroup>
                          {watchData.discount_type === "nominal" ? (
                            <InputCurrency
                              placeholder="Discount amount"
                              customInput={InputGroupInput}
                              value={field.value || undefined}
                              onValueChange={(_value, _name, values) => {
                                const valData = values?.float
                                field.onChange(valData)
                              }}
                            />
                          ) : (
                            <InputGroupInput
                              type="number"
                              autoComplete="off"
                              placeholder="10%"
                              {...field}
                              value={
                                (field.value === 0 ? undefined : field.value) ||
                                undefined
                              }
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value)
                                field.onChange(value)
                              }}
                            />
                          )}
                          <InputGroupAddon align="inline-end" className="pr-0">
                            <ButtonGroup>
                              <InputGroupButton
                                type="button"
                                variant={
                                  watchData.discount_type === "percent"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                className={
                                  watchData.discount_type === "percent"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : ""
                                }
                                onClick={() => {
                                  formProps.setValue("discount_type", "percent")
                                  formProps.setValue("discount_value", 0)
                                }}
                              >
                                %
                              </InputGroupButton>
                              <InputGroupButton
                                type="button"
                                variant={
                                  watchData.discount_type === "nominal"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                className={
                                  watchData.discount_type === "nominal"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : ""
                                }
                                onClick={() => {
                                  formProps.setValue("discount_type", "nominal")
                                  formProps.setValue("discount_value", 0)
                                }}
                              >
                                Rp
                              </InputGroupButton>
                            </ButtonGroup>
                          </InputGroupAddon>
                        </InputGroup>
                      )}
                    />

                    <FormFieldItem
                      control={control}
                      name="is_forever"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_forever"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <FormLabel
                            htmlFor="is_forever"
                            className="text-sm font-normal"
                          >
                            Aktif selamanya
                          </FormLabel>
                        </div>
                      )}
                    />

                    {!watchData.is_forever && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormFieldItem
                          control={control}
                          name="start_date"
                          render={({ field }) => (
                            <div className="flex flex-col gap-2">
                              <FormLabel>Tanggal Mulai</FormLabel>
                              <DateTimePicker
                                value={
                                  field.value
                                    ? (field.value as unknown as Date)
                                    : undefined
                                }
                                onChange={field.onChange}
                                hideTime={true}
                                clearable
                              />
                            </div>
                          )}
                        />

                        <FormFieldItem
                          control={control}
                          name="end_date"
                          render={({ field }) => (
                            <div className="flex flex-col gap-2">
                              <FormLabel>Tanggal Berakhir</FormLabel>
                              <DateTimePicker
                                value={
                                  field.value
                                    ? (field.value as unknown as Date)
                                    : undefined
                                }
                                onChange={field.onChange}
                                hideTime={true}
                                clearable
                              />
                            </div>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <SheetFooter className="px-4 py-2">
                <div className="flex items-center justify-between">
                  {type === "update" && (
                    <Button
                      variant="destructive"
                      size="icon"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleClose}
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending || update.isPending}
                    >
                      {create.isPending || update.isPending
                        ? "Menyimpan..."
                        : "Simpan"}
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

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
