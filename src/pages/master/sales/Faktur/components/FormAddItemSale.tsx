import React from "react"
import { SubmitHandler } from "react-hook-form"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { TrainerPackageTypes } from "@/services/api/@types/package"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { apiGetAllTrainerByPackage } from "@/services/api/PackageService"
import dayjs from "dayjs"
import { Add, Minus, Trash } from "iconsax-reactjs"
import { User } from "lucide-react"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { cn } from "@/lib/utils"
import calculateDiscountAmount from "@/utils/calculateDiscountAmount"
import { PackageType, categoryPackage } from "@/constants/packages"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Card, CardContent } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import {
  ReturnTransactionItemFormSchema,
  TransactionItemSchema,
  resetTransactionItemForm,
} from "../utils/validation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  index: number
  formProps: ReturnTransactionItemFormSchema
  onClose: () => void
  onChange: (item: TransactionItemSchema, type: "create" | "update") => void
  onDelete: (index: number) => void
  allowNegativeQuantity?: boolean
}

const FormAddItemSale: React.FC<FormProps> = ({
  open,
  type,
  index,
  formProps,
  onClose,
  onChange,
  onDelete,
  allowNegativeQuantity = false,
}) => {
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const isRedeemItem = watchData.source_from === "redeem_item"

  // console.log("form", {
  //   watchData,
  //   errors,
  // })

  const trainers = React.useMemo(() => {
    const instructorNames =
      watchData?.instructors?.map((item) => item.name) || []
    const trainerName = watchData?.trainers?.name
      ? [watchData.trainers.name]
      : []
    return [...instructorNames, ...trainerName]
      .filter((item) => item !== null)
      .join(", ")
  }, [watchData?.instructors, watchData.trainers])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      resetTransactionItemForm(formProps)
    }, 500)
  }

  const onSubmit: SubmitHandler<TransactionItemSchema> = (data) => {
    // console.log('data', data)
    onChange(data, type)
    handleClose()
  }

  const getTrainerList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<TrainerPackageTypes, GroupBase<TrainerPackageTypes>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetAllTrainerByPackage(
        watchData?.package_id as number,
        {
          page: additional?.page,
          per_page: 10,
          sort_column: "id",
          sort_type: "desc",
          show_all: true,
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
        }
      )
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length > 0,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    [watchData?.package_id]
  )

  const getInstructorList = React.useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<EmployeeDetail, GroupBase<EmployeeDetail>>,
      additional?: { page: number }
    ) => {
      const classIds =
        watchData?.classes?.map((cls) => cls.id).filter(Boolean) || []
      const response = await apiGetEmployeeList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        show_all: true,
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
          ...(classIds.length > 0
            ? [
                {
                  search_operator: "and",
                  search_column: "classes.id",
                  search_condition: "in",
                  search_text: classIds.join(","),
                } as any,
              ]
            : []),
        ],
      })
      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: response.data.data,
          hasMore: response.data.data.length > 0,
          additional: {
            page: additional!.page + 1,
          },
        })
      })
    },
    [watchData?.classes]
  )
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          scrollBody
          className="max-w-[620px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Add item" : "Update Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-full flex-col justify-between">
            <Form {...formProps}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 flex w-full flex-col">
                  <Card className="relative z-10 flex h-full flex-col justify-between p-3 shadow-none">
                    <CardContent className="p-0">
                      <h6 className="font-semibold">{watchData.name}</h6>
                      {watchData.item_type === "package" ? (
                        <div
                          className={cn("z-10 flex", {
                            "w-full items-end justify-between":
                              watchData.item_type === "package",
                          })}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {
                                categoryPackage.filter(
                                  (option) =>
                                    option.value === watchData.package_type
                                )[0]?.label
                              }
                              {watchData.package_type === PackageType.PT_PROGRAM
                                ? ` (${watchData.session_duration} Ss)`
                                : ""}
                            </span>
                            <span className="text-sm">
                              {watchData.duration} {watchData.duration_type}
                            </span>
                          </div>
                        </div>
                      ) : null}
                      {watchData.package_type === PackageType.CLASS ? (
                        <>
                          <div className="mt-1 w-full border-b border-gray-200 dark:border-gray-600"></div>
                          <div className="flex flex-col">
                            <span className="mt-1 font-semibold">Class</span>
                            <span className="text-sm">
                              {watchData.classes
                                ?.map((item) => item.name)
                                .join(", ")}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="mt-1 font-semibold">
                              {watchData.package_type === PackageType.PT_PROGRAM
                                ? "Trainer"
                                : "Instructor"}
                            </span>
                            <span className="text-sm">
                              {trainers.length === 0
                                ? "Available with all Instructor"
                                : trainers}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-col gap-3">
                  {isRedeemItem ? (
                    // Untuk redeem_item, hanya tampilkan start_date, notes, dan trainer/instructor
                    <>
                      {watchData.item_type === "package" ? (
                        <>
                          <FormFieldItem
                            control={control}
                            name="start_date"
                            label="Start Date"
                            invalid={Boolean(errors.start_date)}
                            errorMessage={errors.start_date?.message}
                            render={({ field, fieldState }) => (
                              <DatePicker
                                selected={
                                  field.value
                                    ? dayjs(field.value).toDate()
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date
                                      ? dayjs(date).format("YYYY-MM-DD")
                                      : null
                                  )
                                }}
                                placeholder="Start Date"
                                error={!!fieldState.error}
                              />
                            )}
                          />
                          {watchData.package_type === PackageType.PT_PROGRAM ? (
                            <FormFieldItem
                              control={control}
                              name="trainers"
                              label={
                                <div className="flex items-start gap-1">
                                  Trainers{" "}
                                  <span className="text-destructive">*</span>
                                </div>
                              }
                              invalid={Boolean(errors.trainers)}
                              errorMessage={errors.trainers?.message}
                              render={({ field, fieldState }) => (
                                <SelectAsyncPaginate
                                  isClearable
                                  loadOptions={getTrainerList as any}
                                  additional={{ page: 1 }}
                                  placeholder="Select Trainer"
                                  value={field.value}
                                  cacheUniqs={[watchData.trainers]}
                                  getOptionLabel={(option) => option.name!}
                                  getOptionValue={(option) => option.code || ""}
                                  debounceTimeout={500}
                                  error={!!fieldState.error}
                                  formatOptionLabel={({ name, photo }) => {
                                    return (
                                      <div className="flex items-center justify-start gap-2">
                                        <Avatar className="size-8">
                                          {photo ? (
                                            <AvatarImage
                                              src={photo}
                                              alt={name}
                                            />
                                          ) : null}
                                          <AvatarFallback>
                                            <User className="size-4" />
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{name}</span>
                                      </div>
                                    )
                                  }}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          ) : null}
                          {watchData.package_type === PackageType.CLASS ? (
                            <FormFieldItem
                              control={control}
                              name="instructors"
                              label={
                                <div className="flex items-start gap-1">
                                  Instructors{" "}
                                  <span className="text-destructive">*</span>
                                </div>
                              }
                              invalid={Boolean(errors.instructors)}
                              errorMessage={errors.instructors?.message}
                              render={({ field, fieldState }) => (
                                <SelectAsyncPaginate
                                  isClearable
                                  isMulti
                                  loadOptions={getInstructorList as any}
                                  additional={{ page: 1 }}
                                  placeholder="Select Instructor"
                                  value={field.value}
                                  cacheUniqs={[watchData.instructors]}
                                  getOptionLabel={(option) => option.name!}
                                  getOptionValue={(option) => option.code || ""}
                                  debounceTimeout={500}
                                  error={!!fieldState.error}
                                  formatOptionLabel={({ name, photo }) => {
                                    return (
                                      <div className="flex items-center justify-start gap-2">
                                        <Avatar className="size-8">
                                          {photo ? (
                                            <AvatarImage
                                              src={photo}
                                              alt={name}
                                            />
                                          ) : null}
                                          <AvatarFallback>
                                            <User className="size-4" />
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{name}</span>
                                      </div>
                                    )
                                  }}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          ) : null}
                        </>
                      ) : null}
                      <FormFieldItem
                        control={control}
                        name="notes"
                        label="Notes"
                        invalid={Boolean(errors.notes)}
                        errorMessage={errors.notes?.message}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Notes"
                          />
                        )}
                      />
                    </>
                  ) : (
                    // Untuk item biasa, tampilkan semua field
                    <>
                      {watchData.item_type === "package" ? (
                        <>
                          <FormFieldItem
                            control={control}
                            name="start_date"
                            label="Start Date"
                            invalid={Boolean(errors.start_date)}
                            errorMessage={errors.start_date?.message}
                            render={({ field, fieldState }) => (
                              <DatePicker
                                selected={
                                  field.value
                                    ? dayjs(field.value).toDate()
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date
                                      ? dayjs(date).format("YYYY-MM-DD")
                                      : null
                                  )
                                }}
                                placeholder="Start Date"
                                error={!!fieldState.error}
                              />
                            )}
                          />
                          {watchData.package_type === PackageType.PT_PROGRAM ? (
                            <FormFieldItem
                              control={control}
                              name="trainers"
                              label={
                                <div className="flex items-start gap-1">
                                  Trainers{" "}
                                  <span className="text-destructive">*</span>
                                </div>
                              }
                              invalid={Boolean(errors.trainers)}
                              errorMessage={errors.trainers?.message}
                              render={({ field, fieldState }) => (
                                <SelectAsyncPaginate
                                  isClearable
                                  loadOptions={getTrainerList as any}
                                  additional={{ page: 1 }}
                                  placeholder="Select Trainer"
                                  value={field.value}
                                  cacheUniqs={[watchData.trainers]}
                                  getOptionLabel={(option) => option.name!}
                                  getOptionValue={(option) => option.code || ""}
                                  debounceTimeout={500}
                                  error={!!fieldState.error}
                                  formatOptionLabel={({ name, photo }) => {
                                    return (
                                      <div className="flex items-center justify-start gap-2">
                                        <Avatar className="size-8">
                                          {photo ? (
                                            <AvatarImage
                                              src={photo}
                                              alt={name}
                                            />
                                          ) : null}
                                          <AvatarFallback>
                                            <User className="size-4" />
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{name}</span>
                                      </div>
                                    )
                                  }}
                                  onChange={(option) => field.onChange(option)}
                                />
                              )}
                            />
                          ) : null}
                          {watchData.package_type !== PackageType.CLASS ? (
                            <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                              {watchData.package_type !==
                              PackageType.MEMBERSHIP ? (
                                <FormFieldItem
                                  control={control}
                                  name="extra_session"
                                  label="Extra Session"
                                  invalid={Boolean(errors.extra_session)}
                                  errorMessage={errors.extra_session?.message}
                                  render={({ field }) => (
                                    <Input
                                      type="number"
                                      autoComplete="off"
                                      placeholder="0"
                                      {...field}
                                      value={field.value ?? undefined}
                                    />
                                  )}
                                />
                              ) : null}
                              <FormFieldItem
                                control={control}
                                name="extra_day"
                                label="Extra Day"
                                invalid={Boolean(errors.extra_day)}
                                errorMessage={errors.extra_day?.message}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    autoComplete="off"
                                    placeholder="0"
                                    {...field}
                                    value={field.value ?? undefined}
                                  />
                                )}
                              />
                            </div>
                          ) : null}
                        </>
                      ) : null}
                      {watchData.item_type === "product" ? (
                        <FormFieldItem
                          control={control}
                          name="quantity"
                          label="Quantity"
                          invalid={Boolean(errors.quantity)}
                          errorMessage={errors.quantity?.message}
                          render={({ field }) => {
                            return (
                              <InputGroup>
                                <InputGroupInput
                                  type="number"
                                  autoComplete="off"
                                  className="text-center"
                                  {...field}
                                  value={field.value ?? 0}
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value)
                                    // Jika allowNegativeQuantity = true, izinkan nilai negatif
                                    if (!allowNegativeQuantity && value < 0) {
                                      field.onChange(0)
                                      formProps.setValue(
                                        "sell_price",
                                        watchData.price
                                      )
                                      formProps.setValue("discount", 0)
                                    } else if (
                                      !allowNegativeQuantity &&
                                      value > (watchData.product_qty as number)
                                    ) {
                                      field.onChange(watchData.product_qty)
                                      formProps.setValue(
                                        "sell_price",
                                        watchData.price *
                                          (watchData.product_qty || 0)
                                      )
                                      formProps.setValue("discount", 0)
                                    } else {
                                      field.onChange(value)
                                      // Jika qty negatif, harga juga jadi negatif
                                      const calculatedPrice =
                                        allowNegativeQuantity
                                          ? watchData.price * value
                                          : watchData.price * (value || 0)
                                      formProps.setValue(
                                        "sell_price",
                                        calculatedPrice
                                      )
                                      formProps.setValue("discount", 0)
                                    }
                                  }}
                                />
                                <InputGroupAddon
                                  align="inline-end"
                                  className="pr-0"
                                >
                                  <ButtonGroup>
                                    <InputGroupButton
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="bg-accent"
                                      disabled={
                                        allowNegativeQuantity
                                          ? false
                                          : field.value <= 0
                                      }
                                      onClick={() => {
                                        const newValue = Number(field.value) - 1
                                        if (
                                          allowNegativeQuantity ||
                                          newValue >= 1
                                        ) {
                                          field.onChange(newValue)
                                          const calculatedPrice =
                                            watchData.price * newValue
                                          formProps.setValue(
                                            "sell_price",
                                            calculatedPrice
                                          )
                                          formProps.setValue("discount", 0)
                                        }
                                      }}
                                    >
                                      <Minus color="currentColor" size={16} />
                                    </InputGroupButton>
                                    <InputGroupButton
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      disabled={
                                        allowNegativeQuantity
                                          ? false
                                          : field.value >=
                                            (watchData.product_qty as number)
                                      }
                                      onClick={() => {
                                        const newValue = Number(field.value) + 1
                                        if (
                                          allowNegativeQuantity ||
                                          newValue <=
                                            (watchData.product_qty as number)
                                        ) {
                                          field.onChange(newValue)
                                          const calculatedPrice =
                                            watchData.price * newValue
                                          formProps.setValue(
                                            "sell_price",
                                            calculatedPrice
                                          )
                                          formProps.setValue("discount", 0)
                                        }
                                      }}
                                    >
                                      <Add color="currentColor" size={16} />
                                    </InputGroupButton>
                                  </ButtonGroup>
                                </InputGroupAddon>
                              </InputGroup>
                            )
                          }}
                        />
                      ) : null}
                      <FormFieldItem
                        control={control}
                        name="discount"
                        label="Discount"
                        invalid={Boolean(errors.discount)}
                        errorMessage={errors.discount?.message}
                        render={({ field }) => {
                          return (
                            <InputGroup>
                              {watchData.discount_type === "nominal" ? (
                                <InputCurrency
                                  placeholder="Discount amount"
                                  disabled={
                                    !watchData.discount_type ||
                                    Boolean(watchData.is_promo)
                                  }
                                  customInput={InputGroupInput}
                                  value={field.value || undefined}
                                  onValueChange={(_value, _name, values) => {
                                    const valData = values?.float
                                    field.onChange(valData)

                                    if (!valData) {
                                      formProps.setValue(
                                        "sell_price",
                                        watchData.price
                                      )
                                    } else {
                                      const { amount } =
                                        calculateDiscountAmount({
                                          price: watchData.price,
                                          discount_type:
                                            watchData.discount_type as any,
                                          discount_amount: valData || 0,
                                        })
                                      formProps.setValue("sell_price", amount)
                                    }
                                  }}
                                />
                              ) : (
                                <InputGroupInput
                                  type="number"
                                  autoComplete="off"
                                  placeholder="10%"
                                  disabled={
                                    !watchData.discount_type ||
                                    Boolean(watchData.is_promo)
                                  }
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

                                    if (value === 0) {
                                      formProps.setValue(
                                        "sell_price",
                                        watchData.price
                                      )
                                    } else {
                                      const val = Number(value)
                                      const { amount } =
                                        calculateDiscountAmount({
                                          price: watchData.price,
                                          discount_type:
                                            watchData.discount_type as any,
                                          discount_amount: val,
                                        })
                                      formProps.setValue("sell_price", amount)
                                    }
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
                                    disabled={Boolean(watchData.is_promo)}
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
                                    disabled={Boolean(watchData.is_promo)}
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
                          )
                        }}
                      />
                      <FormFieldItem
                        control={control}
                        name="notes"
                        label="Notes"
                        invalid={Boolean(errors.notes)}
                        errorMessage={errors.notes?.message}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Notes"
                          />
                        )}
                      />
                    </>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between gap-2 text-right">
                  {type === "update" && !isRedeemItem ? (
                    <Button
                      className="flex items-center gap-1 bg-red-500 text-white hover:bg-red-600 ltr:mr-2 rtl:ml-2"
                      variant="default"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash color="currentColor" size="24" variant="Outline" />
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button variant="default" type="submit">
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Item"
        description="Are you sure want to delete this item?"
        type="delete"
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={() => {
          setConfirmDelete(false)
          handleClose()
          onDelete(index)
        }}
      />
    </>
  )
}

export default FormAddItemSale
