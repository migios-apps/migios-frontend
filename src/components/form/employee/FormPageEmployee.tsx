import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateEmployee } from "@/services/api/@types/employee"
import { Role } from "@/services/api/@types/settings/role"
import {
  apiCreateEmployee,
  apiDeleteEmployee,
  apiUpdateEmployee,
} from "@/services/api/EmployeeService"
import { apiGetRoleList } from "@/services/api/settings/Role"
import dayjs from "dayjs"
import { ArrowLeft, ChevronDown, Trash2, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { GroupBase, OptionsOrGroups } from "react-select"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomStickyBar from "@/components/ui/bottom-sticky-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormFieldItem,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { InputGroup } from "@/components/ui/input-group"
import PhoneInput from "@/components/ui/phone-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  type ReturnAsyncSelect,
  Select,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import Container from "@/components/container"
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
  onSuccess: () => void
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
  const queryClient = useQueryClient()
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

  // console.log("watchData", { watchData, errors })

  const handleClose = () => {
    resetEmployeeForm(formProps)
    onSuccess()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.employees] })
    handleClose()
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
    if (type === "update") {
      update.mutate({
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
        type: data.type as "user" | "trainer",
        earnings: data.earnings as CreateEmployee["earnings"],
        roles: data.roles as CreateEmployee["roles"],
      })
      return
    }
    if (type === "create") {
      create.mutate({
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
        type: data.type as "user" | "trainer",
        earnings: data.earnings as CreateEmployee["earnings"],
        roles: data.roles as CreateEmployee["roles"],
      })
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
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-auto flex-col gap-4">
              <Card className="gap-2 shadow-none">
                <CardHeader>
                  <CardTitle>Data diri</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
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
                      render={({ field }) => (
                        <PhoneInput placeholder="+62 *** *** ***" {...field} />
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
                        const dropdownItems = [
                          { key: "ktp", name: "KTP" },
                          { key: "sim", name: "SIM" },
                          { key: "passport", name: "Passport" },
                        ]
                        return (
                          <InputGroup>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                className="rounded-tr-none rounded-br-none"
                                aria-invalid={!!fieldState.error}
                              >
                                <Button type="button" variant="outline">
                                  <span>
                                    {
                                      dropdownItems.find(
                                        (item) =>
                                          item.key === watchData.identity_type
                                      )?.name
                                    }
                                  </span>
                                  <ChevronDown className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuRadioGroup
                                  value={watchData.identity_type}
                                  onValueChange={(val: any) => {
                                    formProps.setValue("identity_type", val)
                                  }}
                                >
                                  {dropdownItems.map((item, index) => (
                                    <DropdownMenuRadioItem
                                      key={index}
                                      value={item.key}
                                    >
                                      {item.name}
                                    </DropdownMenuRadioItem>
                                  ))}
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Input
                              type="text"
                              autoComplete="off"
                              placeholder="No. Identity"
                              className="rounded-tl-none rounded-bl-none"
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                          </InputGroup>
                        )
                      }}
                    />
                  </div>
                  <div className="flex w-full flex-col items-center gap-0 md:flex-row md:gap-6">
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
                          <FormItem className="flex items-center space-y-0 space-x-3">
                            <FormControl>
                              <RadioGroupItem value="other" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Lainnya
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
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          placeholder="Birth Date"
                          className="w-full"
                          error={!!fieldState.error}
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
                    <FormFieldItem
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
                          <InputGroup>
                            {watchData.earnings?.sales_type === "nominal" ? (
                              <InputCurrency
                                placeholder="Rp. 0"
                                value={field.value}
                                onValueChange={field.onChange}
                                aria-invalid={!!fieldState.error}
                                className="rounded-tr-none rounded-br-none"
                              />
                            ) : (
                              <Input
                                type="number"
                                autoComplete="off"
                                placeholder="10%"
                                {...field}
                                className="rounded-tr-none rounded-br-none"
                                aria-invalid={!!fieldState.error}
                              />
                            )}
                            <Button
                              type="button"
                              variant={
                                watchData.earnings?.sales_type === "percent"
                                  ? "default"
                                  : "outline"
                              }
                              className="rounded-none"
                              aria-invalid={!!fieldState.error}
                              onClick={() => {
                                formProps.setValue(
                                  "earnings.sales_type",
                                  "percent"
                                )
                                // formProps.setValue('sales', 0)
                              }}
                            >
                              %
                            </Button>
                            <Button
                              type="button"
                              variant={
                                watchData.earnings?.sales_type === "nominal"
                                  ? "default"
                                  : "outline"
                              }
                              className="rounded-tl-none rounded-bl-none"
                              aria-invalid={!!fieldState.error}
                              onClick={() => {
                                formProps.setValue(
                                  "earnings.sales_type",
                                  "nominal"
                                )
                                // formProps.setValue('sales', 0)
                              }}
                            >
                              Rp
                            </Button>
                          </InputGroup>
                        )
                      }}
                    />
                    <FormFieldItem
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
                    />
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
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4 md:w-[370px]">
              <Card className="gap-2 shadow-none">
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
                  <FormFieldItem
                    control={control}
                    name="type"
                    label={
                      <FormLabel>
                        Jenis staff <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.type)}
                    errorMessage={errors.type?.message}
                    render={({ field, fieldState }) => (
                      <Select
                        {...field}
                        isSearchable={false}
                        placeholder="Please Select"
                        value={userTypeOptions.filter(
                          (option) => option.value === field.value
                        )}
                        options={userTypeOptions}
                        onChange={(option) => field.onChange(option?.value)}
                        error={!!fieldState.error}
                      />
                    )}
                  />
                  {watchData.type === "trainer" && (
                    <FormFieldItem
                      control={control}
                      name="specialist"
                      label={
                        <FormLabel>
                          Spesialisasi{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                      }
                      invalid={Boolean(errors.specialist)}
                      errorMessage={errors.specialist?.message}
                      render={({ field, fieldState }) => (
                        <Select
                          isMulti={true}
                          value={
                            field.value
                              ?.split(",")
                              .map((option) => ({
                                label: option.trim(),
                                value: option.trim(),
                              }))
                              .filter((item) => item.value !== "") || []
                          }
                          options={selectedOptions}
                          hideSelectedOptions={true}
                          backspaceRemovesValue={false}
                          onChange={(e) => {
                            const vaue = e as unknown as OptionType[]
                            const newVal = vaue?.filter(
                              (item) => item.value !== ""
                            )
                            setSelectedOptions(newVal)
                            field.onChange(
                              newVal.map((item) => item.value).join(", ")
                            )
                          }}
                          onInputChange={(newValue, actionMeta) => {
                            if (actionMeta.action === "input-change") {
                              const options = newValue
                                .split(",")
                                .map((option) => ({
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
                  )}
                  {watchData.type === "trainer" && (
                    <span className="text-muted-foreground text-xs">
                      Pisahkan dengan Enter
                    </span>
                  )}
                  {/* <FormItem
                  label="Description (Optional)"
                  invalid={Boolean(errors.description)}
                  errorMessage={errors.description?.message}
                >
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        placeholder="Description"
                        {...field}
                        value={field.value ?? ''}
                      />
                    )}
                  />
                </FormItem> */}
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
                      <DatePicker
                        selected={field.value}
                        onSelect={field.onChange}
                        placeholder="Join Date"
                      />
                    )}
                  />
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
