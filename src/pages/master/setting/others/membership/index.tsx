import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { apiGetUserClubList } from "@/services/api/ClubService"
import { apiUpdateSettings } from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { AlertCircle, Save } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { useSettings } from "@/hooks/use-settings"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Loading from "@/components/ui/loading"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import LayoutOtherSetting from "../Layout"

const validationSchema = yup.object().shape({
  membership_cross_club_access: yup
    .string()
    .oneOf(["own_club", "selected_clubs", "all_clubs"] as const)
    .default("own_club")
    .required(),
  membership_cross_club_ids: yup
    .array()
    .of(yup.number().required())
    .default([])
    .when("membership_cross_club_access", {
      is: "selected_clubs",
      then: (schema) => schema.min(1, "Pilih minimal satu cabang"),
      otherwise: (schema) => schema,
    }),
  membership_apply_to_all_branch: yup.boolean().default(false),
  membership_activation_mode: yup
    .string()
    .oneOf(["on_purchase", "on_first_checkin"] as const)
    .default("on_purchase")
    .required(),
  membership_first_checkin_deadline_days: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(7)
    .min(1, "Minimal 1 hari")
    .max(90, "Maksimal 90 hari"),
  membership_grace_period_days: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(0)
    .min(0, "Tidak boleh negatif")
    .max(30, "Maksimal 30 hari"),
  freeze_enabled: yup.boolean().default(true),
  freeze_require_approval: yup.boolean().default(true),
  freeze_extend_end_date: yup.boolean().default(true),
  freeze_min_days: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(7)
    .min(1, "Minimal 1 hari"),
  freeze_max_days_per_request: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(30)
    .min(1, "Minimal 1 hari")
    .test(
      "gte-min",
      "Tidak boleh lebih kecil dari minimal durasi",
      (value, ctx) => (value ?? 0) >= (ctx.parent.freeze_min_days ?? 0)
    ),
  freeze_max_days_per_year: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(90)
    .min(0, "Tidak boleh negatif"),
  freeze_max_request_per_year: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(2)
    .min(0, "Tidak boleh negatif"),
  checkin_max_per_day: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(0)
    .min(0, "Tidak boleh negatif"),
  checkin_block_when_expired: yup.boolean().default(true),
  checkin_auto_checkout_hours: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(0)
    .min(0, "Tidak boleh negatif")
    .max(24, "Maksimal 24 jam"),
  require_session_approval: yup.boolean().default(true),
  member_code_prefix: yup
    .string()
    .default("MBR")
    .trim()
    .required("Prefix harus diisi")
    .matches(/^[A-Z0-9]+$/, "Hanya huruf kapital dan angka")
    .max(6, "Maksimal 6 karakter"),
  member_code_include_club_id: yup.boolean().default(true),
  member_code_sequence_length: yup
    .number()
    .transform((_, original) =>
      original === "" || original === null ? undefined : Number(original)
    )
    .default(5)
    .required("Panjang nomor urut harus diisi")
    .min(5, "Minimal 5 digit")
    .max(10, "Maksimal 10 digit"),
})

type MembershipSettingsFormSchema = yup.InferType<typeof validationSchema>

const MEMBER_CODE_CLUB_SEGMENT_LENGTH = 5

const INITIAL_SETTINGS: MembershipSettingsFormSchema = {
  membership_cross_club_access: "own_club",
  membership_cross_club_ids: [],
  membership_apply_to_all_branch: false,
  membership_activation_mode: "on_purchase",
  membership_first_checkin_deadline_days: 7,
  membership_grace_period_days: 0,
  freeze_enabled: true,
  freeze_require_approval: true,
  freeze_extend_end_date: true,
  freeze_min_days: 7,
  freeze_max_days_per_request: 30,
  freeze_max_days_per_year: 90,
  freeze_max_request_per_year: 2,
  checkin_max_per_day: 0,
  checkin_block_when_expired: true,
  checkin_auto_checkout_hours: 0,
  require_session_approval: true,
  member_code_prefix: "MBR",
  member_code_include_club_id: true,
  member_code_sequence_length: 5,
}

const CROSS_CLUB_OPTIONS = [
  {
    value: "own_club",
    label: "Hanya cabang asal",
    description:
      "Member hanya bisa check-in di cabang tempat dia terdaftar. Cocok untuk cabang yang berdiri sendiri.",
  },
  {
    value: "selected_clubs",
    label: "Cabang tertentu",
    description:
      "Member bisa check-in di cabang asal dan cabang yang dipilih di bawah. Cocok untuk kluster area.",
  },
  {
    value: "all_clubs",
    label: "Semua cabang",
    description: "Member bisa check-in di seluruh cabang dalam satu grup gym.",
  },
] as const

const ACTIVATION_OPTIONS = [
  {
    value: "on_purchase",
    label: "Saat transaksi dibayar",
    description:
      "Masa berlaku paket langsung berjalan sejak tanggal pembelian.",
  },
  {
    value: "on_first_checkin",
    label: "Saat check-in pertama",
    description:
      "Masa berlaku baru berjalan saat member pertama kali datang ke gym.",
  },
] as const

const MembershipSetting = () => {
  const queryClient = useQueryClient()
  const { club } = useAuth()

  const { settings: settingsData, isLoading: isLoadingSettings } = useSettings()

  const { data: clubList } = useQuery({
    queryKey: [QUERY_KEY.clubs, "membership-setting"],
    queryFn: () => apiGetUserClubList({ page: 1, per_page: 100 }),
    select: (res) => res.data.data,
  })

  const otherClubs = useMemo(
    () => (clubList ?? []).filter((item) => item.id !== club?.id),
    [clubList, club?.id]
  )

  const isMainClub = club?.club_type === "main"

  const formProps = useForm<MembershipSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, reset } = formProps
  const watchData = watch()

  useEffect(() => {
    if (settingsData) {
      reset({
        ...INITIAL_SETTINGS,
        membership_cross_club_access:
          settingsData.membership_cross_club_access ??
          INITIAL_SETTINGS.membership_cross_club_access,
        membership_cross_club_ids: settingsData.membership_cross_club_ids ?? [],
        membership_activation_mode:
          settingsData.membership_activation_mode ??
          INITIAL_SETTINGS.membership_activation_mode,
        membership_first_checkin_deadline_days:
          settingsData.membership_first_checkin_deadline_days ??
          INITIAL_SETTINGS.membership_first_checkin_deadline_days,
        membership_grace_period_days:
          settingsData.membership_grace_period_days ??
          INITIAL_SETTINGS.membership_grace_period_days,
        freeze_enabled: Number(settingsData.freeze_enabled ?? 1) === 1,
        freeze_require_approval:
          settingsData.freeze_require_approval ??
          INITIAL_SETTINGS.freeze_require_approval,
        freeze_extend_end_date:
          settingsData.freeze_extend_end_date ??
          INITIAL_SETTINGS.freeze_extend_end_date,
        freeze_min_days:
          settingsData.freeze_min_days ?? INITIAL_SETTINGS.freeze_min_days,
        freeze_max_days_per_request:
          settingsData.freeze_max_days_per_request ??
          INITIAL_SETTINGS.freeze_max_days_per_request,
        freeze_max_days_per_year:
          settingsData.freeze_max_days_per_year ??
          INITIAL_SETTINGS.freeze_max_days_per_year,
        freeze_max_request_per_year:
          settingsData.freeze_max_request_per_year ??
          INITIAL_SETTINGS.freeze_max_request_per_year,
        checkin_max_per_day:
          settingsData.checkin_max_per_day ??
          INITIAL_SETTINGS.checkin_max_per_day,
        checkin_block_when_expired:
          settingsData.checkin_block_when_expired ??
          INITIAL_SETTINGS.checkin_block_when_expired,
        checkin_auto_checkout_hours:
          settingsData.checkin_auto_checkout_hours ??
          INITIAL_SETTINGS.checkin_auto_checkout_hours,
        require_session_approval:
          Number(settingsData.require_session_approval ?? 1) === 1,
        member_code_prefix:
          settingsData.member_code_prefix ??
          INITIAL_SETTINGS.member_code_prefix,
        member_code_include_club_id:
          settingsData.member_code_include_club_id ??
          INITIAL_SETTINGS.member_code_include_club_id,
        member_code_sequence_length:
          settingsData.member_code_sequence_length ??
          INITIAL_SETTINGS.member_code_sequence_length,
      })
    }
  }, [settingsData, reset])

  const updateSettingsMutation = useMutation({
    mutationFn: (data: MembershipSettingsFormSchema) =>
      apiUpdateSettings({
        membership_cross_club_access: data.membership_cross_club_access,
        membership_cross_club_ids:
          data.membership_cross_club_access === "selected_clubs"
            ? data.membership_cross_club_ids
            : [],
        membership_apply_to_all_branch: data.membership_apply_to_all_branch,
        membership_activation_mode: data.membership_activation_mode,
        membership_first_checkin_deadline_days:
          data.membership_first_checkin_deadline_days,
        membership_grace_period_days: data.membership_grace_period_days,
        freeze_enabled: data.freeze_enabled ? 1 : 0,
        freeze_require_approval: data.freeze_require_approval,
        freeze_extend_end_date: data.freeze_extend_end_date,
        freeze_min_days: data.freeze_min_days,
        freeze_max_days_per_request: data.freeze_max_days_per_request,
        freeze_max_days_per_year: data.freeze_max_days_per_year,
        freeze_max_request_per_year: data.freeze_max_request_per_year,
        checkin_max_per_day: data.checkin_max_per_day,
        checkin_block_when_expired: data.checkin_block_when_expired,
        checkin_auto_checkout_hours: data.checkin_auto_checkout_hours,
        require_session_approval: data.require_session_approval ? 1 : 0,
        member_code_prefix: data.member_code_prefix,
        member_code_include_club_id: data.member_code_include_club_id,
        member_code_sequence_length: data.member_code_sequence_length,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
      toast.success("Pengaturan keanggotaan berhasil disimpan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal menyimpan pengaturan keanggotaan"
      )
    },
  })

  const handleSave = (data: MembershipSettingsFormSchema) => {
    updateSettingsMutation.mutate(data)
  }

  const memberCodePreview = [
    watchData.member_code_prefix || "MBR",
    watchData.member_code_include_club_id
      ? String(club?.id ?? 1).padStart(MEMBER_CODE_CLUB_SEGMENT_LENGTH, "0")
      : "",
    "1".padStart(watchData.member_code_sequence_length || 5, "0"),
  ].join("")

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
        <form
          onSubmit={handleSubmit(handleSave)}
          className="mx-auto max-w-3xl space-y-4"
        >
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">Pengaturan Keanggotaan</h1>
              <Badge variant={isMainClub ? "default" : "secondary"}>
                {isMainClub ? "Gym Pusat" : "Cabang"}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Kebijakan keanggotaan untuk {club?.name ?? "club ini"}. Hak akses
              per paket (durasi, sesi, kelas, trainer) tetap diatur di menu
              Master Paket.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Akses Antar Cabang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                control={control}
                name="membership_cross_club_access"
                label={<FormLabel>Cakupan Check-in Member</FormLabel>}
                invalid={Boolean(formState.errors.membership_cross_club_access)}
                errorMessage={
                  formState.errors.membership_cross_club_access?.message
                }
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-3"
                  >
                    {CROSS_CLUB_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="border-border flex items-start gap-3 rounded-lg border p-3"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`cross-club-${option.value}`}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor={`cross-club-${option.value}`}
                            className="font-medium"
                          >
                            {option.label}
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />

              {watchData.membership_cross_club_access === "selected_clubs" ? (
                <FormFieldItem
                  control={control}
                  name="membership_cross_club_ids"
                  label={<FormLabel>Cabang yang Bisa Diakses</FormLabel>}
                  invalid={Boolean(formState.errors.membership_cross_club_ids)}
                  errorMessage={
                    formState.errors.membership_cross_club_ids?.message
                  }
                  description="Kehadiran tetap tercatat di cabang tempat member melakukan check-in."
                  render={({ field }) => (
                    <div className="border-border divide-border divide-y rounded-lg border">
                      {otherClubs.length === 0 ? (
                        <p className="text-muted-foreground p-3 text-sm">
                          Belum ada cabang lain pada grup gym ini.
                        </p>
                      ) : (
                        otherClubs.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3"
                          >
                            <Checkbox
                              id={`club-${item.id}`}
                              checked={(field.value ?? []).includes(item.id!)}
                              onCheckedChange={(checked) => {
                                const current = field.value ?? []
                                field.onChange(
                                  checked
                                    ? [...current, item.id!]
                                    : current.filter((id) => id !== item.id)
                                )
                              }}
                            />
                            <Label
                              htmlFor={`club-${item.id}`}
                              className="flex-1 font-normal"
                            >
                              {item.name}
                              <span className="text-muted-foreground ml-2 text-xs">
                                {item.city}
                              </span>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                />
              ) : null}

              {isMainClub ? (
                <FormFieldItem
                  control={control}
                  name="membership_apply_to_all_branch"
                  label={<FormLabel>Terapkan ke Seluruh Cabang</FormLabel>}
                  description="Saat disimpan, seluruh pengaturan keanggotaan di halaman ini akan menimpa pengaturan di setiap cabang."
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

          <Card>
            <CardHeader>
              <CardTitle>Aktivasi & Masa Berlaku Paket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                control={control}
                name="membership_activation_mode"
                label={<FormLabel>Mulai Masa Berlaku</FormLabel>}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="gap-3"
                  >
                    {ACTIVATION_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="border-border flex items-start gap-3 rounded-lg border p-3"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`activation-${option.value}`}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor={`activation-${option.value}`}
                            className="font-medium"
                          >
                            {option.label}
                          </Label>
                          <p className="text-muted-foreground text-sm">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />

              {watchData.membership_activation_mode === "on_first_checkin" ? (
                <FormFieldItem
                  control={control}
                  name="membership_first_checkin_deadline_days"
                  label={<FormLabel>Batas Tunggu Aktivasi (hari)</FormLabel>}
                  invalid={Boolean(
                    formState.errors.membership_first_checkin_deadline_days
                  )}
                  errorMessage={
                    formState.errors.membership_first_checkin_deadline_days
                      ?.message
                  }
                  description="Jika member belum juga datang setelah sekian hari sejak pembelian, paket tetap diaktifkan otomatis."
                  render={({ field }) => (
                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="7"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  )}
                />
              ) : null}

              <FormFieldItem
                control={control}
                name="membership_grace_period_days"
                label={<FormLabel>Masa Tenggang Setelah Berakhir</FormLabel>}
                invalid={Boolean(formState.errors.membership_grace_period_days)}
                errorMessage={
                  formState.errors.membership_grace_period_days?.message
                }
                description="Berapa hari member masih boleh check-in setelah paket habis sebelum statusnya menjadi expired. Isi 0 untuk langsung expired."
                render={({ field }) => (
                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kebijakan Freeze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                control={control}
                name="freeze_enabled"
                label={<FormLabel>Izinkan Freeze Membership</FormLabel>}
                description="Saat nonaktif, pengajuan freeze tidak bisa dibuat dari kasir maupun detail member."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              {watchData.freeze_enabled ? (
                <>
                  <FormFieldItem
                    control={control}
                    name="freeze_require_approval"
                    label={<FormLabel>Perlu Persetujuan Staff</FormLabel>}
                    description="Pengajuan freeze masuk sebagai pending dan baru aktif setelah disetujui."
                    render={({ field }) => (
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />

                  <FormFieldItem
                    control={control}
                    name="freeze_extend_end_date"
                    label={<FormLabel>Perpanjang Masa Berlaku Paket</FormLabel>}
                    description="Durasi freeze ditambahkan ke tanggal berakhir paket member."
                    render={({ field }) => (
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormFieldItem
                      control={control}
                      name="freeze_min_days"
                      label={<FormLabel>Minimal Durasi (hari)</FormLabel>}
                      invalid={Boolean(formState.errors.freeze_min_days)}
                      errorMessage={formState.errors.freeze_min_days?.message}
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="7"
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

                    <FormFieldItem
                      control={control}
                      name="freeze_max_days_per_request"
                      label={
                        <FormLabel>Maksimal Durasi per Pengajuan</FormLabel>
                      }
                      invalid={Boolean(
                        formState.errors.freeze_max_days_per_request
                      )}
                      errorMessage={
                        formState.errors.freeze_max_days_per_request?.message
                      }
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="30"
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

                    <FormFieldItem
                      control={control}
                      name="freeze_max_days_per_year"
                      label={<FormLabel>Kuota Hari per Tahun</FormLabel>}
                      invalid={Boolean(
                        formState.errors.freeze_max_days_per_year
                      )}
                      errorMessage={
                        formState.errors.freeze_max_days_per_year?.message
                      }
                      description="Isi 0 untuk tanpa batas."
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="90"
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

                    <FormFieldItem
                      control={control}
                      name="freeze_max_request_per_year"
                      label={<FormLabel>Kuota Pengajuan per Tahun</FormLabel>}
                      invalid={Boolean(
                        formState.errors.freeze_max_request_per_year
                      )}
                      errorMessage={
                        formState.errors.freeze_max_request_per_year?.message
                      }
                      description="Isi 0 untuk tanpa batas."
                      render={({ field }) => (
                        <Input
                          type="number"
                          autoComplete="off"
                          placeholder="2"
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
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Biaya freeze tetap ditagihkan lewat transaksi di kasir.
                      Pengaturan di sini hanya membatasi durasi dan kuotanya.
                    </AlertDescription>
                  </Alert>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kebijakan Check-in & Sesi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormFieldItem
                control={control}
                name="checkin_max_per_day"
                label={<FormLabel>Maksimal Check-in per Hari</FormLabel>}
                invalid={Boolean(formState.errors.checkin_max_per_day)}
                errorMessage={formState.errors.checkin_max_per_day?.message}
                description="Berlaku per member per cabang. Isi 0 untuk tanpa batas. Member tetap harus check-out sebelum bisa check-in lagi."
                render={({ field }) => (
                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="checkin_auto_checkout_hours"
                label={<FormLabel>Auto Check-out Setelah (jam)</FormLabel>}
                invalid={Boolean(formState.errors.checkin_auto_checkout_hours)}
                errorMessage={
                  formState.errors.checkin_auto_checkout_hours?.message
                }
                description="Member yang lupa check-out akan ditutup otomatis. Isi 0 untuk menonaktifkan."
                render={({ field }) => (
                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="checkin_block_when_expired"
                label={<FormLabel>Blokir Check-in Paket Expired</FormLabel>}
                description="Saat nonaktif, member dengan paket habis tetap bisa dicatat kehadirannya untuk keperluan perpanjangan di meja depan."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="require_session_approval"
                label={<FormLabel>Persetujuan Pemotongan Sesi</FormLabel>}
                description="Pemotongan sesi personal trainer perlu dikonfirmasi member sebelum dihitung terpakai."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Penomoran Kode Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormFieldItem
                  control={control}
                  name="member_code_prefix"
                  label={<FormLabel>Prefix</FormLabel>}
                  invalid={Boolean(formState.errors.member_code_prefix)}
                  errorMessage={formState.errors.member_code_prefix?.message}
                  render={({ field }) => (
                    <Input
                      autoComplete="off"
                      placeholder="MBR"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  )}
                />

                <FormFieldItem
                  control={control}
                  name="member_code_sequence_length"
                  label={<FormLabel>Panjang Nomor Urut</FormLabel>}
                  invalid={Boolean(
                    formState.errors.member_code_sequence_length
                  )}
                  errorMessage={
                    formState.errors.member_code_sequence_length?.message
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
                name="member_code_include_club_id"
                label={<FormLabel>Sisipkan Kode Cabang</FormLabel>}
                description="Membuat nomor urut berjalan terpisah di setiap cabang sehingga kode member tidak bentrok antar cabang."
                render={({ field }) => (
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <div className="bg-muted rounded-lg p-3">
                <p className="text-muted-foreground text-sm">
                  Contoh format kode member
                </p>
                <p className="text-foreground font-mono text-lg font-semibold">
                  {memberCodePreview}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Nomor urut sebenarnya melanjutkan member yang sudah terdaftar.
                  Perubahan hanya berlaku untuk member baru.
                </p>
              </div>
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

export default MembershipSetting
