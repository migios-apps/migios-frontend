import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { TransferAllowedPackageType } from "@/services/api/@types/settings/settings"
import { apiUpdateSettings } from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import OthersSettingLayout from "../Layout"

const validationSchema = yup.object().shape({
  transfer_enabled: yup.boolean().default(false),
  transfer_fee_type: yup
    .string()
    .oneOf(["none", "flat"] as const)
    .default("none")
    .required(),
  transfer_fee_amount: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0, "Biaya tidak boleh negatif")
    .default(0)
    .required(),
  transfer_fee_basis: yup
    .string()
    .oneOf(["per_transfer", "per_package"] as const)
    .default("per_transfer")
    .required(),
  transfer_max_chain_length: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .max(10, "Maksimal 10")
    .default(1)
    .required(),
  transfer_min_remaining_days: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .default(0)
    .required(),
  transfer_allowed_package_types: yup
    .array()
    .of(yup.string().oneOf(["membership", "pt_program", "class"]).required())
    .min(1, "Pilih minimal satu jenis paket")
    .default(["membership", "class"]),
  transfer_void_window_hours: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .max(720, "Maksimal 720 jam (30 hari)")
    .default(24)
    .required(),
})

type TransferSettingsFormSchema = yup.InferType<typeof validationSchema>

const INITIAL_SETTINGS: TransferSettingsFormSchema = {
  transfer_enabled: false,
  transfer_fee_type: "none",
  transfer_fee_amount: 0,
  transfer_fee_basis: "per_transfer",
  transfer_max_chain_length: 1,
  transfer_min_remaining_days: 0,
  transfer_allowed_package_types: ["membership", "class"],
  transfer_void_window_hours: 24,
}

const PACKAGE_TYPE_OPTIONS: {
  value: TransferAllowedPackageType
  label: string
  description: string
}[] = [
  {
    value: "membership",
    label: "Membership",
    description: "Akses gym umum. Paling sederhana dipindahkan.",
  },
  {
    value: "class",
    label: "Kelas",
    description:
      "Jadwal kelas tidak berubah — penerima hadir di kelas dan jam yang sama.",
  },
  {
    value: "pt_program",
    label: "PT Program",
    description:
      "Jadwal latihan ikut berpindah ke penerima. Trainer perlu diberi tahu karena orang yang datang berbeda.",
  },
]

const FEE_BASIS_OPTIONS = [
  {
    value: "per_transfer",
    label: "Sekali per transfer",
    description: "Biaya dihitung satu kali, berapa pun jumlah paketnya.",
  },
  {
    value: "per_package",
    label: "Per paket",
    description: "Biaya dikalikan jumlah paket yang dipindahkan.",
  },
]

const TransferSetting = () => {
  const queryClient = useQueryClient()
  const { settings: settingsData, isLoading: isLoadingSettings } = useSettings()

  const formProps = useForm<TransferSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, reset } = formProps
  const watchData = watch()

  useEffect(() => {
    if (settingsData) {
      reset({
        transfer_enabled: Number(settingsData.transfer_enabled ?? 0) === 1,
        transfer_fee_type:
          settingsData.transfer_fee_type ?? INITIAL_SETTINGS.transfer_fee_type,
        transfer_fee_amount: Number(settingsData.transfer_fee_amount ?? 0),
        transfer_fee_basis:
          settingsData.transfer_fee_basis ??
          INITIAL_SETTINGS.transfer_fee_basis,
        transfer_max_chain_length:
          settingsData.transfer_max_chain_length ??
          INITIAL_SETTINGS.transfer_max_chain_length,
        transfer_min_remaining_days:
          settingsData.transfer_min_remaining_days ??
          INITIAL_SETTINGS.transfer_min_remaining_days,
        transfer_allowed_package_types:
          settingsData.transfer_allowed_package_types ??
          INITIAL_SETTINGS.transfer_allowed_package_types,
        transfer_void_window_hours:
          settingsData.transfer_void_window_hours ??
          INITIAL_SETTINGS.transfer_void_window_hours,
      })
    }
  }, [settingsData, reset])

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: (values: TransferSettingsFormSchema) =>
      apiUpdateSettings({
        transfer_enabled: values.transfer_enabled ? 1 : 0,
        transfer_fee_type: values.transfer_fee_type,
        transfer_fee_amount: values.transfer_fee_amount,
        transfer_fee_basis: values.transfer_fee_basis,
        transfer_max_chain_length: values.transfer_max_chain_length,
        transfer_min_remaining_days: values.transfer_min_remaining_days,
        transfer_allowed_package_types:
          values.transfer_allowed_package_types as TransferAllowedPackageType[],
        transfer_void_window_hours: values.transfer_void_window_hours,
      }),
    onSuccess: () => {
      toast.success("Pengaturan transfer disimpan")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
    },
  })

  const isFlat = watchData.transfer_fee_type === "flat"
  const feePreview =
    watchData.transfer_fee_basis === "per_package"
      ? (watchData.transfer_fee_amount ?? 0) * 3
      : (watchData.transfer_fee_amount ?? 0)

  if (isLoadingSettings) {
    return (
      <OthersSettingLayout>
        <div className="space-y-4 p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </OthersSettingLayout>
    )
  }

  return (
    <OthersSettingLayout>
      <Form {...formProps}>
        <form
          onSubmit={handleSubmit((values) => saveSettings(values))}
          className="space-y-4 p-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Transfer Kepemilikan Paket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldItem
                control={control}
                name="transfer_enabled"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Izinkan Transfer Paket</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Member bisa menyerahkan sisa paketnya ke member lain.
                        Menu Transfer Member di Penjualan hanya muncul saat ini
                        aktif.
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              {watchData.transfer_enabled ? (
                <FormFieldItem
                  control={control}
                  name="transfer_allowed_package_types"
                  label={
                    <FormLabel>Jenis Paket yang Boleh Ditransfer</FormLabel>
                  }
                  render={({ field }) => (
                    <div className="space-y-2">
                      {PACKAGE_TYPE_OPTIONS.map((option) => {
                        const checked = (field.value ?? []).includes(
                          option.value
                        )
                        return (
                          <label
                            key={option.value}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-lg border p-3",
                              checked && "border-primary bg-primary/5"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const current = field.value ?? []
                                field.onChange(
                                  value
                                    ? [...current, option.value]
                                    : current.filter(
                                        (item) => item !== option.value
                                      )
                                )
                              }}
                            />
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">
                                {option.label}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {option.description}
                              </p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              ) : null}
            </CardContent>
          </Card>

          {watchData.transfer_enabled ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Biaya Transfer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldItem
                    control={control}
                    name="transfer_fee_type"
                    label={<FormLabel>Jenis Biaya</FormLabel>}
                    render={({ field }) => (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          {
                            value: "none",
                            label: "Gratis",
                            description: "Tidak ada biaya transfer.",
                          },
                          {
                            value: "flat",
                            label: "Nominal tetap",
                            description:
                              "Biaya administrasi tetap, berapa pun nilai paketnya.",
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "flex cursor-pointer flex-col gap-1 rounded-lg border p-3",
                              field.value === option.value &&
                                "border-primary bg-primary/5"
                            )}
                          >
                            <input
                              type="radio"
                              className="sr-only"
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                            />
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {option.description}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />

                  {isFlat ? (
                    <>
                      <FormFieldItem
                        control={control}
                        name="transfer_fee_amount"
                        label={<FormLabel>Nominal Biaya</FormLabel>}
                        description="Patokan yang wajar: 25–50% dari satu bulan langganan tipikal. Di atas satu bulan penuh, biayanya mulai menekan member untuk tidak transfer — dan paket yang hangus tidak menguntungkan siapa pun."
                        render={({ field }) => (
                          <InputCurrency
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        )}
                      />

                      <FormFieldItem
                        control={control}
                        name="transfer_fee_basis"
                        label={<FormLabel>Dasar Perhitungan</FormLabel>}
                        render={({ field }) => (
                          <div className="space-y-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                              {FEE_BASIS_OPTIONS.map((option) => (
                                <label
                                  key={option.value}
                                  className={cn(
                                    "flex cursor-pointer flex-col gap-1 rounded-lg border p-3",
                                    field.value === option.value &&
                                      "border-primary bg-primary/5"
                                  )}
                                >
                                  <input
                                    type="radio"
                                    className="sr-only"
                                    checked={field.value === option.value}
                                    onChange={() =>
                                      field.onChange(option.value)
                                    }
                                  />
                                  <span className="text-sm font-medium">
                                    {option.label}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {option.description}
                                  </span>
                                </label>
                              ))}
                            </div>
                            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-xs">
                              Contoh: member memindahkan{" "}
                              <span className="font-medium">3 paket</span>{" "}
                              sekaligus → total biaya{" "}
                              <span className="text-foreground font-semibold">
                                Rp {feePreview.toLocaleString("id-ID")}
                              </span>
                            </p>
                          </div>
                        )}
                      />
                    </>
                  ) : null}

                  <p className="text-muted-foreground bg-muted/50 rounded-md p-3 text-xs">
                    Biaya transfer tercatat sebagai pendapatan dan muncul di
                    Laporan Penjualan dengan kategori tersendiri{" "}
                    <span className="text-foreground font-medium">
                      &ldquo;Transfer&rdquo;
                    </span>
                    , sehingga bisa dilacak terpisah dari penjualan paket.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pembatas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldItem
                    control={control}
                    name="transfer_max_chain_length"
                    label={<FormLabel>Maksimal Transfer per Paket</FormLabel>}
                    description="0 = tanpa batas. Nilai 1 berarti satu paket hanya bisa dioper sekali seumur hidup — ini pembatas yang paling menentukan. Biaya masih bisa dibayar berulang kali; batas ini tidak."
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="transfer_min_remaining_days"
                    label={
                      <FormLabel>Minimal Sisa Masa Berlaku (hari)</FormLabel>
                    }
                    description="0 = tanpa batas. Mencegah transfer paket yang tinggal beberapa hari, sekaligus menjaga biaya tetap wajar dibanding nilai yang dipindahkan."
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="transfer_void_window_hours"
                    label={<FormLabel>Batas Waktu Pembatalan (jam)</FormLabel>}
                    description="0 = transfer tidak bisa dibatalkan. Pembatalan hanya mungkin selama penerima belum check-in atau memakai sesi; setelah itu koreksinya lewat transfer balik."
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={720}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />
                </CardContent>
              </Card>
            </>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !formState.isDirty}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </OthersSettingLayout>
  )
}

export default TransferSetting
