import { useQuery } from "@tanstack/react-query"
import { CommissionSettingType } from "@/services/api/@types/settings/commissions"
import { apiGetCommissionList } from "@/services/api/settings/commission"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageEmployee from "@/components/form/employee/FormPageEmployee"
import { useEmployeeValidation } from "@/components/form/employee/employeeValidation"

const CreateEmployee = () => {
  const formProps = useEmployeeValidation()
  const navigate = useNavigate()
  const onClose = () => {
    navigate("/master/employee")
  }

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: async () => {
      const res = await apiGetCommissionList()
      const commissionSetting = res.data[0] as CommissionSettingType | undefined
      if (commissionSetting) {
        formProps.setValue("earnings.sales", commissionSetting.sales)
        formProps.setValue("earnings.sales_type", commissionSetting.sales_type)
        formProps.setValue("earnings.service", commissionSetting.service)
        formProps.setValue("earnings.session", commissionSetting.session)
        formProps.setValue("earnings.class", commissionSetting.class)
      }
      return res
    },
  })
  return (
    <Loading loading={isLoading}>
      <FormPageEmployee
        type="create"
        formProps={formProps}
        onSuccess={onClose}
      />
    </Loading>
  )
}

export default CreateEmployee
