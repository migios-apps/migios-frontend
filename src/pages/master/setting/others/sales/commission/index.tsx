import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CommissionSettingType,
  CreateCommissionSetting,
} from "@/services/api/@types/settings/commissions"
import {
  apiCreateCommissionSetting,
  apiGetCommissionList,
  apiUpdateCommissionSetting,
} from "@/services/api/settings/commission"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormFieldItem,
  FormLabel,
  FormControl,
  FormItem,
  FormDescription,
} from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { CreateCommissionSchema, useCommissionForm } from "./validation"

const LoadingCommissionSetting = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="gap-2 p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-muted/50 space-y-3 rounded-lg border p-2"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CommissionSetting = () => {
  const [formType, setFormType] = React.useState<"create" | "update">("update")
  const formProps = useCommissionForm()
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: async () => {
      const res = await apiGetCommissionList()
      const commissionSetting = res.data[0] as CommissionSettingType | undefined
      if (commissionSetting) {
        setFormType("update")
        formProps.setValue("id", commissionSetting.id)
        formProps.setValue("club_id", commissionSetting.club_id)
        formProps.setValue(
          "commission_sales_by_item_before_tax",
          commissionSetting.commission_sales_by_item_before_tax
        )
        formProps.setValue(
          "commission_sales_by_item_before_discount",
          commissionSetting.commission_sales_by_item_before_discount
        )
        formProps.setValue(
          "commission_prorate_by_total_sales",
          commissionSetting.commission_prorate_by_total_sales
        )
        formProps.setValue("service", commissionSetting.service)
        formProps.setValue("session", commissionSetting.session)
        formProps.setValue("class", commissionSetting.class)
      }
      return res
    },
  })

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.commissionSetting] })
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateCommissionSetting) =>
      apiCreateCommissionSetting(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateCommissionSetting) =>
      apiUpdateCommissionSetting(Number(watchData.id), data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateCommissionSchema> = (data) => {
    if (formType === "update") {
      update.mutate({
        club_id: club?.id as number,
        commission_sales_by_item_before_tax:
          data.commission_sales_by_item_before_tax,
        commission_sales_by_item_before_discount:
          data.commission_sales_by_item_before_discount,
        commission_prorate_by_total_sales:
          data.commission_prorate_by_total_sales,
        service: data.service,
        session: data.session,
        class: data.class,
      })
      return
    }
    if (formType === "create") {
      create.mutate({
        club_id: club?.id as number,
        commission_sales_by_item_before_tax:
          data.commission_sales_by_item_before_tax,
        commission_sales_by_item_before_discount:
          data.commission_sales_by_item_before_discount,
        commission_prorate_by_total_sales:
          data.commission_prorate_by_total_sales,
        service: data.service,
        session: data.session,
        class: data.class,
      })
      return
    }
  }

  if (isLoading) return <LoadingCommissionSetting />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="gap-2 p-4">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Pengaturan Komisi
              </CardTitle>
              <CardDescription>
                Pengaturan cara perhitungan komisi penjualan dan komisi default
                untuk layanan, sesi, dan kelas. Jika tidak ada komisi yang
                diatur di level staff atau level item, akan menggunakan komisi
                default ini.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-3">
                {/* Commission Sales Settings */}
                <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
                  <FormLabel className="text-base font-semibold">
                    Pengaturan Komisi Penjualan
                  </FormLabel>
                  <p className="text-muted-foreground text-sm">
                    Pengaturan cara perhitungan komisi penjualan berdasarkan
                    item transaksi.
                  </p>

                  {/* Before Tax */}
                  <FormFieldItem
                    control={control}
                    name="commission_sales_by_item_before_tax"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(
                      errors.commission_sales_by_item_before_tax
                    )}
                    errorMessage={
                      errors.commission_sales_by_item_before_tax?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Hitung Komisi Item Sebelum Pajak
                          </FormLabel>
                          <FormDescription>
                            Komisi dihitung berdasarkan subtotal item sebelum
                            pajak diterapkan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Before Discount */}
                  <FormFieldItem
                    control={control}
                    name="commission_sales_by_item_before_discount"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(
                      errors.commission_sales_by_item_before_discount
                    )}
                    errorMessage={
                      errors.commission_sales_by_item_before_discount?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Hitung Komisi Item Sebelum Diskon
                          </FormLabel>
                          <FormDescription>
                            Komisi dihitung berdasarkan subtotal item sebelum
                            diskon item diterapkan
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Prorate by Total Sales */}
                  <FormFieldItem
                    control={control}
                    name="commission_prorate_by_total_sales"
                    label={<FormLabel></FormLabel>}
                    invalid={Boolean(errors.commission_prorate_by_total_sales)}
                    errorMessage={
                      errors.commission_prorate_by_total_sales?.message
                    }
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Prorate Komisi Berdasarkan Total Penjualan
                          </FormLabel>
                          <FormDescription>
                            Jika aktif, komisi dihitung secara proporsional
                            berdasarkan proporsi item terhadap total penjualan
                            setelah diskon global. Komisi akan dijumlahkan jadi
                            satu record. Jika tidak aktif, komisi dihitung dan
                            dicatat per item secara terpisah.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value === 1)}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Service */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="service"
                    label={<FormLabel className="text-base">Layanan</FormLabel>}
                    invalid={Boolean(errors.service)}
                    errorMessage={errors.service?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima staff untuk setiap{" "}
                    <strong>Layanan (Service)</strong> yang dikerjakan. Komisi
                    ini bersifat nominal tetap per layanan.
                  </p>
                </div>
                {/* Session */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="session"
                    label={
                      <FormLabel className="text-base">
                        Per Sesi Latihan
                      </FormLabel>
                    }
                    invalid={Boolean(errors.session)}
                    errorMessage={errors.session?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima trainer untuk setiap{" "}
                    <strong>Sesi Latihan (Personal Training)</strong> yang
                    diselesaikan. Komisi ini bersifat nominal tetap per sesi.
                  </p>
                </div>
                {/* Class */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="class"
                    label={
                      <FormLabel className="text-base">Per Kelas</FormLabel>
                    }
                    invalid={Boolean(errors.class)}
                    errorMessage={errors.class?.message}
                    render={({ field }) => (
                      <InputCurrency
                        placeholder="Rp. 0"
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur nominal komisi yang diterima instruktur untuk setiap{" "}
                    <strong>Kelas (Group Class)</strong> yang diajar. Komisi ini
                    bersifat nominal tetap per kelas.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {create.isPending || update.isPending
                    ? "Menyimpan..."
                    : "Simpan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CommissionSetting
