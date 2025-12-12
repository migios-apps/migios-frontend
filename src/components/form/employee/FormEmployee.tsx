import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateEmployee } from "@/services/api/@types/employee"
import {
  apiCreateEmployee,
  apiDeleteEmployee,
  apiUpdateEmployee,
} from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import { Trash, UserCirlceAdd } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { InputIdentity } from "@/components/ui/input-identity"
import PhoneInput from "@/components/ui/phone-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select } from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
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
  open: boolean
  type: "create" | "update"
  formProps: ReturnEmployeeSchema
  onClose: () => void
}

type OptionType = {
  value: string
  label: string
}

const FormEmployee: React.FC<FormProps> = ({
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
  const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>([])

  //   console.log('watchData', { watchData, errors })

  const handleClose = () => {
    resetEmployeeForm(formProps)
    onClose()
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
      })
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.code as string)
    setConfirmDelete(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[620px]" scrollBody>
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Employee" : "Update Employee"}
            </DialogTitle>
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="w-full">
                <div className="flex w-full flex-col items-center gap-0 md:flex-row md:gap-4">
                  <FormFieldItem
                    control={control}
                    name="photo"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.photo)}
                    errorMessage={errors.photo?.message}
                    render={() => (
                      <div className="mx-6">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback>
                            <UserCirlceAdd
                              color="currentColor"
                              size="24"
                              variant="Bold"
                            />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  />
                  <div className="w-full">
                    <FormFieldItem
                      control={control}
                      name="type"
                      label={
                        <FormLabel>
                          Type <span className="text-destructive">*</span>
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
                  </div>
                </div>
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
                      Phone Number <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.phone)}
                  errorMessage={errors.phone?.message}
                  render={({ field, fieldState }) => (
                    <PhoneInput
                      placeholder="+62 *** *** ***"
                      error={!!fieldState.error}
                      {...field}
                    />
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="identity_number"
                  label={
                    <FormLabel>
                      No. Identity <span className="text-destructive">*</span>
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
                          formProps.setValue(
                            "identity_type",
                            value as "ktp" | "sim" | "passport"
                          )
                        }}
                        identityNumber={field.value}
                        onIdentityNumberChange={field.onChange}
                        error={!!fieldState.error}
                        placeholder="No. Identity"
                      />
                    )
                  }}
                />
                <div className="flex w-full flex-col items-center gap-0 md:flex-row md:gap-6">
                  <FormFieldItem
                    control={control}
                    name="gender"
                    label={
                      <FormLabel>
                        Gender <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(errors.gender)}
                    errorMessage={errors.gender?.message}
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
                          <FormLabel className="font-normal">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value="f" />
                          </FormControl>
                          <FormLabel className="font-normal">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    )}
                  />
                  <FormFieldItem
                    control={control}
                    name="birth_date"
                    label={
                      <FormLabel>
                        Birth Date <span className="text-destructive">*</span>
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
                      Address <span className="text-destructive">*</span>
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
                <FormFieldItem
                  control={control}
                  name="specialist"
                  label={
                    <FormLabel>
                      Specialist <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.specialist)}
                  errorMessage={errors.specialist?.message}
                  render={({ field, fieldState }) => (
                    <>
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
                      <span className="text-xs text-gray-500">
                        Pisahkan dengan Enter
                      </span>
                    </>
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="description"
                  label={<FormLabel>Description (Optional)</FormLabel>}
                  invalid={Boolean(errors.description)}
                  errorMessage={errors.description?.message}
                  render={({ field }) => (
                    <Textarea
                      placeholder="Description"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="join_date"
                  label={
                    <FormLabel>
                      Join Date <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(errors.join_date)}
                  errorMessage={errors.join_date?.message}
                  render={({ field, fieldState }) => (
                    <DateTimePicker
                      value={
                        field.value
                          ? (field.value as unknown as Date)
                          : undefined
                      }
                      onChange={field.onChange}
                      error={!!fieldState.error}
                      hideTime={true}
                      clearable
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
              </div>
            </form>
          </Form>
          <DialogFooter className="flex items-center justify-between">
            {type === "update" ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1"
              >
                <Trash color="currentColor" size="24" variant="Outline" />
              </Button>
            ) : (
              <div></div>
            )}
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {create.isPending || update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Member"
        description="Are you sure want to delete this member?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default FormEmployee
