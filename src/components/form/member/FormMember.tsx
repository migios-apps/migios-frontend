import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateMemberTypes } from "@/services/api/@types/member"
import {
  apiCreateMember,
  apiDeleteMember,
  apiUpdateMember,
} from "@/services/api/MembeService"
import dayjs from "dayjs"
import { ArrowDown2, Trash, UserCirlceAdd } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import PhoneInput from "@/components/ui/phone-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import Upload from "@/components/ui/upload"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import {
  CreateMemberSchema,
  ReturnMemberSchema,
  resetMemberForm,
} from "./memberValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnMemberSchema
  onClose: () => void
}

const FormMember: React.FC<FormProps> = ({
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

  //   console.log('watchData', { watchData, errors })

  const handleClose = () => {
    resetMemberForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.members] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateMemberTypes) => apiCreateMember(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateMemberTypes) =>
      apiUpdateMember(watchData.code as string, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiDeleteMember(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateMemberSchema> = (data) => {
    if (type === "update") {
      update.mutate({
        club_id: club?.id as number,
        name: data.name,
        address: data.address,
        identity_number: data.identity_number,
        identity_type: data.identity_type,
        birth_date: dayjs(data.birth_date).format("YYYY-MM-DD"),
        gender: data.gender,
        phone: data.phone,
        photo: data.photo,
        email: data.email,
        notes: data.notes,
        // private_notes: data.private_notes,
        goals: data.goals,
        height_cm: data.height_cm || null,
        join_date: dayjs(data.join_date).format("YYYY-MM-DD"),
        enabled: data.enabled,
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
        birth_date: dayjs(data.birth_date).format("YYYY-MM-DD"),
        gender: data.gender,
        phone: data.phone,
        photo: data.photo,
        email: data.email,
        notes: data.notes,
        // private_notes: data.private_notes,
        goals: data.goals,
        height_cm: data.height_cm || null,
        join_date: dayjs(data.join_date).format("YYYY-MM-DD"),
        enabled: data.enabled,
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
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Member" : "Update Member"}
            </DialogTitle>
            <DialogDescription>
              {type === "create"
                ? "Tambahkan member baru ke sistem"
                : "Update informasi member"}
            </DialogDescription>
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div className="flex w-full flex-col items-center gap-4 md:flex-row">
                  <FormFieldItem
                    control={control}
                    name="photo"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.photo)}
                    errorMessage={errors.photo?.message}
                    render={({ field }) => (
                      <Upload
                        showList={false}
                        uploadLimit={1}
                        onChange={(files) => {
                          if (files.length > 0) {
                            const file = files[0]
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              field.onChange(reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      >
                        <Avatar className="border-background bg-muted size-20 border-4 shadow-lg">
                          <AvatarImage
                            src={field.value || undefined}
                            alt="Profile"
                          />
                          <AvatarFallback>
                            <UserCirlceAdd
                              color="currentColor"
                              variant="Bold"
                              size={32}
                            />
                          </AvatarFallback>
                        </Avatar>
                      </Upload>
                    )}
                  />
                  <div className="w-full">
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
                  </div>
                </div>
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
                  render={({ field }) => (
                    <PhoneInput placeholder="+62 *** *** ***" {...field} />
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
                  render={({ field }) => {
                    const dropdownItems = [
                      { key: "ktp", name: "KTP" },
                      { key: "sim", name: "SIM" },
                      { key: "passport", name: "Passport" },
                    ]
                    return (
                      <InputGroup>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <InputGroupAddon className="rounded-tr-none rounded-br-none">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                              >
                                <span>
                                  {dropdownItems.find(
                                    (item) =>
                                      item.key === watchData.identity_type
                                  )?.name || "Pilih"}
                                </span>
                                <ArrowDown2
                                  color="currentColor"
                                  variant="Outline"
                                  size={14}
                                />
                              </Button>
                            </InputGroupAddon>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {dropdownItems.map((item) => (
                              <DropdownMenuItem
                                key={item.key}
                                onClick={() => {
                                  formProps.setValue(
                                    "identity_type",
                                    item.key as any
                                  )
                                }}
                              >
                                {item.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <InputGroupInput
                          type="text"
                          autoComplete="off"
                          placeholder="No. Identity"
                          {...field}
                        />
                      </InputGroup>
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
                        onChange={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }}
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
                  label={<FormLabel>Address</FormLabel>}
                  invalid={Boolean(errors.address)}
                  errorMessage={errors.address?.message}
                  render={({ field }) => (
                    <Textarea
                      autoComplete="off"
                      placeholder="Address"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="goals"
                  label={<FormLabel>Goals (Optional)</FormLabel>}
                  invalid={Boolean(errors.goals)}
                  errorMessage={errors.goals?.message}
                  render={({ field }) => (
                    <Textarea
                      autoComplete="off"
                      placeholder="Diet, Exercise, etc"
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
                <FormFieldItem
                  control={control}
                  name="height_cm"
                  label={<FormLabel>Tinggi Badan (Cm)</FormLabel>}
                  invalid={Boolean(errors.height_cm)}
                  errorMessage={errors.height_cm?.message}
                  render={({ field }) => (
                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="Tinggi Badan (Cm)"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || null
                        field.onChange(value)
                      }}
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
                      onChange={(date) => {
                        field.onChange(
                          date ? dayjs(date).format("YYYY-MM-DD") : null
                        )
                      }}
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
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {field.value ? "Enabled" : "Disabled"}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                {type === "update" ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1"
                  >
                    <Trash color="currentColor" size={20} variant="Outline" />
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
              </DialogFooter>
            </form>
          </Form>
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

export default FormMember
