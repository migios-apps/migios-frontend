import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { CreatePackageDto } from "@/services/api/@types/package"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import {
  apiCreatePackage,
  apiDeletePackage,
  apiGetAllTrainerByPackage,
  apiUpdatePackage,
} from "@/services/api/PackageService"
import { Trash2, User } from "lucide-react"
import { Gift } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import calculateDiscountAmount from "@/utils/calculateDiscountAmount"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { InputPercentNominal } from "@/components/ui/input-percent-nominal"
import {
  ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import DialogFormLoyaltyPoint from "@/components/form/loyalty-point/DialogFormLoyaltyPoint"
import {
  useLoyaltyPointForm,
  resetLoyaltyPointForm,
  type LoyaltyPointFormSchema,
} from "@/components/form/loyalty-point/loyaltyPointValidation"
import {
  PtTrainerFormSchema,
  ReturnPtTrainerFormSchema,
  durationTypeOptions,
} from "@/components/form/package/package"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnPtTrainerFormSchema
  onClose: () => void
}

const FormPtProgram: React.FC<FormProps> = ({
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
  const [openLoyaltyDialog, setOpenLoyaltyDialog] = React.useState(false)
  const loyaltyPointForm = useLoyaltyPointForm()

  const {
    data: trainers,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY.trainers, watchData.id],
    queryFn: () => apiGetAllTrainerByPackage(watchData.id as number),
    select: (res) => res.data.data,
    enabled: !!watchData.id && !watchData.allow_all_trainer,
  })

  React.useEffect(() => {
    if (type === "update" && !error) {
      formProps.setValue("trainers", trainers)
    }
  }, [error, formProps, trainers, type, watchData.allow_all_trainer])

  const getTrainerList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetEmployeeList({
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
            search_column: "type",
            search_condition: "=",
            search_text: "trainer",
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

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.packagePtProgram] })
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

  const onSubmit: SubmitHandler<PtTrainerFormSchema> = (data) => {
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

    const body: CreatePackageDto = {
      club_id: club?.id as number,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price as unknown as string),
      type: "pt_program",
      duration: data.duration,
      duration_type: data.duration_type as CreatePackageDto["duration_type"],
      session_duration: data.session_duration,
      max_member: 1,
      enabled: data.enabled,
      allow_all_trainer: data.allow_all_trainer,
      trainers: data.allow_all_trainer ? [] : data.trainers,
      is_promo: data.is_promo,
      discount_type:
        (data.discount_type as CreatePackageDto["discount_type"]) || "nominal",
      discount: parseFloat(data.discount as unknown as string) || 0,
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
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent floating className="gap-0 sm:max-w-xl">
          <Form {...formProps}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex h-full flex-col"
            >
              <SheetHeader>
                <SheetTitle>
                  {type === "create"
                    ? "Create PT Program Package"
                    : "Update PT Program Package"}
                </SheetTitle>
                <SheetDescription />
              </SheetHeader>
              <div className="flex-1 overflow-hidden px-2 pr-1">
                <ScrollArea className="h-full px-2 pr-3">
                  <div className="space-y-6 px-1 pb-4">
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
                          render={({ field, fieldState }) => {
                            const { famount } = calculateDiscountAmount({
                              price: watchData.price,
                              discount_type: watchData.discount_type as any,
                              discount_amount: field.value as number,
                            })
                            return (
                              <>
                                <InputPercentNominal
                                  value={
                                    field.value === 0 ? undefined : field.value
                                  }
                                  onChange={(val) => {
                                    const value =
                                      val === null || val === ""
                                        ? 0
                                        : Number(val)
                                    field.onChange(value)
                                  }}
                                  type={
                                    (watchData.discount_type as
                                      | "percent"
                                      | "nominal") || "percent"
                                  }
                                  onTypeChange={(type) => {
                                    formProps.setValue(
                                      "discount_type",
                                      type as any
                                    )
                                    formProps.setValue("discount", 0)
                                  }}
                                  placeholderPercent="10%"
                                  placeholderNominal="Discount amount"
                                  error={!!fieldState.error}
                                />
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
                                          watchData.loyalty_point
                                            .expired_value ?? 0,
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel>
                          Trainers <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormFieldItem
                          control={control}
                          name="allow_all_trainer"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                Assign All Trainers
                              </span>
                              <Switch
                                checked={field.value ?? false}
                                onCheckedChange={field.onChange}
                              />
                            </div>
                          )}
                        />
                      </div>
                      <FormFieldItem
                        control={control}
                        name="trainers"
                        invalid={Boolean(errors.trainers)}
                        errorMessage={errors.trainers?.message}
                        render={({ field, fieldState }) => (
                          <SelectAsyncPaginate
                            isClearable
                            isMulti
                            isLoading={isLoading}
                            loadOptions={getTrainerList as any}
                            additional={{ page: 1 }}
                            placeholder="Select Trainer"
                            value={field.value}
                            error={!!fieldState.error}
                            cacheUniqs={[watchData.trainers]}
                            isOptionDisabled={() =>
                              ((watchData.trainers as any[]) ?? []).length >= 5
                            }
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => option.code}
                            debounceTimeout={500}
                            isDisabled={watchData.allow_all_trainer}
                            formatOptionLabel={({ name, photo }) => {
                              return (
                                <div className="flex items-center justify-start gap-2">
                                  <Avatar className="size-8">
                                    {photo ? (
                                      <AvatarImage
                                        src={photo || ""}
                                        alt={name}
                                      />
                                    ) : (
                                      <AvatarFallback>
                                        <User className="size-4" />
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <span className="text-sm">{name}</span>
                                </div>
                              )
                            }}
                            onChange={(option) => field.onChange(option)}
                          />
                        )}
                      />
                    </div>
                    <FormFieldItem
                      control={control}
                      name="session_duration"
                      label={
                        <FormLabel>
                          Session <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.session_duration)}
                      errorMessage={errors.session_duration?.message}
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="Session"
                          {...field}
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
        title="Delete Package PT Program"
        description="Are you sure want to delete this Package PT Program?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormPtProgram
