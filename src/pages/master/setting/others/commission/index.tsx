import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CreateCommissionSchema,
  useCommissionForm,
} from "@/pages/master/setting/others/commission/validation"
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
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import InputCurrency from "@/components/ui/input-currency"
import { InputPercentNominal } from "@/components/ui/input-percent-nominal"
import Loading from "@/components/ui/loading"
import LayoutOtherSetting from "../Layout"

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

  return (
    <LayoutOtherSetting>
      <Loading loading={isLoading}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3>Pengaturan Komisi</h3>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <Form {...formProps}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Sales</FormLabel>
                    </div>
                    <FormFieldItem
                      control={control}
                      name="sales"
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
                  </div>
                  <FormFieldItem
                    control={control}
                    name="service"
                    label={<FormLabel>Service</FormLabel>}
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
                  <FormFieldItem
                    control={control}
                    name="session"
                    label={<FormLabel>Session</FormLabel>}
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
                  <FormFieldItem
                    control={control}
                    name="class"
                    label={<FormLabel>Class</FormLabel>}
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
                </div>
                <div className="mt-6 flex justify-end gap-2">
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
          </div>
        </div>
      </Loading>
    </LayoutOtherSetting>
  )
}

export default CommissionSetting
