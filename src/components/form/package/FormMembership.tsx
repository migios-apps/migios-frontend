import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreatePackageDto } from "@/services/api/@types/package"
import {
  apiCreatePackage,
  apiDeletePackage,
  apiUpdatePackage,
} from "@/services/api/PackageService"
import { Trash2 } from "lucide-react"
import { useSessionUser } from "@/stores/auth-store"
import calculateDiscountAmount from "@/utils/calculateDiscountAmount"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Select } from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  MembershipFormSchema,
  ReturnMembershipFormSchema,
  durationTypeOptions,
} from "@/components/form/package/package"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnMembershipFormSchema
  onClose: () => void
}

const FormMembership: React.FC<FormProps> = ({
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
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.packageMembership] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreatePackageDto) => apiCreatePackage(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreatePackageDto) =>
      apiUpdatePackage(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeletePackage(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<MembershipFormSchema> = (data) => {
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        name: data.name,
        description: data.description,
        price: data.price,
        type: "membership",
        duration: data.duration,
        duration_type: data.duration_type as CreatePackageDto["duration_type"],
        session_duration: data.session_duration,
        enabled: data.enabled,
        allow_all_trainer: data.allow_all_trainer,
        is_promo: data.is_promo,
        discount_type:
          (data.discount_type as CreatePackageDto["discount_type"]) ||
          "nominal",
        discount: data.discount || 0,
        loyalty_point: data.loyalty_point,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        name: data.name,
        description: data.description,
        price: data.price,
        type: "membership",
        duration: data.duration,
        duration_type: data.duration_type as CreatePackageDto["duration_type"],
        session_duration: data.session_duration,
        enabled: data.enabled,
        allow_all_trainer: data.allow_all_trainer,
        is_promo: data.is_promo,
        discount_type:
          (data.discount_type as CreatePackageDto["discount_type"]) ||
          "nominal",
        discount: data.discount || 0,
        loyalty_point: data.loyalty_point,
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
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent
          side="right"
          className="w-full gap-0 sm:max-w-[620px]"
          floating
        >
          <SheetHeader>
            <SheetTitle>
              {type === "create"
                ? "Create Membership Package"
                : "Update Membership Package"}
            </SheetTitle>
            <SheetDescription />
          </SheetHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <ScrollArea className="h-[calc(100vh-10rem)] px-2">
                <div className="space-y-4 px-4">
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
                    name="price"
                    label={
                      <FormLabel>
                        Price <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.price)}
                    errorMessage={errors.price?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Price"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Promo</FormLabel>
                      <FormFieldItem
                        control={control}
                        name="is_promo"
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Set as Promo</span>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 1 : 0)
                                formProps.setValue(
                                  "discount_type",
                                  checked ? "nominal" : undefined
                                )
                                formProps.setValue("discount", undefined)
                              }}
                            />
                          </div>
                        )}
                      />
                    </div>
                    {watchData.is_promo ? (
                      <FormFieldItem
                        control={control}
                        name="discount"
                        invalid={Boolean(errors.discount)}
                        errorMessage={errors.discount?.message}
                        render={({ field }) => {
                          const { famount } = calculateDiscountAmount({
                            price: watchData.price,
                            discount_type: watchData.discount_type as any,
                            discount_amount: field.value as number,
                          })
                          return (
                            <>
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
                                      (field.value === 0
                                        ? undefined
                                        : field.value) || undefined
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
                                <InputGroupAddon
                                  align="inline-end"
                                  className="pr-0"
                                >
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
                                        formProps.setValue(
                                          "discount_type",
                                          "percent"
                                        )
                                        formProps.setValue("discount", 0)
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
                                        formProps.setValue(
                                          "discount_type",
                                          "nominal"
                                        )
                                        formProps.setValue("discount", 0)
                                      }}
                                    >
                                      Rp
                                    </InputGroupButton>
                                  </ButtonGroup>
                                </InputGroupAddon>
                              </InputGroup>
                              <span className="text-muted-foreground text-xs italic">
                                Sell Price {famount}
                              </span>
                            </>
                          )
                        }}
                      />
                    ) : null}
                  </div>
                  <FormFieldItem
                    control={control}
                    name="loyalty_point"
                    label={<>Loyalty points earned</>}
                    invalid={Boolean(errors.loyalty_point)}
                    errorMessage={errors.loyalty_point?.message}
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
                              e.target.value === "" ? 0 : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                        <InputGroupAddon align="inline-end">
                          Pts
                        </InputGroupAddon>
                      </InputGroup>
                    )}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormFieldItem
                      control={control}
                      name="duration"
                      label={
                        <FormLabel>
                          Duration <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.duration)}
                      errorMessage={errors.duration?.message}
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="duration"
                          {...field}
                        />
                      )}
                    />
                    <FormFieldItem
                      control={control}
                      name="duration_type"
                      label={
                        <FormLabel>
                          Duration Type{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.duration_type)}
                      errorMessage={errors.duration_type?.message}
                      render={({ field, fieldState }) => (
                        <Select
                          isSearchable={false}
                          placeholder="Please Select"
                          value={durationTypeOptions.filter(
                            (option) => option.value === field.value
                          )}
                          options={durationTypeOptions}
                          error={!!fieldState.error}
                          onChange={(option) => field.onChange(option?.value)}
                        />
                      )}
                    />
                  </div>
                  <FormFieldItem
                    control={control}
                    name="session_duration"
                    label={
                      <FormLabel>
                        Session Duration{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.session_duration)}
                    errorMessage={errors.session_duration?.message}
                    render={({ field }) => (
                      <Input
                        type="number"
                        autoComplete="off"
                        placeholder="Session Duration"
                        {...field}
                      />
                    )}
                  />
                  {/* <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Allow All Trainer</FormLabel>
                    <FormFieldItem
                      control={control}
                      name="allow_all_trainer"
                      render={({ field }) => (
                        <Switch
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div> */}
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
                    name="enabled"
                    invalid={Boolean(errors.enabled)}
                    errorMessage={errors.enabled?.message}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                        <FormLabel>
                          {field.value ? "Enabled" : "Disabled"}
                        </FormLabel>
                      </div>
                    )}
                  />
                </div>
              </ScrollArea>
              <SheetFooter>
                <div className="flex items-center justify-between px-4">
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
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={create.isPending || update.isPending}
                    >
                      {create.isPending || update.isPending
                        ? "Saving..."
                        : "Save"}
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
        title="Delete Membership Package"
        description="Are you sure want to delete this membership package?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormMembership
