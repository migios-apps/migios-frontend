import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { CreateEmployee } from "@/services/api/@types/employee"
import { Role } from "@/services/api/@types/settings/role"
import {
  apiCreateEmployee,
  apiDeleteEmployee,
  apiUpdateEmployee,
} from "@/services/api/EmployeeService"
import { apiGetRoleList } from "@/services/api/settings/Role"
import dayjs from "dayjs"
import { ArrowLeft, Trash2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomStickyBar from "@/components/ui/bottom-sticky-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-picker"
import {
  Form,
  FormControl,
  FormFieldItem,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency, { currencyFormat } from "@/components/ui/input-currency"
import { InputIdentity } from "@/components/ui/input-identity"
import InputPhone from "@/components/ui/input-phone"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  type ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import Container from "@/components/container"
import CommissionPerPackage from "./CommissionPerPackage"
import CommissionPerProduct from "./CommissionPerProduct"
import {
  CreateEmployeeSchema,
  ReturnEmployeeSchema,
  resetEmployeeForm,
} from "./employeeValidation"

export const userTypeOptions = [
  { label: "User", value: "user" },
  { label: "Trainer", value: "trainer" },
]

type FormProps = {
  type: "create" | "update"
  formProps: ReturnEmployeeSchema
  onSuccess?: () => void
}

type OptionType = {
  value: string
  label: string
}

const FormPageEmployee: React.FC<FormProps> = ({
  type,
  formProps,
  onSuccess,
}) => {
  const navigate = useNavigate()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>([])
  const [openCommissionPerPackage, setOpenCommissionPerPackage] =
    React.useState(false)
  const [openCommissionPerProduct, setOpenCommissionPerProduct] =
    React.useState(false)

  // console.log("watchData", { watchData, errors })

  const handleClose = () => {
    resetEmployeeForm(formProps)
  }

  const handlePrefecth = (res: any) => {
    const data = res.data?.data
    handleClose()
    onSuccess?.()
    if (data?.code) {
      navigate(`/employee/detail/${data?.code}`, { replace: true })
    }
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateEmployee) => apiCreateEmployee(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateEmployee) =>
      apiUpdateEmployee(watchData.code as string, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiDeleteEmployee(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateEmployeeSchema> = (data) => {
    const body = {
      club_id: club?.id as number,
      name: data.name,
      address: data.address,
      identity_number: data.identity_number,
      identity_type: data.identity_type,
      gender: data.gender,
      phone: data.phone,
      photo: data.photo as string | null,
      email: data.email,
      birth_date: dayjs(data.birth_date).format("YYYY-MM-DD"),
      join_date: dayjs(data.join_date).format("YYYY-MM-DD"),
      enabled: data.enabled,
      description: data.description as string | null,
      specialist: data.specialist,
      roles: data.roles as CreateEmployee["roles"],
      earnings: data.earnings as CreateEmployee["earnings"],
      commission_product:
        data.earnings.default_sales_product_commission === 1
          ? []
          : (data.commission_product?.filter(
              (item) => item.sales > 0
            ) as CreateEmployee["commission_product"]),
      commission_package:
        data.earnings.default_sales_package_commission === 1
          ? []
          : (data.commission_package?.filter(
              (item) => item.sales > 0
            ) as CreateEmployee["commission_package"]),
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
    deleteItem.mutate(watchData.code as string)
    setConfirmDelete(false)
  }

  const getListRole = async (
    inputValue: string,
    _: OptionsOrGroups<Role, GroupBase<Role>>,
    additional?: { page: number }
  ) => {
    const response = await apiGetRoleList({
      page: additional?.page,
      per_page: 10,
      search: [
        (inputValue || "").length > 0
          ? ({
              search_column: "display_name",
              search_condition: "like",
              search_text: `${inputValue}`,
            } as any)
          : null,
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
  }

  return (
    <>
      <Form {...formProps}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
            <Card className="gap-2 shadow-none">
              <CardHeader>
                <CardTitle>Data diri</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex w-full items-center justify-center">
                  <FormFieldItem
                    control={control}
                    name="photo"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.photo)}
                    errorMessage={errors.photo?.message}
                    render={({ field }) => (
                      <div className="flex w-full items-center justify-center">
                        <Avatar className="border-background bg-muted size-24 border-4 shadow-lg">
                          <AvatarImage
                            src={field.value ?? undefined}
                            alt="Profile"
                          />
                          <AvatarFallback>
                            <User className="text-muted-foreground size-12" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                    name="email"
                    label={
                      <FormLabel>
                        Email <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                    render={({ field }) => (
                      <Input
                        type="email"
                        autoComplete="off"
                        placeholder="Email"
                        {...field}
                      />
                    )}
                  />
                  <FormFieldItem
                    control={control}
                    name="phone"
                    label={
                      <FormLabel>
                        Nomor Telepon{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.phone)}
                    errorMessage={errors.phone?.message}
                    render={({ field, fieldState }) => (
                      <InputPhone
                        placeholder="+62 *** *** ***"
                        {...field}
                        error={!!fieldState.error}
                      />
                    )}
                  />
                  <FormFieldItem
                    control={control}
                    name="identity_number"
                    label={
                      <FormLabel>
                        Nomor Identitas{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={
                      Boolean(errors.identity_type) ||
                      Boolean(errors.identity_number)
                    }
                    errorMessage={
                      errors.identity_type?.message ||
                      errors.identity_number?.message
                    }
                    render={({ field, fieldState }) => {
                      return (
                        <InputIdentity
                          identityType={watchData.identity_type}
                          onIdentityTypeChange={(value) => {
                            formProps.setValue("identity_type", value as any)
                          }}
                          identityNumber={field.value}
                          onIdentityNumberChange={field.onChange}
                          error={!!fieldState.error}
                          placeholder="No. Identity"
                        />
                      )
                    }}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormFieldItem
                    control={control}
                    name="gender"
                    label={
                      <FormLabel>
                        Jenis Kelamin{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value ? String(field.value) : undefined}
                        className="flex space-y-1"
                      >
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="m" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Laki-laki
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="f" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Perempuan
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    )}
                  />
                  <FormFieldItem
                    control={control}
                    name="birth_date"
                    label={
                      <FormLabel>
                        Tanggal Lahir{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.birth_date)}
                    errorMessage={errors.birth_date?.message}
                    render={({ field, fieldState }) => (
                      <DateTimePicker
                        value={
                          field.value
                            ? (field.value as unknown as Date)
                            : undefined
                        }
                        onChange={field.onChange}
                        className="w-full"
                        error={!!fieldState.error}
                        hideTime={true}
                        clearable
                      />
                    )}
                  />
                </div>
                <FormFieldItem
                  control={control}
                  name="address"
                  label={
                    <FormLabel>
                      Alamat <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.address)}
                  errorMessage={errors.address?.message}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Address"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormFieldItem
                    control={control}
                    name="join_date"
                    label={
                      <FormLabel>
                        Tanggal Bergabung{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.join_date)}
                    errorMessage={errors.join_date?.message}
                    render={({ field }) => (
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
                    )}
                  />
                </div>
                <FormFieldItem
                  control={control}
                  name="specialist"
                  label={
                    <FormLabel>
                      Spesialisasi <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.specialist)}
                  errorMessage={errors.specialist?.message}
                  render={({ field, fieldState }) => (
                    <Select
                      isMulti={true}
                      value={
                        field.value && field.value.length > 0
                          ? field.value.split(",").map((option) => ({
                              label: option.trim(),
                              value: option.trim(),
                            }))
                          : []
                      }
                      options={selectedOptions}
                      hideSelectedOptions={true}
                      backspaceRemovesValue={false}
                      onChange={(e) => {
                        const val = e as unknown as OptionType[]
                        const newVal = val?.filter((item) => item.value !== "")
                        setSelectedOptions(newVal)
                        field.onChange(
                          newVal.map((item) => item.value).join(", ")
                        )
                      }}
                      onInputChange={(newValue, actionMeta) => {
                        if (actionMeta.action === "input-change") {
                          const options = newValue.split(",").map((option) => ({
                            label: option.trim(),
                            value: option.trim(),
                          }))
                          setSelectedOptions(options)
                        }
                      }}
                      error={!!fieldState.error}
                    />
                  )}
                />
                <span className="text-muted-foreground text-xs">
                  Pisahkan dengan Enter
                </span>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormFieldItem
                    control={control}
                    name="enabled"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.enabled)}
                    errorMessage={errors.enabled?.message}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-y-0 space-x-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          >
                            {field.value ? "Enabled" : "Disabled"}
                          </Checkbox>
                        </FormControl>
                        <FormLabel className="font-normal">Enabled</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="gap-2 shadow-none">
              <CardHeader>
                <CardTitle>Pendapatan dan komisi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormFieldItem
                  control={control}
                  name="earnings.base_salary"
                  label={
                    <FormLabel>
                      Gaji pokok <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.earnings?.base_salary)}
                  errorMessage={errors.earnings?.base_salary?.message}
                  render={({ field }) => (
                    <InputCurrency
                      placeholder="Rp. 0"
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    />
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* <FormFieldItem
                    control={control}
                    name="earnings.sales"
                    label={<FormLabel>Komisi penjualan</FormLabel>}
                    invalid={
                      Boolean(errors.earnings?.sales) ||
                      Boolean(errors.earnings?.sales_type)
                    }
                    errorMessage={
                      errors.earnings?.sales?.message ||
                      errors.earnings?.sales_type?.message
                    }
                    render={({ field, fieldState }) => {
                      return (
                        <InputPercentNominal
                          value={field.value}
                          onChange={field.onChange}
                          type={
                            (watchData.earnings?.sales_type as
                              | "percent"
                              | "nominal") || "percent"
                          }
                          onTypeChange={(type) => {
                            formProps.setValue(
                              "earnings.sales_type",
                              type as any
                            )
                          }}
                          error={!!fieldState.error}
                          placeholderPercent="10%"
                          placeholderNominal="Rp. 0"
                        />
                      )
                    }}
                  /> */}
                  {/* <FormFieldItem
                    control={control}
                    name="earnings.service"
                    label={<FormLabel>Komisi layanan</FormLabel>}
                    invalid={Boolean(errors.earnings?.service)}
                    errorMessage={errors.earnings?.service?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  /> */}
                  <FormFieldItem
                    control={control}
                    name="earnings.session"
                    label={<FormLabel>Komisi per sesi</FormLabel>}
                    invalid={Boolean(errors.earnings?.session)}
                    errorMessage={errors.earnings?.session?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <FormFieldItem
                    control={control}
                    name="earnings.class"
                    label={<FormLabel>Komisi per kelas</FormLabel>}
                    invalid={Boolean(errors.earnings?.class)}
                    errorMessage={errors.earnings?.class?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg border p-4">
                  <FormLabel className="text-base font-semibold">
                    Komisi Penjualan
                  </FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Perhitungan komisi penjualan berdasarkan item transaksi.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <FormLabel>Komisi per paket dan plan</FormLabel>
                      <div
                        className="bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-2 text-sm"
                        onClick={() => setOpenCommissionPerPackage(true)}
                      >
                        <span className="text-muted-foreground">
                          {watchData.earnings
                            .default_sales_package_commission === 1
                            ? watchData.earnings
                                .default_sales_package_commission_type ===
                              "percent"
                              ? `${watchData.earnings.default_sales_package_commission_amount}%`
                              : currencyFormat(
                                  watchData.earnings
                                    .default_sales_package_commission_amount
                                )
                            : "Komisi per paket dan plan"}
                        </span>
                        <span className="text-primary font-semibold">
                          Ganti
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Komisi dihitung berdasarkan subtotal item dari paket dan
                        plan
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <FormLabel>Komisi per produk</FormLabel>
                      <div
                        className="bg-muted/50 text-muted-foreground flex cursor-pointer items-center justify-between rounded-lg border p-2 text-sm"
                        onClick={() => setOpenCommissionPerProduct(true)}
                      >
                        <span className="text-muted-foreground">
                          {watchData.earnings
                            .default_sales_product_commission === 1
                            ? watchData.earnings
                                .default_sales_product_commission_type ===
                              "percent"
                              ? `${watchData.earnings.default_sales_product_commission_amount}%`
                              : currencyFormat(
                                  watchData.earnings
                                    .default_sales_product_commission_amount
                                )
                            : "Komisi per produk"}
                        </span>
                        <span className="text-primary font-semibold">
                          Ganti
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Komisi dihitung berdasarkan subtotal item dari produk
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="gap-2 shadow-none">
              <CardHeader>
                <CardTitle>Role</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormFieldItem
                  control={control}
                  name="roles"
                  label={
                    <FormLabel>
                      Roles <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  render={({ field, fieldState }) => (
                    <SelectAsyncPaginate
                      isClearable
                      isMulti
                      // isLoading={isLoading}
                      loadOptions={getListRole as any}
                      additional={{ page: 1 }}
                      placeholder="Select Role"
                      menuPlacement="top"
                      value={field.value}
                      cacheUniqs={[watchData.roles]}
                      isOptionDisabled={() =>
                        ((watchData.roles as any[]) ?? []).length >= 5
                      }
                      error={!!fieldState.error}
                      getOptionLabel={(option) => option.name!}
                      getOptionValue={(option) => option.id.toString()}
                      debounceTimeout={500}
                      formatOptionLabel={({ name }) => {
                        return (
                          <div className="flex items-center justify-start gap-2">
                            <span className="text-sm">{name}</span>
                          </div>
                        )
                      }}
                      onChange={(option) => field.onChange(option)}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
          <BottomStickyBar>
            <Container>
              <div className="flex items-center justify-between px-8">
                <Button
                  className="ltr:mr-3 rtl:ml-3"
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <div className="flex items-center">
                  {type === "update" ? (
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1 ltr:mr-2 rtl:ml-2"
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
                    {create.isPending || update.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                </div>
              </div>
            </Container>
          </BottomStickyBar>
        </form>
      </Form>

      <CommissionPerPackage
        formProps={formProps}
        open={openCommissionPerPackage}
        onClose={() => setOpenCommissionPerPackage(false)}
      />
      <CommissionPerProduct
        formProps={formProps}
        open={openCommissionPerProduct}
        onClose={() => setOpenCommissionPerProduct(false)}
      />
      <AlertConfirm
        open={confirmDelete}
        title="Delete Employee"
        description="Are you sure want to delete this employee?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormPageEmployee
