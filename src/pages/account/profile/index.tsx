import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UpdateEmployeeDto } from "@/services/api/@types/user"
import { apiUpdateEmployeeProfile } from "@/services/api/UserService"
import { toast } from "sonner"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { InputIdentity } from "@/components/ui/input-identity"
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
                render={({ field, fieldState }) => (
                  <PhoneInput
                    placeholder="+62 *** *** ***"
                    {...field}
                    error={!!fieldState.error}
                  />
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
                  <DateTimePicker
                    value={
                      field.value ? (field.value as unknown as Date) : undefined
                    }
                    onChange={field.onChange}
                    className="w-full"
                    error={!!fieldState.error}
                    hideTime={true}
                    clearable
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
                  return (
                    <InputIdentity
                      identityType={watchData.identity_type}
                      onIdentityTypeChange={(value) => {
                        form.setValue("identity_type", value as any)
                            }}
                      identityNumber={field.value}
                      onIdentityNumberChange={field.onChange}
                      error={!!fieldState.error}
                        placeholder="No. Identitas"
                      />
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
