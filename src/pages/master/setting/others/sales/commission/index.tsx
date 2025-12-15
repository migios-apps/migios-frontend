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
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import { InputPercentNominal } from "@/components/ui/input-percent-nominal"
import { Skeleton } from "@/components/ui/skeleton"
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
        formProps.setValue("sales", commissionSetting.sales)
        formProps.setValue("sales_type", commissionSetting.sales_type)
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
        sales: data.sales,
        sales_type: data.sales_type as "percent" | "nominal",
        service: data.service,
        session: data.session,
        class: data.class,
      })
      return
    }
    if (formType === "create") {
      create.mutate({
        club_id: club?.id as number,
        sales: data.sales,
        sales_type: data.sales_type as "percent" | "nominal",
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
                Pengaturan Komisi Default
              </CardTitle>
              <CardDescription>
                Pengaturan komisi default untuk penjualan, layanan, sesi, dan
                kelas jika tidak ada komisi yang diatur di level staff atau
                level item yang akan dijual akan menggunakan komisi default ini.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-0">
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-3">
                {/* Sales */}
                <div className="bg-muted/50 space-y-3 rounded-lg border p-2">
                  <FormFieldItem
                    control={control}
                    name="sales"
                    label={
                      <FormLabel className="text-base">Penjualan</FormLabel>
                    }
                    invalid={
                      Boolean(errors.sales) || Boolean(errors.sales_type)
                    }
                    errorMessage={
                      errors.sales?.message || errors.sales_type?.message
                    }
                    render={({ field, fieldState }) => {
                      return (
                        <InputPercentNominal
                          value={field.value}
                          onChange={field.onChange}
                          type={
                            (watchData.sales_type as "percent" | "nominal") ||
                            "percent"
                          }
                          onTypeChange={(type) => {
                            formProps.setValue("sales_type", type as any)
                          }}
                          placeholderPercent="10%"
                          placeholderNominal="Rp. 0"
                          error={!!fieldState.error}
                        />
                      )
                    }}
                  />
                  <p className="text-muted-foreground text-sm">
                    Atur besaran komisi yang diterima sales dari setiap
                    penjualan. Anda dapat memilih menggunakan{" "}
                    <strong>Persentase (%)</strong> dari nilai transaksi atau{" "}
                    <strong>Nominal (Rp)</strong> tetap per penjualan.
                  </p>
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
