import React from "react"
import { Controller, SubmitHandler } from "react-hook-form"
import { TrainerPackageTypes } from "@/services/api/@types/package"
import { apiGetAllTrainerByPackage } from "@/services/api/PackageService"
import dayjs from "dayjs"
import { Add, Minus, Trash } from "iconsax-reactjs"
import { HiOutlineUser } from "react-icons/hi"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { cn } from "@/lib/utils"
import calculateDiscountAmount from "@/utils/calculateDiscountAmount"
import { PackageType, categoryPackage } from "@/constants/packages"
import AlertConfirm from "@/components/ui/alert-confirm"
import InputCurrency from "@/components/ui/input-currency"
import {
  ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Dialog,
  Form,
  FormItem,
  Input,
  InputGroup,
} from "@/components/ui"
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
}

const FormAddItemSale: React.FC<FormProps> = ({
  open,
  type,
  index,
  formProps,
  onClose,
  onChange,
  onDelete,
}) => {
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  // console.log('form', {
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
    resetTransactionItemForm(formProps)
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
  return (
    <>
      <Dialog
        scrollBody
        width={620}
        isOpen={open}
        onClose={handleClose}
        onRequestClose={handleClose}
      >
        <div className="flex h-full flex-col justify-between">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <h5 className="mb-4">
              {type === "create" ? "Add item" : "Update Item"}
            </h5>
            <div className="mb-4 flex w-full flex-col">
              <Card bodyClass="p-3 flex flex-col justify-between h-full relative z-10">
                <h6 className="font-bold">{watchData.name}</h6>
                <div
                  className={cn("z-10 flex", {
                    "w-full items-end justify-between":
                      watchData.item_type === "package",
                  })}
                >
                  <div className="flex flex-col">
                    <span>
                      {
                        categoryPackage.filter(
                          (option) => option.value === watchData.package_type
                        )[0]?.label
                      }
                      {watchData.package_type === PackageType.PT_PROGRAM &&
                        ` (${watchData.session_duration} Ss)`}
                    </span>
                    <span>
                      {watchData.duration} {watchData.duration_type}
                    </span>
                  </div>
                  {/* <div
                    className={cn('leading-none', {
                      'text-right': watchData.item_type === 'package',
                    })}
                  >
                    {watchData.discount && watchData.discount > 0 ? (
                      <span className="line-through text-sm">
                        {currencyFormat(watchData.sell_price ?? 0)}
                      </span>
                    ) : null}
                    <span className="font-bold text-lg block -mt-0.5">
                      {currencyFormat(watchData.price ?? 0)}
                    </span>
                  </div> */}
                </div>
                {}
                {watchData.package_type === PackageType.CLASS ? (
                  <>
                    <div className="mt-1 w-full border-b border-gray-200 dark:border-gray-600"></div>
                    <div className="flex flex-col">
                      <span className="mt-1 font-bold">Class</span>
                      <span className="text-sm">
                        {watchData.classes?.map((item) => item.name).join(", ")}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="mt-1 font-bold">
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
              </Card>
            </div>
            <div className="">
              {watchData.item_type === "package" && (
                <>
                  <FormItem
                    label="Start Date"
                    className="w-full"
                    invalid={Boolean(errors.start_date)}
                    errorMessage={errors.start_date?.message}
                  >
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          inputFormat="DD-MM-YYYY"
                          placeholder="Start Date"
                          {...field}
                          value={
                            field.value ? dayjs(field.value).toDate() : null
                          } //dayjs(field.value).toDate()}
                        />
                      )}
                    />
                  </FormItem>
                  {watchData.package_type === PackageType.PT_PROGRAM && (
                    <FormItem
                      asterisk
                      label="Trainers"
                      invalid={Boolean(errors.trainers)}
                      errorMessage={errors.trainers?.message}
                      labelClass="w-full flex justify-between items-center"
                    >
                      <Controller
                        name="trainers"
                        control={control}
                        render={({ field }) => (
                          <SelectAsyncPaginate
                            isClearable
                            // isMulti
                            // isLoading={isLoading}
                            loadOptions={getTrainerList as any}
                            additional={{ page: 1 }}
                            placeholder="Select Trainer"
                            value={field.value}
                            cacheUniqs={[watchData.trainers]}
                            getOptionLabel={(option) => option.name!}
                            getOptionValue={(option) => option.code || ""}
                            debounceTimeout={500}
                            formatOptionLabel={({ name, photo }) => {
                              return (
                                <div className="flex items-center justify-start gap-2">
                                  <Avatar
                                    size="sm"
                                    {...(photo && { src: photo || "" })}
                                    {...(!photo && { icon: <HiOutlineUser /> })}
                                  />
                                  <span className="text-sm">{name}</span>
                                </div>
                              )
                            }}
                            onChange={(option) => field.onChange(option)}
                          />
                        )}
                      />
                    </FormItem>
                  )}
                  {watchData.package_type !== PackageType.CLASS && (
                    <div className="flex w-full flex-col items-start gap-0 md:flex-row md:gap-2">
                      {watchData.package_type !== PackageType.MEMBERSHIP ? (
                        <FormItem
                          label="Extra Session"
                          className="w-full"
                          invalid={Boolean(errors.extra_session)}
                          errorMessage={errors.extra_session?.message}
                        >
                          <Controller
                            name="extra_session"
                            control={control}
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
                        </FormItem>
                      ) : null}
                      <FormItem
                        label="Extra Day"
                        className="w-full"
                        invalid={Boolean(errors.extra_day)}
                        errorMessage={errors.extra_day?.message}
                      >
                        <Controller
                          name="extra_day"
                          control={control}
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
                      </FormItem>
                    </div>
                  )}
                </>
              )}
              {watchData.item_type === "product" && (
                <FormItem
                  label="Quantity"
                  invalid={Boolean(errors.quantity)}
                  errorMessage={errors.quantity?.message}
                  labelClass="w-full flex justify-between items-center"
                  extraType="start"
                >
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => {
                      return (
                        <>
                          <InputGroup>
                            <Input
                              type="number"
                              autoComplete="off"
                              className="text-center"
                              {...field}
                              value={field.value === 0 ? "" : field.value}
                              onChange={(e) => {
                                const value =
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value)
                                if (value < 0) {
                                  field.onChange(0)
                                  formProps.setValue(
                                    "sell_price",
                                    watchData.price
                                  )
                                  formProps.setValue("discount", 0)
                                } else if (
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
                                  formProps.setValue(
                                    "sell_price",
                                    watchData.price * (value || 0)
                                  )
                                  formProps.setValue("discount", 0)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="default"
                              disabled={field.value <= 0}
                              onClick={() => {
                                const newValue = Number(field.value) - 1
                                if (newValue >= 1) {
                                  field.onChange(newValue)
                                  formProps.setValue(
                                    "sell_price",
                                    watchData.price * newValue
                                  )
                                  formProps.setValue("discount", 0)
                                }
                              }}
                            >
                              <Minus color="currentColor" size="20" />
                            </Button>
                            <Button
                              type="button"
                              variant="default"
                              disabled={
                                field.value >= (watchData.product_qty as number)
                              }
                              onClick={() => {
                                const newValue = Number(field.value) + 1
                                if (
                                  newValue <= (watchData.product_qty as number)
                                ) {
                                  field.onChange(newValue)
                                  formProps.setValue(
                                    "sell_price",
                                    watchData.price * newValue
                                  )
                                  formProps.setValue("discount", 0)
                                }
                              }}
                            >
                              <Add color="currentColor" size="20" />
                            </Button>
                          </InputGroup>
                        </>
                      )
                    }}
                  />
                </FormItem>
              )}
              <FormItem
                label="Discount"
                invalid={Boolean(errors.discount)}
                errorMessage={errors.discount?.message}
                labelClass="w-full flex justify-between items-center"
                extraType="start"
              >
                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <InputGroup>
                          {watchData.discount_type === "nominal" ? (
                            <InputCurrency
                              placeholder="Discount amount"
                              disabled={
                                !watchData.discount_type ||
                                Boolean(watchData.is_promo)
                              }
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
                                  const { amount } = calculateDiscountAmount({
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
                            <Input
                              type="number"
                              autoComplete="off"
                              placeholder="10%"
                              disabled={
                                !watchData.discount_type ||
                                Boolean(watchData.is_promo)
                              }
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

                                if (value === 0) {
                                  formProps.setValue(
                                    "sell_price",
                                    watchData.price
                                  )
                                } else {
                                  const val = Number(value)
                                  const { amount } = calculateDiscountAmount({
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
                          <Button
                            type="button"
                            variant={
                              watchData.discount_type === "percent"
                                ? "solid"
                                : "default"
                            }
                            disabled={Boolean(watchData.is_promo)}
                            onClick={() => {
                              formProps.setValue("discount_type", "percent")
                              formProps.setValue("discount", 0)
                            }}
                          >
                            %
                          </Button>
                          <Button
                            type="button"
                            variant={
                              watchData.discount_type === "nominal"
                                ? "solid"
                                : "default"
                            }
                            disabled={Boolean(watchData.is_promo)}
                            onClick={() => {
                              formProps.setValue("discount_type", "nominal")
                              formProps.setValue("discount", 0)
                            }}
                          >
                            Rp
                          </Button>
                        </InputGroup>
                      </>
                    )
                  }}
                />
              </FormItem>
              <FormItem
                label="Notes"
                className="mb-2 w-full"
                invalid={Boolean(errors.notes)}
                errorMessage={errors.notes?.message}
              >
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      textArea
                      type="text"
                      autoComplete="off"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </FormItem>
            </div>
            <div className="mt-6 flex items-center justify-between gap-2 text-right">
              {type === "update" ? (
                <Button
                  className="flex items-center gap-1 bg-red-500 text-white hover:bg-red-600 ltr:mr-2 rtl:ml-2"
                  variant="solid"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash color="currentColor" size="24" variant="Outline" />
                </Button>
              ) : (
                <div></div>
              )}
              <Button variant="solid" type="submit">
                Save
              </Button>
            </div>
          </Form>
        </div>
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
