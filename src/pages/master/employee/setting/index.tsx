import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { apiUpdateSettings } from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { Save } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loading from "@/components/ui/loading"
import { Switch } from "@/components/ui/switch"
import EmployeeLayout from "../Layout"

const validationSchema = yup.object().shape({
  employee_code_prefix: yup
    .string()
    .default("EMP")
    .trim()
    .required("Prefix harus diisi")
    .matches(/^[A-Z0-9]+$/, "Hanya huruf kapital dan angka")
    .max(6, "Maksimal 6 karakter"),
  employee_code_include_club_id: yup.boolean().default(true),
  employee_code_sequence_length: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(5)
    .required("Panjang nomor urut harus diisi")
    .min(5, "Minimal 5 digit")
    .max(10, "Maksimal 10 digit"),
  employee_apply_to_all_branch: yup.boolean().default(false),
})

type EmployeeSettingsFormSchema = yup.InferType<typeof validationSchema>

const EMPLOYEE_CODE_CLUB_SEGMENT_LENGTH = 5

const INITIAL_SETTINGS: EmployeeSettingsFormSchema = {
  employee_code_prefix: "EMP",
  employee_code_include_club_id: true,
  employee_code_sequence_length: 5,
  employee_apply_to_all_branch: false,
}

const EmployeeSettingPage = () => {
  const queryClient = useQueryClient()
  const { club } = useAuth()

  const { settings: settingsData, isLoading: isLoadingSettings } = useSettings()

  const isMainClub = club?.club_type === "main"

  const formProps = useForm<EmployeeSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, reset } = formProps
  const watchData = watch()

  useEffect(() => {
    if (settingsData) {
      reset({
        ...INITIAL_SETTINGS,
        employee_code_prefix:
          settingsData.employee_code_prefix ??
          INITIAL_SETTINGS.employee_code_prefix,
        employee_code_include_club_id:
          settingsData.employee_code_include_club_id ??
          INITIAL_SETTINGS.employee_code_include_club_id,
        employee_code_sequence_length:
          settingsData.employee_code_sequence_length ??
          INITIAL_SETTINGS.employee_code_sequence_length,
      })
    }
  }, [settingsData, reset])

  const employeeCodePreview = [
    watchData.employee_code_prefix || "EMP",
    watchData.employee_code_include_club_id
      ? String(club?.id ?? 1).padStart(EMPLOYEE_CODE_CLUB_SEGMENT_LENGTH, "0")
      : "",
    "1".padStart(watchData.employee_code_sequence_length || 5, "0"),
  ].join("")

  const updateSettingsMutation = useMutation({
    mutationFn: (data: EmployeeSettingsFormSchema) =>
      apiUpdateSettings({
        employee_code_prefix: data.employee_code_prefix,
        employee_code_include_club_id: data.employee_code_include_club_id,
        employee_code_sequence_length: data.employee_code_sequence_length,
        employee_apply_to_all_branch: data.employee_apply_to_all_branch,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
      toast.success("Pengaturan karyawan berhasil disimpan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal menyimpan pengaturan karyawan"
      )
    },
  })

  const handleSave = (data: EmployeeSettingsFormSchema) => {
    updateSettingsMutation.mutate(data)
  }

  if (isLoadingSettings) {
    return (
      <EmployeeLayout>
        <div className="flex h-64 items-center justify-center">
          <Loading loading />
        </div>
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout>
      <Form {...formProps}>
        <form
          onSubmit={handleSubmit(handleSave)}
          className="mx-auto max-w-3xl space-y-4"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">Pengaturan Karyawan</h1>
              <Badge variant={isMainClub ? "default" : "secondary"}>
                {isMainClub ? "Gym Pusat" : "Cabang"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Format kode karyawan untuk {club?.name ?? "club ini"}. Hak akses
              per peran diatur di menu Peran & Izin, sedangkan kebijakan
              password dan masa berlaku sesi adalah kebijakan sistem yang
              berlaku sama untuk seluruh gym.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Penomoran Kode Karyawan</CardTitle>
              <p className="text-muted-foreground text-sm">
                Saat ini prefix <span className="font-mono">EMP</span> dan
                panjang nomor urut dikunci di kode. Polanya sama persis dengan
                kode member yang sudah bisa diatur.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormFieldItem
                  control={control}
                  name="employee_code_prefix"
                  label={<FormLabel>Prefix</FormLabel>}
                  invalid={Boolean(formState.errors.employee_code_prefix)}
                  errorMessage={formState.errors.employee_code_prefix?.message}
                  render={({ field }) => (
                    <Input
                      autoComplete="off"
                      placeholder="EMP"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />

                <FormFieldItem
                  control={control}
                  name="employee_code_sequence_length"
                  label={<FormLabel>Panjang Nomor Urut</FormLabel>}
                  invalid={Boolean(
                    formState.errors.employee_code_sequence_length
                  )}
                  errorMessage={
                    formState.errors.employee_code_sequence_length?.message
                  }
                  render={({ field }) => (
                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="5"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  )}
                />
              </div>

              <FormFieldItem
                control={control}
                name="employee_code_include_club_id"
                label={<FormLabel>Sisipkan Kode Cabang</FormLabel>}
                description="Membuat nomor urut berjalan terpisah di setiap cabang sehingga kode karyawan tidak bentrok antar cabang."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-sm">
                  Contoh format kode karyawan
                </p>
                <p className="text-foreground font-mono text-lg font-semibold">
                  {employeeCodePreview}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Nomor urut sebenarnya melanjutkan karyawan yang sudah
                  terdaftar. Perubahan hanya berlaku untuk karyawan baru.
                </p>
              </div>

              {isMainClub ? (
                <FormFieldItem
                  control={control}
                  name="employee_apply_to_all_branch"
                  label={<FormLabel>Terapkan ke Seluruh Cabang</FormLabel>}
                  description="Saat disimpan, format kode karyawan di halaman ini akan menimpa pengaturan di setiap cabang."
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              ) : null}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              <Save className="mr-1 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </form>
      </Form>
    </EmployeeLayout>
  )
}

export default EmployeeSettingPage
