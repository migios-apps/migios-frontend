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
import { ArrowDown2, Trash } from "iconsax-reactjs"
import { ArrowLeft, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BottomStickyBar from "@/components/ui/bottom-sticky-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker/date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import PhoneInput from "@/components/ui/phone-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import Upload from "@/components/ui/upload"
import Container from "@/components/container"
import {
  CreateMemberSchema,
  ReturnMemberSchema,
  resetMemberForm,
} from "./memberValidation"

type FormProps = {
  type: "create" | "update"
  formProps: ReturnMemberSchema
  onSuccess: () => void
}

const FormPageMember: React.FC<FormProps> = ({
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

  const handleClose = () => {
    resetMemberForm(formProps)
    onSuccess()
  }

  const handlePrefetch = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.members] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateMemberTypes) => apiCreateMember(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefetch,
  })

  const update = useMutation({
    mutationFn: (data: CreateMemberTypes) =>
      apiUpdateMember(watchData.code as string, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefetch,
  })

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiDeleteMember(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handlePrefetch,
  })

  const onSubmit: SubmitHandler<CreateMemberSchema> = (data) => {
    const payload: CreateMemberTypes = {
      club_id: club?.id as number,
      name: data.name,
      address: data.address,
      identity_number: data.identity_number,
      identity_type: data.identity_type,
      birth_date: dayjs(data.birth_date).format("YYYY-MM-DD"),
      gender: data.gender,
      phone: data.phone,
      photo: data.photo as string | null,
      email: data.email,
      notes: data.notes as string | null,
      goals: data.goals as string | null,
      height_cm: data.height_cm || null,
      join_date: dayjs(data.join_date).format("YYYY-MM-DD"),
      enabled: data.enabled,
    }

    if (type === "update") {
      update.mutate(payload)
      return
    }
    if (type === "create") {
      create.mutate(payload)
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.code as string)
    setConfirmDelete(false)
  }

  return (
    <>
      <Form {...formProps}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-auto flex-col gap-4">
              <Card>
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
                            <FormLabel className="font-normal">
                              Female
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
                          selected={
                            field.value
                              ? dayjs(field.value).toDate()
                              : undefined
                          }
                          onSelect={(date) => {
                            field.onChange(
                              date ? dayjs(date).format("YYYY-MM-DD") : null
                            )
                          }}
                          placeholder="Date"
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
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-4 md:w-[370px]">
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex w-full items-center justify-center">
                    <FormFieldItem
                      control={control}
                      name="photo"
                      label={<FormLabel></FormLabel>}
                      invalid={Boolean(errors.photo)}
                      errorMessage={errors.photo?.message}
                      render={({ field }) => (
                        <div className="flex w-full flex-col items-center justify-center">
                          <div className="flex items-center justify-center">
                            {field.value ? (
                              <Avatar className="border-background bg-muted size-24 border-4 shadow-lg">
                                <AvatarImage src={field.value} alt="Profile" />
                                <AvatarFallback>
                                  <User className="text-muted-foreground size-12" />
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="border-border bg-muted flex size-24 items-center justify-center rounded-full border-4">
                                <User className="text-muted-foreground size-12" />
                              </div>
                            )}
                          </div>
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
                            <Button
                              variant="default"
                              className="mt-4"
                              type="button"
                            >
                              Upload Image
                            </Button>
                          </Upload>
                        </div>
                      )}
                    />
                  </div>
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
                    render={({ field, fieldState }) => (
                      <DatePicker
                        selected={
                          field.value ? dayjs(field.value).toDate() : undefined
                        }
                        onSelect={(date) => {
                          field.onChange(
                            date ? dayjs(date).format("YYYY-MM-DD") : null
                          )
                        }}
                        placeholder="Date"
                        error={!!fieldState.error}
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
                </CardContent>
              </Card>
            </div>
          </div>
          <BottomStickyBar>
            <Container>
              <div className="flex items-center justify-between px-8">
                <Button
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
                      <Trash color="currentColor" size={20} variant="Outline" />
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

export default FormPageMember
