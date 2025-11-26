import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UpdateEmployeeDto } from "@/services/api/@types/user"
import { apiUpdateEmployeeProfile } from "@/services/api/UserService"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import PhoneInput from "@/components/ui/phone-input"
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import LayoutAccount from "../Layout"
import {
  useEmployeeProfileValidation,
  resetEmployeeProfileForm,
  type EmployeeProfileSchema,
} from "./profileValidation"

const ProfilePage = () => {
  const queryClient = useQueryClient()
  const { user } = useSessionUser()

  const form = useEmployeeProfileValidation()
  const watchData = form.watch()

  useEffect(() => {
    if (user?.employee) {
      resetEmployeeProfileForm(form, {
        name: user.employee.name as NonNullable<EmployeeProfileSchema["name"]>,
        phone: user.employee.phone as NonNullable<
          EmployeeProfileSchema["phone"]
        >,
        identity_number: user.employee.identity_number as NonNullable<
          EmployeeProfileSchema["identity_number"]
        >,
        identity_type: user.employee.identity_type as NonNullable<
          EmployeeProfileSchema["identity_type"]
        >,
        birth_date: new Date(user.employee.birth_date as string),
        address: user.employee.address as NonNullable<
          EmployeeProfileSchema["address"]
        >,
        gender: user.employee.gender as NonNullable<
          EmployeeProfileSchema["gender"]
        >,
      })
    }
  }, [user, form])

  const updateEmployeeMutation = useMutation({
    mutationFn: (data: UpdateEmployeeDto) => apiUpdateEmployeeProfile(data),
    onSuccess: () => {
      toast.success("Profile berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.userProfile] })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Gagal memperbarui profile"
      )
    },
  })

  const onSubmit = (data: EmployeeProfileSchema) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== "" && value !== null
      )
    ) as UpdateEmployeeDto

    // Convert date to string format if exists
    if (filteredData.birth_date) {
      filteredData.birth_date = new Date(filteredData.birth_date as any)
        .toISOString()
        .split("T")[0]
    }

    updateEmployeeMutation.mutate(filteredData)
  }

  return (
    <LayoutAccount>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Employee Profile</h3>
          <p className="text-muted-foreground text-sm">
            Update informasi profile employee Anda di club ini.
          </p>
        </div>
        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              <FormFieldItem
                control={form.control}
                name="name"
                label="Nama"
                description="Nama yang akan ditampilkan di profile employee."
                render={({ field }) => (
                  <Input placeholder="Masukkan nama" {...field} />
                )}
              />

              <FormFieldItem
                control={form.control}
                name="phone"
                label={
                  <FormLabel>
                    Nomor Telepon <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(form.formState.errors.phone)}
                errorMessage={form.formState.errors.phone?.message}
                render={({ field }) => (
                  <PhoneInput placeholder="+62 *** *** ***" {...field} />
                )}
              />

              <FormFieldItem
                control={form.control}
                name="gender"
                label="Jenis Kelamin"
                render={({ field }) => (
                  <SelectUI
                    onValueChange={field.onChange}
                    value={
                      field.value as NonNullable<
                        EmployeeProfileSchema["gender"]
                      >
                    }
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Laki-laki</SelectItem>
                      <SelectItem value="f">Perempuan</SelectItem>
                    </SelectContent>
                  </SelectUI>
                )}
              />

              <FormFieldItem
                control={form.control}
                name="birth_date"
                label={
                  <FormLabel>
                    Tanggal Lahir <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(form.formState.errors.birth_date)}
                errorMessage={form.formState.errors.birth_date?.message}
                render={({ field, fieldState }) => (
                  <DatePicker
                    selected={
                      field.value
                        ? new Date(field.value as unknown as string)
                        : undefined
                    }
                    onSelect={field.onChange}
                    placeholder="Birth Date"
                    className="w-full"
                    error={!!fieldState.error}
                  />
                )}
              />

              <FormFieldItem
                control={form.control}
                name="specialist"
                label="Spesialisasi"
                description="Spesialisasi atau keahlian khusus (untuk trainer)."
                render={({ field }) => (
                  <Input
                    placeholder="Fitness Trainer, Yoga Instructor, dll"
                    {...field}
                  />
                )}
              />

              <FormFieldItem
                control={form.control}
                name="identity_number"
                label={
                  <FormLabel>
                    Nomor Identitas <span className="text-destructive">*</span>
                  </FormLabel>
                }
                description="Pilih tipe identitas dan masukkan nomornya"
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
                                  (item) => item.key === watchData.identity_type
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
                              form.setValue("identity_type", val)
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
                        placeholder="No. Identitas"
                        className="rounded-tl-none rounded-bl-none"
                        aria-invalid={!!fieldState.error}
                        {...field}
                      />
                    </InputGroup>
                  )
                }}
              />
            </div>

            <FormFieldItem
              control={form.control}
              name="address"
              label="Alamat"
              description="Alamat tempat tinggal yang dapat dihubungi."
              render={({ field }) => (
                <Textarea
                  placeholder="Masukkan alamat lengkap"
                  className="resize-none"
                  {...field}
                />
              )}
            />

            <Button
              type="submit"
              disabled={updateEmployeeMutation.isPending}
              className="w-full md:w-auto"
            >
              {updateEmployeeMutation.isPending
                ? "Menyimpan..."
                : "Update Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </LayoutAccount>
  )
}

export default ProfilePage
