import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateProduct } from "@/services/api/@types/product"
import {
  apiCreateProduct,
  apiDeleteProduct,
  apiUpdateProduct,
} from "@/services/api/ProductService"
import { Gift, Trash2 } from "lucide-react"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormFieldItem,
  FormLabel,
  FormControl,
  FormItem,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import DialogFormLoyaltyPoint from "@/components/form/loyalty-point/DialogFormLoyaltyPoint"
import {
  useLoyaltyPointForm,
  resetLoyaltyPointForm,
  type LoyaltyPointFormSchema,
} from "@/components/form/loyalty-point/loyaltyPointValidation"
import { CreateProductSchema, ReturnProductFormSchema } from "./validation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnProductFormSchema
  onClose: () => void
}

const FormProduct: React.FC<FormProps> = ({
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
  console.log("watchData", watchData)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = React.useState(false)
  const loyaltyPointForm = useLoyaltyPointForm()

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.products] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateProduct) => apiCreateProduct(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateProduct) =>
      apiUpdateProduct(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteProduct(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateProductSchema> = (data) => {
    const loyaltyPoint = data.loyalty_point
      ? {
          points: data.loyalty_point.points,
          expired_type: data.loyalty_point.expired_type,
          expired_value:
            data.loyalty_point.expired_type === "forever"
              ? 0
              : (data.loyalty_point.expired_value ?? 0),
        }
      : null

    const body: CreateProduct = {
      club_id: club?.id as number,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price as unknown as string),
      photo: data.photo,
      quantity: data.quantity,
      sku: data.sku,
      code: data.code,
      hpp: data.hpp,
      enable_commission: data.enable_commission,
      loyalty_point: loyaltyPoint,
    }

    if (type === "update") {
      update.mutate(body)
      return
    }
    if (type === "create") {
      create.mutate(body)
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
        <DialogContent className="max-w-[620px]" scrollBody>
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Product" : "Update Product"}
            </DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>Photo coming soon</div>
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
                name="quantity"
                label={<FormLabel>Quantity</FormLabel>}
                invalid={Boolean(errors.quantity)}
                errorMessage={errors.quantity?.message}
                render={({ field }) => (
                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="Quantity"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || null
                      field.onChange(value)
                    }}
                  />
                )}
              />
              <div className="flex w-full flex-col items-start gap-2 md:flex-row">
                <div className="w-full">
                  <FormFieldItem
                    control={control}
                    name="hpp"
                    label={<FormLabel>Hpp</FormLabel>}
                    invalid={Boolean(errors.hpp)}
                    errorMessage={errors.hpp?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormFieldItem
                    control={control}
                    name="price"
                    label={<FormLabel>Sale Price</FormLabel>}
                    invalid={Boolean(errors.price)}
                    errorMessage={errors.price?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value}
                        onValueChange={(_value, _name, values) => {
                          const valData = values?.float
                          field.onChange(valData)
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-2 md:flex-row">
                <div className="w-full">
                  <FormFieldItem
                    control={control}
                    name="sku"
                    label={<FormLabel>Sku</FormLabel>}
                    invalid={Boolean(errors.sku)}
                    errorMessage={errors.sku?.message}
                    render={({ field }) => (
                      <Input
                        type="text"
                        autoComplete="off"
                        placeholder="Sku"
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </div>
                <div className="w-full">
                  <FormFieldItem
                    control={control}
                    name="code"
                    label={<FormLabel>Code</FormLabel>}
                    invalid={Boolean(errors.code)}
                    errorMessage={errors.code?.message}
                    render={({ field }) => (
                      <Input
                        type="text"
                        autoComplete="off"
                        placeholder="Code"
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                  />
                </div>
              </div>
              <FormFieldItem
                control={control}
                name="description"
                label={<FormLabel>Description</FormLabel>}
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                render={({ field }) => (
                  <Textarea
                    placeholder="description"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="loyalty_point"
                label={<>Loyalty Point Earned</>}
                invalid={Boolean(errors.loyalty_point)}
                errorMessage={errors.loyalty_point?.message}
                render={({ field }) => (
                  <div className="space-y-2">
                    {watchData.loyalty_point ? (
                      <div className="border-border flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Gift className="text-primary size-5" />
                          <div>
                            <div className="text-foreground text-sm font-medium">
                              {watchData.loyalty_point.points} Points
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {watchData.loyalty_point.expired_type ===
                              "forever"
                                ? "Forever"
                                : `For ${watchData.loyalty_point.expired_value ?? 0} ${watchData.loyalty_point.expired_type}${(watchData.loyalty_point.expired_value ?? 0) > 1 ? "s" : ""}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (watchData.loyalty_point) {
                                loyaltyPointForm.reset({
                                  points: watchData.loyalty_point.points,
                                  expired_type:
                                    watchData.loyalty_point.expired_type,
                                  expired_value:
                                    watchData.loyalty_point.expired_value ?? 0,
                                })
                                setOpenLoyaltyDialog(true)
                              }
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              field.onChange(null)
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          resetLoyaltyPointForm(loyaltyPointForm)
                          setOpenLoyaltyDialog(true)
                        }}
                      >
                        <Gift className="mr-2 size-4" />
                        Tambah Loyalty Point
                      </Button>
                    )}
                  </div>
                )}
              />
              <FormFieldItem
                control={control}
                name="enable_commission"
                label={<FormLabel></FormLabel>}
                invalid={Boolean(errors.enable_commission)}
                errorMessage={errors.enable_commission?.message}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Aktifkan Komisi untuk Produk Ini
                      </FormLabel>
                      <FormDescription>
                        Jika aktif, produk ini akan memberikan komisi kepada
                        sales yang menjualnya sesuai dengan pengaturan komisi
                        yang ditentukan di pengaturan komisi karyawan
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value === 1)}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? 1 : 0)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="mt-6 flex items-center justify-between gap-2">
                {type === "update" ? (
                  <Button
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

      <DialogFormLoyaltyPoint
        formProps={loyaltyPointForm}
        open={openLoyaltyDialog}
        onClose={() => setOpenLoyaltyDialog(false)}
        onSave={(data: LoyaltyPointFormSchema) => {
          formProps.setValue("loyalty_point", data)
        }}
        title="Loyalty Point"
      />

      <AlertConfirm
        open={confirmDelete}
        title="Delete Product"
        description="Are you sure want to delete this product?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormProduct
