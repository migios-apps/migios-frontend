import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { EmployeeDetailPage } from "@/services/api/@types/employee"
import { CommissionSettingType } from "@/services/api/@types/settings/commissions"
import { apiGetEmployeeDetailPage } from "@/services/api/EmployeeService"
import { apiGetCommissionList } from "@/services/api/settings/commission"
import { useNavigate, useParams } from "react-router"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageEmployee from "@/components/form/employee/FormPageEmployee"
import { useEmployeeValidation } from "@/components/form/employee/employeeValidation"

const EditEmployee = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const formProps = useEmployeeValidation()
  const { setValue } = formProps

  const watchData = formProps.watch()

  const { data: employeeData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.employeeDetail, id],
    queryFn: () => apiGetEmployeeDetailPage(id as string),
    enabled: !!id,
  })

  useEffect(() => {
    const data = employeeData?.data as EmployeeDetailPage | undefined
    if (!data) return

    setValue("code", data.code)
    setValue("photo", data.photo)
    setValue("name", data.name)
    setValue("email", data.email)
    setValue("phone", data.phone)
    setValue("identity_number", data.identity_number)
    setValue("identity_type", data.identity_type)

    if (data.birth_date) {
      setValue("birth_date", dayjs(data.birth_date).toDate())
    }

    if (data.join_date) {
      setValue("join_date", dayjs(data.join_date).toDate())
    }

    setValue("gender", data.gender)
    setValue(
      "specializations",
      data.specializations?.map((s) => ({
        label: s.name_id,
        value: s.id,
      })) || []
    )
    setValue("address", data.address)
    setValue("description", data.description)
    setValue("enabled", data.enabled)

    if (data.earnings) {
      setValue("earnings.base_salary", data.earnings.base_salary)
      setValue("earnings.service", data.earnings.service)
      setValue("earnings.session", data.earnings.session)
      setValue("earnings.class", data.earnings.class)
      setValue(
        "earnings.default_sales_product_commission",
        data.earnings.default_sales_product_commission
      )
      setValue(
        "earnings.default_sales_product_commission_type",
        data.earnings.default_sales_product_commission_type
      )
      setValue(
        "earnings.default_sales_product_commission_amount",
        data.earnings.default_sales_product_commission_amount
      )
      setValue(
        "earnings.default_sales_package_commission",
        data.earnings.default_sales_package_commission
      )
      setValue(
        "earnings.default_sales_package_commission_type",
        data.earnings.default_sales_package_commission_type
      )
      setValue(
        "earnings.default_sales_package_commission_amount",
        data.earnings.default_sales_package_commission_amount
      )
    }

    if (data.roles) {
      setValue("roles", data.roles)
    }
  }, [employeeData, setValue])

  const { data: commissionData, isLoading: isLoadingCommission } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: apiGetCommissionList,
    enabled: !!watchData.earnings,
  })

  useEffect(() => {
    const commissionSetting =
      (commissionData?.data[0] as CommissionSettingType) || null
    if (!commissionSetting) return
    setValue("earnings.service", commissionSetting.service)
    setValue("earnings.session", commissionSetting.session)
    setValue("earnings.class", commissionSetting.class)
  }, [commissionData, setValue])

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
