import { useQuery } from "@tanstack/react-query"
import { EmployeeDetailPage } from "@/services/api/@types/employee"
import { CommissionSettingType } from "@/services/api/@types/settings/commissions"
import { apiGetEmployeeDetailPage } from "@/services/api/EmployeeService"
import { apiGetCommissionList } from "@/services/api/settings/commission"
import dayjs from "dayjs"
import { useNavigate, useParams } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageEmployee from "@/components/form/employee/FormPageEmployee"
import { useEmployeeValidation } from "@/components/form/employee/employeeValidation"

const EditEmployee = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const formProps = useEmployeeValidation()

  const watchData = formProps.watch()

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.employeeDetail, id],
    queryFn: async () => {
      const res = await apiGetEmployeeDetailPage(id as string)
      const data = res.data as EmployeeDetailPage

      if (data) {
        // Mengisi semua field form berdasarkan data dari API
        formProps.setValue("code", data.code)
        formProps.setValue("photo", data.photo)
        formProps.setValue("name", data.name)
        formProps.setValue("email", data.email)
        formProps.setValue("phone", data.phone)
        formProps.setValue("identity_number", data.identity_number)
        formProps.setValue("identity_type", data.identity_type)

        // Menggunakan as untuk mengatasi error tipe data
        if (data.birth_date) {
          formProps.setValue("birth_date", dayjs(data.birth_date).toDate())
        }

        if (data.join_date) {
          formProps.setValue("join_date", dayjs(data.join_date).toDate())
        }

        formProps.setValue("gender", data.gender)
        formProps.setValue(
          "specializations",
          data.specializations?.map((s) => ({
            label: s.name_id,
            value: s.id,
          })) || []
        )
        formProps.setValue("address", data.address)
        formProps.setValue("description", data.description)
        formProps.setValue("enabled", data.enabled)

        // Mengisi data earnings
        if (data.earnings) {
          formProps.setValue("earnings.base_salary", data.earnings.base_salary)
          formProps.setValue("earnings.service", data.earnings.service)
          formProps.setValue("earnings.session", data.earnings.session)
          formProps.setValue("earnings.class", data.earnings.class)
          formProps.setValue(
            "earnings.default_sales_product_commission",
            data.earnings.default_sales_product_commission
          )
          formProps.setValue(
            "earnings.default_sales_product_commission_type",
            data.earnings.default_sales_product_commission_type
          )
          formProps.setValue(
            "earnings.default_sales_product_commission_amount",
            data.earnings.default_sales_product_commission_amount
          )
          formProps.setValue(
            "earnings.default_sales_package_commission",
            data.earnings.default_sales_package_commission
          )
          formProps.setValue(
            "earnings.default_sales_package_commission_type",
            data.earnings.default_sales_package_commission_type
          )
          formProps.setValue(
            "earnings.default_sales_package_commission_amount",
            data.earnings.default_sales_package_commission_amount
          )
        }

        // Mengisi data roles
        if (data.roles) {
          formProps.setValue("roles", data.roles)
        }
      }

      return res
    },
    enabled: !!id,
  })

  const { isLoading: isLoadingCommission } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: async () => {
      const res = await apiGetCommissionList()
      const commissionSetting = (res.data[0] as CommissionSettingType) || null
      formProps.setValue("earnings.service", commissionSetting?.service)
      formProps.setValue("earnings.session", commissionSetting?.session)
      formProps.setValue("earnings.class", commissionSetting?.class)
      return res
    },
    enabled: !!watchData.earnings,
  })

  const onClose = () => {
    navigate(`/employee/detail/${id}`)
  }

  return (
    <Loading loading={isLoading || isLoadingCommission}>
      <FormPageEmployee
        type="update"
        formProps={formProps}
        onSuccess={onClose}
      />
    </Loading>
  )
}

export default EditEmployee
