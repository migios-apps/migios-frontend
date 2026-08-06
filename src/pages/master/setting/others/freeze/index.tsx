import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { FreezeFeeType } from "@/services/api/@types/settings/settings"
import { apiUpdateSettings } from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { Lock1 } from "iconsax-reactjs"
import { toast } from "sonner"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import OthersSettingLayout from "../Layout"

const validationSchema = yup.object().shape({
  freeze_enabled: yup.boolean().default(true),
  freeze_require_approval: yup.boolean().default(true),
  freeze_extend_end_date: yup.boolean().default(true),
  freeze_min_advance_days: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .max(365, "Maksimal 365 hari")
    .default(3)
    .required(),
  freeze_max_days_per_month: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .max(31, "Maksimal 31 hari")
    .default(14)
    .required(),
  freeze_max_request_per_month: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0)
    .default(1)
    .required(),
  freeze_fee_type: yup
    .string()
    .oneOf(["none", "flat", "per_day"] as const)
    .default("none")
    .required(),
  freeze_fee_amount: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? 0 : Number(original)
    )
    .min(0, "Biaya tidak boleh negatif")
    .default(0)
    .required(),
})

type FreezeSettingsFormSchema = yup.InferType<typeof validationSchema>

const INITIAL_SETTINGS: FreezeSettingsFormSchema = {
  freeze_enabled: true,
  freeze_require_approval: true,
  freeze_extend_end_date: true,
  freeze_min_advance_days: 3,
  freeze_max_days_per_month: 14,
  freeze_max_request_per_month: 1,
  freeze_fee_type: "none",
  freeze_fee_amount: 0,
}

const FEE_TYPE_OPTIONS: {
  value: FreezeFeeType
  label: string
  description: string
}[] = [
  {
    value: "none",
    label: "Gratis",
    description: "Tidak ada biaya. Sama seperti perilaku sekarang.",
  },
  {
    value: "flat",
    label: "Nominal tetap",
    description: "Biaya administrasi sekali, berapa pun lamanya.",
  },
  {
    value: "per_day",
    label: "Per hari",
    description: "Dikali jumlah hari yang dibekukan.",
  },
]

const rupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`

const FreezeSetting = () => {
  const queryClient = useQueryClient()
  const { settings: settingsData, isLoading: isLoadingSettings } = useSettings()

  const formProps = useForm<FreezeSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, reset } = formProps
  const watchData = watch()

  useEffect(() => {
    if (settingsData) {
      reset({
        freeze_enabled: Number(settingsData.freeze_enabled ?? 1) === 1,
        freeze_require_approval:
          settingsData.freeze_require_approval ??
          INITIAL_SETTINGS.freeze_require_approval,
        freeze_extend_end_date:
          settingsData.freeze_extend_end_date ??
          INITIAL_SETTINGS.freeze_extend_end_date,
        freeze_fee_type:
          settingsData.freeze_fee_type ?? INITIAL_SETTINGS.freeze_fee_type,
        freeze_fee_amount:
          settingsData.freeze_fee_amount ?? INITIAL_SETTINGS.freeze_fee_amount,
        freeze_min_advance_days:
          settingsData.freeze_min_advance_days ??
          INITIAL_SETTINGS.freeze_min_advance_days,
        freeze_max_days_per_month:
          settingsData.freeze_max_days_per_month ??
          INITIAL_SETTINGS.freeze_max_days_per_month,
        freeze_max_request_per_month:
          settingsData.freeze_max_request_per_month ??
          INITIAL_SETTINGS.freeze_max_request_per_month,
      })
    }
  }, [settingsData, reset])

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: (values: FreezeSettingsFormSchema) =>
      apiUpdateSettings({
        freeze_enabled: values.freeze_enabled ? 1 : 0,
        freeze_require_approval: values.freeze_require_approval,
        freeze_extend_end_date: values.freeze_extend_end_date,
        freeze_fee_type: values.freeze_fee_type,
        freeze_fee_amount: Number(values.freeze_fee_amount) || 0,
        freeze_min_advance_days: Number(values.freeze_min_advance_days) || 0,
        freeze_max_days_per_month:
          Number(values.freeze_max_days_per_month) || 0,
        freeze_max_request_per_month:
          Number(values.freeze_max_request_per_month) || 0,
      }),
    onSuccess: () => {
      toast.success("Pengaturan freeze disimpan")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
    },
  })

  const feeType = (watchData.freeze_fee_type ?? "none") as FreezeFeeType
  const feeAmount = Number(watchData.freeze_fee_amount) || 0
  const advanceDays = Number(watchData.freeze_min_advance_days) || 0
  const daysPerMonth = Number(watchData.freeze_max_days_per_month) || 0
  const requestsPerMonth = Number(watchData.freeze_max_request_per_month) || 0

  const calculateFee = (durationDays: number) => {
    if (feeType === "none" || feeAmount <= 0) return 0
    if (feeType === "per_day") return feeAmount * durationDays
    return feeAmount
  }

  const isPriced = feeType !== "none"
  const feePreviewDays = Array.from(
    new Set([1, 7, daysPerMonth].filter((days) => days > 0))
  ).sort((a, b) => a - b)

  const policySummary = (() => {
    const kapan =
      advanceDays === 0
        ? "Member boleh mulai freeze hari itu juga"
        : `Member mengajukan paling lambat H-${advanceDays}`
    const hari =
      daysPerMonth === 0
        ? "tanpa batas hari"
        : `maksimal ${daysPerMonth} hari sebulan`
    const kali =
      requestsPerMonth === 0
        ? "berapa kali pun"
        : `paling banyak ${requestsPerMonth}× pengajuan sebulan`

    if (
      daysPerMonth > 0 &&
      requestsPerMonth > 0 &&
      daysPerMonth < requestsPerMonth
    ) {
      return `${kapan}, ${hari}, ${kali} — tapi ${requestsPerMonth}× pengajuan mustahil kalau jatahnya cuma ${daysPerMonth} hari.`
    }

    return `${kapan}, ${hari}, ${kali}.`
  })()

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
              <CardTitle>Freeze Membership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFieldItem
                control={control}
                name="freeze_enabled"
                render={({ field }) => (
                  <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Izinkan Freeze</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Member bisa menjeda masa aktif paketnya, misalnya karena
                        sakit atau dinas ke luar kota.
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              {watchData.freeze_enabled ? (
                <>
                  <FormFieldItem
                    control={control}
                    name="freeze_require_approval"
                    render={({ field }) => (
                      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel>Perlu Persetujuan</FormLabel>
                          <p className="text-muted-foreground text-sm">
                            Pengajuan masuk sebagai menunggu, bukan langsung
                            aktif. Matikan bila kasir boleh memutuskan sendiri
                            di depan meja.
                          </p>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="freeze_extend_end_date"
                    render={({ field }) => (
                      <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                        <div className="space-y-1">
                          <FormLabel>
                            Tambahkan Durasi ke Masa Berlaku
                          </FormLabel>
                          <p className="text-muted-foreground text-sm">
                            Hari yang dibekukan digeser ke tanggal berakhir
                            paket. Kalau dimatikan, member kehilangan hari
                            tersebut.
                          </p>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>

          {watchData.freeze_enabled ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Biaya Freeze</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldItem
                    control={control}
                    name="freeze_fee_type"
                    label={<FormLabel>Jenis Biaya</FormLabel>}
                    render={({ field }) => (
                      <div className="grid gap-2 sm:grid-cols-3">
                        {FEE_TYPE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors",
                              field.value === option.value
                                ? "border-primary bg-primary/5"
                                : "hover:bg-accent/40"
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

                  {isPriced ? (
                    <>
                      <FormFieldItem
                        control={control}
                        name="freeze_fee_amount"
                        label={
                          <FormLabel>
                            Nominal Biaya{" "}
                            <span className="text-muted-foreground text-xs font-normal">
                              {feeType === "per_day"
                                ? "(per hari)"
                                : "(sekali bayar)"}
                            </span>
                          </FormLabel>
                        }
                        description={
                          feeType === "per_day"
                            ? "Perhatikan totalnya untuk durasi maksimal — kalau melampaui harga paket bulanan, member akan memilih membiarkan paketnya hangus daripada membekukan."
                            : "Biaya administrasi sekali bayar, paling mudah dijelaskan ke member di depan meja."
                        }
                        render={({ field }) => (
                          <InputCurrency
                            value={field.value}
                            placeholder="0"
                            onValueChange={(_value, _name, values) =>
                              field.onChange(values?.float ?? 0)
                            }
                          />
                        )}
                      />

                      <div className="space-y-2 rounded-lg border border-dashed p-3">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Contoh perhitungan
                        </p>
                        <div className="space-y-1">
                          {feePreviewDays.map((preset) => (
                            <div
                              key={preset}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                Freeze {preset} hari
                                {preset === daysPerMonth
                                  ? " (jatah sebulan)"
                                  : ""}
                              </span>
                              <span className="font-medium tabular-nums">
                                {rupiah(calculateFee(preset))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      Dengan Gratis, freeze tetap membuat transaksi bernilai Rp
                      0 — jejaknya tetap tercatat di Penjualan, sama seperti
                      transfer gratis.
                    </p>
                  )}

                  <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
                    <Lock1
                      size={16}
                      variant="Bulk"
                      className="text-primary mt-px shrink-0"
                    />
                    <span>
                      Di layar kasir kolom biaya terkunci dan diisi hasil
                      hitungan ini. Nominal yang dikirim browser diabaikan
                      server.
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Batas Freeze</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormFieldItem
                    control={control}
                    name="freeze_min_advance_days"
                    label={
                      <FormLabel>Pengajuan Paling Lambat (H- hari)</FormLabel>
                    }
                    description={
                      advanceDays === 0
                        ? "0 = boleh mulai hari ini juga."
                        : `Member harus mengajukan minimal ${advanceDays} hari sebelum tanggal mulai freeze.`
                    }
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="freeze_max_days_per_month"
                    label={
                      <FormLabel>Maksimal Hari Freeze per Bulan</FormLabel>
                    }
                    description="Total hari yang boleh dibekukan dalam satu bulan berjalan. Isi 0 kalau tidak dibatasi."
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        max={31}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="freeze_max_request_per_month"
                    label={<FormLabel>Maksimal Pengajuan per Bulan</FormLabel>}
                    description="Berapa kali member boleh mengajukan dalam satu bulan. Isi 0 kalau tidak dibatasi."
                    render={({ field }) => (
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value ?? 0}
                      />
                    )}
                  />

                  <p className="bg-muted/50 rounded-md p-3 text-sm">
                    {policySummary}
                  </p>
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

export default FreezeSetting
