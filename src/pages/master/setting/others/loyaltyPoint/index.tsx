import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  apiGetSettings,
  apiUpdateSettings,
} from "@/services/api/settings/settings"
import { yupResolver } from "@hookform/resolvers/yup"
import { AlertCircle, Minus, Plus, Save } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import Loading from "@/components/ui/loading"
import { Select } from "@/components/ui/react-select"
import { Switch } from "@/components/ui/switch"
import LayoutOtherSetting from "../Layout"

const expiredTypeOptions = [
  { label: "Tidak kedaluwarsa", value: "forever" },
  { label: "Hari", value: "day" },
  { label: "Minggu", value: "week" },
  { label: "Bulan", value: "month" },
  { label: "Tahun", value: "year" },
]

const validationSchema = yup.object().shape({
  loyalty_earn_point_by_total_order: yup.boolean().default(false),
  loyalty_points_earned_by_total_order: yup
    .number()
    .when("loyalty_earn_point_by_total_order", {
      is: true,
      then: (schema) =>
        schema
          .required("Poin diperoleh harus diisi")
          .min(1, "Poin harus lebih besar atau sama dengan 1"),
      otherwise: (schema) => schema.optional().nullable().default(0),
    }),
  loyalty_min_total_order: yup
    .number()
    .when("loyalty_earn_point_by_total_order", {
      is: true,
      then: (schema) =>
        schema
          .required("Minimum total order harus diisi")
          .min(1, "Minimum total order harus lebih besar atau sama dengan 1"),
      otherwise: (schema) => schema.optional().nullable().default(0),
    }),
  loyalty_expired_type_by_total_order: yup
    .string()
    .when("loyalty_earn_point_by_total_order", {
      is: true,
      then: (schema) =>
        schema
          .oneOf(
            ["forever", "day", "week", "month", "year"],
            "Tipe expired tidak valid"
          )
          .required("Tipe expired harus diisi"),
      otherwise: (schema) => schema.optional().nullable().default("forever"),
    }),
  loyalty_expired_value_by_total_order: yup
    .number()
    .min(0, "Nilai expired harus lebih besar atau sama dengan 0")
    .when(
      [
        "loyalty_earn_point_by_total_order",
        "loyalty_expired_type_by_total_order",
      ],
      {
        is: (earnByTotalOrder: boolean, expiredType: string) =>
          earnByTotalOrder && expiredType !== "forever",
        then: (schema) =>
          schema
            .required("Nilai expired harus diisi")
            .min(1, "Nilai expired minimal 1"),
        otherwise: (schema) => schema.optional().nullable().default(0),
      }
    ),
  loyalty_earn_point_with_multiple: yup.boolean().default(false),
  loyalty_earn_points_when_using_points: yup.boolean().default(true),
})

type LoyaltyPointSettingsFormSchema = yup.InferType<typeof validationSchema>

const INITIAL_SETTINGS: LoyaltyPointSettingsFormSchema = {
  loyalty_earn_point_by_total_order: false,
  loyalty_points_earned_by_total_order: 0,
  loyalty_min_total_order: 0,
  loyalty_expired_type_by_total_order: "forever",
  loyalty_expired_value_by_total_order: 0,
  loyalty_earn_point_with_multiple: false,
  loyalty_earn_points_when_using_points: true,
}

const LoyaltyPointSettingsPage = () => {
  const queryClient = useQueryClient()

  // Fetch settings data
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: () => apiGetSettings(),
    select: (res) => res.data,
  })

  const formProps = useForm<LoyaltyPointSettingsFormSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: INITIAL_SETTINGS,
  })

  const { control, handleSubmit, watch, formState, setValue, reset } = formProps
  const watchData = watch()

  // Set form values when settings data is loaded
  useEffect(() => {
    if (settingsData) {
      reset({
        loyalty_earn_point_by_total_order:
          settingsData.loyalty_earn_point_by_total_order ?? false,
        loyalty_points_earned_by_total_order:
          settingsData.loyalty_points_earned_by_total_order ?? 0,
        loyalty_min_total_order: settingsData.loyalty_min_total_order ?? 0,
        loyalty_expired_type_by_total_order:
          (settingsData.loyalty_expired_type_by_total_order ?? "forever") as
            | "forever"
            | "day"
            | "week"
            | "month"
            | "year",
        loyalty_expired_value_by_total_order:
          settingsData.loyalty_expired_value_by_total_order ?? 0,
        loyalty_earn_point_with_multiple:
          settingsData.loyalty_earn_point_with_multiple ?? false,
        loyalty_earn_points_when_using_points:
          settingsData.loyalty_earn_points_when_using_points ?? true,
      })
    }
  }, [settingsData, reset])

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: LoyaltyPointSettingsFormSchema) =>
      apiUpdateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
      toast.success("Pengaturan loyalty point berhasil disimpan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal menyimpan pengaturan loyalty point"
      )
    },
  })

  const handleSave = async (data: LoyaltyPointSettingsFormSchema) => {
    updateSettingsMutation.mutate(data)
  }

  const handlePointsIncrement = () => {
    const currentValue = watchData.loyalty_points_earned_by_total_order || 0
    setValue("loyalty_points_earned_by_total_order", currentValue + 1)
  }

  const handlePointsDecrement = () => {
    const currentValue = watchData.loyalty_points_earned_by_total_order || 0
    if (currentValue > 0) {
      setValue("loyalty_points_earned_by_total_order", currentValue - 1)
    }
  }

  return (
    <LayoutOtherSetting>
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <Loading loading={isLoadingSettings}>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-semibold">
                  Pengaturan Loyalty Point
                </h4>
                <Button
                  type="submit"
                  disabled={
                    isLoadingSettings ||
                    updateSettingsMutation.isPending ||
                    formState.isSubmitting
                  }
                  className="min-w-[120px]"
                >
                  <Save className="mr-2 size-4" />
                  {isLoadingSettings ||
                  updateSettingsMutation.isPending ||
                  formState.isSubmitting
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Pengaturan Umum */}
                <Card className="shadow-none">
                  <CardHeader>
                    <CardTitle>Pengaturan Umum</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel htmlFor="loyalty_earn_point_with_multiple">
                          Berlaku Kelipatan
                        </FormLabel>
                        <Switch
                          id="loyalty_earn_point_with_multiple"
                          checked={watchData.loyalty_earn_point_with_multiple}
                          onCheckedChange={(checked) =>
                            setValue(
                              "loyalty_earn_point_with_multiple",
                              checked
                            )
                          }
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Jika diaktifkan, poin yang didapatkan akan dikalikan
                        berdasarkan kelipatan:
                      </p>
                      <ul className="text-muted-foreground ml-4 list-disc space-y-1 text-sm">
                        <li>
                          <strong>Untuk Total Order:</strong> Kelipatan
                          berdasarkan harga. Contoh: min. 100rb dapat 10 poin,
                          pembelian 250rb = 2x kelipatan = 20 poin.
                        </li>
                        <li>
                          <strong>Untuk Item:</strong> Kelipatan berdasarkan
                          qty. Contoh: 3 item × 10 poin = 30 poin.
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <FormLabel
                          htmlFor="loyalty_earn_points_when_using_points"
                          className="text-sm"
                        >
                          Tambahan poin tetap didapat ketika menggunakan poin
                        </FormLabel>
                        <Switch
                          id="loyalty_earn_points_when_using_points"
                          checked={
                            watchData.loyalty_earn_points_when_using_points
                          }
                          onCheckedChange={(checked) =>
                            setValue(
                              "loyalty_earn_points_when_using_points",
                              checked
                            )
                          }
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Jika diaktifkan, customer tetap mendapatkan poin dari
                        pembelian meskipun mereka menggunakan poin untuk redeem
                        reward.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Pengaturan Jumlah Dibeli */}
                <Card className="shadow-none">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Jumlah Dibeli</CardTitle>
                      <Switch
                        checked={watchData.loyalty_earn_point_by_total_order}
                        onCheckedChange={(checked) => {
                          setValue("loyalty_earn_point_by_total_order", checked)
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-sm">
                        Pelanggan akan mendapatkan poin setelah membeli pesanan
                        dalam jumlah tertentu sebagai pengaturan berikut. Jika
                        fitur ini diaktifkan, poin yang didapatkan berdasarkan
                        item tidak lagi didapatkan.
                      </AlertDescription>
                    </Alert>

                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Point Diperoleh */}
                      <FormFieldItem
                        control={control}
                        name="loyalty_points_earned_by_total_order"
                        label={<FormLabel>Point Diperoleh</FormLabel>}
                        invalid={Boolean(
                          formState.errors.loyalty_points_earned_by_total_order
                        )}
                        errorMessage={
                          formState.errors.loyalty_points_earned_by_total_order
                            ?.message
                        }
                        render={({ field }) => (
                          <div className="flex w-full items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 shrink-0"
                              onClick={handlePointsDecrement}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <InputGroup className="flex-1">
                              <InputGroupInput
                                type="number"
                                min="0"
                                {...field}
                                value={field.value === 0 ? "" : field.value}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value)
                                  field.onChange(value)
                                }}
                                className="text-center"
                              />
                            </InputGroup>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 shrink-0"
                              onClick={handlePointsIncrement}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      />

                      {/* Min. Total Order */}
                      <FormFieldItem
                        control={control}
                        name="loyalty_min_total_order"
                        label={<FormLabel>Min. Total Order</FormLabel>}
                        invalid={Boolean(
                          formState.errors.loyalty_min_total_order
                        )}
                        errorMessage={
                          formState.errors.loyalty_min_total_order?.message
                        }
                        render={({ field }) => (
                          <InputCurrency
                            value={field.value}
                            onValueChange={(value: string | undefined) =>
                              field.onChange(parseFloat(value || "0") || 0)
                            }
                            placeholder="0"
                            className="w-full"
                          />
                        )}
                      />
                    </div>

                    {/* Point Kedaluwarsa */}
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      <FormFieldItem
                        control={control}
                        name="loyalty_expired_type_by_total_order"
                        label={
                          <FormLabel>
                            Point Kedaluwarsa{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                        }
                        invalid={Boolean(
                          formState.errors.loyalty_expired_type_by_total_order
                        )}
                        errorMessage={
                          formState.errors.loyalty_expired_type_by_total_order
                            ?.message
                        }
                        render={({ field, fieldState }) => (
                          <Select
                            isSearchable={false}
                            placeholder="Pilih masa berlaku"
                            value={expiredTypeOptions.find(
                              (opt) => opt.value === field.value
                            )}
                            options={expiredTypeOptions}
                            error={!!fieldState.error}
                            onChange={(option) => {
                              field.onChange(option?.value)
                              // Reset expired_value jika forever
                              if (option?.value === "forever") {
                                setValue(
                                  "loyalty_expired_value_by_total_order",
                                  0
                                )
                              }
                            }}
                            className="w-full"
                          />
                        )}
                      />

                      {watchData.loyalty_expired_type_by_total_order !==
                        "forever" && (
                        <FormFieldItem
                          control={control}
                          name="loyalty_expired_value_by_total_order"
                          label={
                            <FormLabel>
                              Nilai Masa Berlaku{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                          }
                          invalid={Boolean(
                            formState.errors
                              .loyalty_expired_value_by_total_order
                          )}
                          errorMessage={
                            formState.errors
                              .loyalty_expired_value_by_total_order?.message
                          }
                          render={({ field }) => (
                            <InputGroup className="w-full">
                              <InputGroupInput
                                type="number"
                                autoComplete="off"
                                {...field}
                                value={field.value === 0 ? "" : field.value}
                                onChange={(e) => {
                                  const value =
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value)
                                  field.onChange(value)
                                }}
                                className="w-full"
                              />
                              <InputGroupAddon align="inline-end">
                                {watchData.loyalty_expired_type_by_total_order ===
                                "day"
                                  ? "Hari"
                                  : watchData.loyalty_expired_type_by_total_order ===
                                      "week"
                                    ? "Minggu"
                                    : watchData.loyalty_expired_type_by_total_order ===
                                        "month"
                                      ? "Bulan"
                                      : "Tahun"}
                              </InputGroupAddon>
                            </InputGroup>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </Form>
        </Loading>
      </div>
    </LayoutOtherSetting>
  )
}

export default LoyaltyPointSettingsPage
