import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiUpdateSettings } from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { AlertCircle, Save } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Loading from "@/components/ui/loading"
import { Switch } from "@/components/ui/switch"
import LayoutOtherSetting from "../Layout"

const validationSchema = yup.object().shape({
  voucher_enabled: yup.boolean().default(false),
  voucher_stack_with_loyalty: yup.boolean().default(false),
  voucher_max_per_transaction: yup
    .number()
    .transform((_, originalValue) =>
      originalValue === "" || originalValue === null
        ? undefined
        : Number(originalValue)
    )
    .when("voucher_enabled", {
      is: true,
      then: (schema) =>
        schema
          .required("Maksimal voucher per transaksi harus diisi")
          .min(1, "Minimal 1 voucher per transaksi"),
      otherwise: (schema) => schema.optional().nullable().default(1),
    }),
})

type VoucherSettingsFormSchema = yup.InferType<typeof validationSchema>

const INITIAL_SETTINGS: VoucherSettingsFormSchema = {
  voucher_enabled: false,
  voucher_stack_with_loyalty: false,
  voucher_max_per_transaction: 1,
}

const VoucherSettingsPage = () => {
  const queryClient = useQueryClient()

  const { settings: settingsData, isLoading: isLoadingSettings } = useSettings()

  const formProps = useForm<VoucherSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, reset } = formProps
  const watchData = watch()

  useEffect(() => {
    if (settingsData) {
      reset({
        voucher_enabled: Number(settingsData.voucher_enabled ?? 0) === 1,
        voucher_stack_with_loyalty:
          settingsData.voucher_stack_with_loyalty ?? false,
        voucher_max_per_transaction:
          settingsData.voucher_max_per_transaction ?? 1,
      })
    }
  }, [settingsData, reset])

  const updateSettingsMutation = useMutation({
    mutationFn: (data: VoucherSettingsFormSchema) =>
      apiUpdateSettings({
        voucher_enabled: data.voucher_enabled ? 1 : 0,
        voucher_stack_with_loyalty: data.voucher_stack_with_loyalty,
        voucher_max_per_transaction: data.voucher_max_per_transaction ?? 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
      toast.success("Pengaturan voucher berhasil disimpan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal menyimpan pengaturan voucher"
      )
    },
  })

  const handleSave = async (data: VoucherSettingsFormSchema) => {
    updateSettingsMutation.mutate(data)
  }

  if (isLoadingSettings) {
    return (
      <LayoutOtherSetting>
        <div className="flex h-64 items-center justify-center">
          <Loading loading />
        </div>
      </LayoutOtherSetting>
    )
  }

  return (
    <LayoutOtherSetting>
      <Form {...formProps}>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voucher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                control={control}
                name="voucher_enabled"
                label={<FormLabel>Aktifkan Voucher</FormLabel>}
                description="Saat nonaktif, voucher tidak dapat dipakai pada transaksi."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="voucher_stack_with_loyalty"
                label={
                  <FormLabel>Boleh Digabung dengan Poin Loyalty</FormLabel>
                }
                description="Saat nonaktif, transaksi yang menukar poin loyalty tidak dapat memakai voucher. Pengaturan ini sama dengan yang ada di tab Poin Loyalitas."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              {watchData.voucher_enabled ? (
                <>
                  <FormFieldItem
                    control={control}
                    name="voucher_max_per_transaction"
                    label={
                      <FormLabel>Maksimal Voucher per Transaksi</FormLabel>
                    }
                    invalid={Boolean(
                      formState.errors.voucher_max_per_transaction
                    )}
                    errorMessage={
                      formState.errors.voucher_max_per_transaction?.message
                    }
                    description="Berapa banyak voucher yang boleh dipakai dalam satu transaksi."
                    render={({ field }) => (
                      <Input
                        type="number"
                        autoComplete="off"
                        placeholder="1"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                      />
                    )}
                  />

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Voucher, kuota, masa berlaku, dan cakupan paket atau
                      produknya diatur di menu Master Voucher. Pengaturan di
                      sini hanya kebijakan yang berlaku untuk seluruh transaksi
                      club.
                    </AlertDescription>
                  </Alert>
                </>
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
    </LayoutOtherSetting>
  )
}

export default VoucherSettingsPage
