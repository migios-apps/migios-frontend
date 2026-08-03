import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { CommissionSettingType } from "@/services/api/@types/settings/commissions"
import { apiGetCommissionList } from "@/services/api/settings/commission"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageEmployee from "@/components/form/employee/FormPageEmployee"
import { useEmployeeValidation } from "@/components/form/employee/employeeValidation"

const CreateEmployee = () => {
  const formProps = useEmployeeValidation()
  const { setValue } = formProps

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.commissionSetting],
    queryFn: apiGetCommissionList,
  })

  useEffect(() => {
    const commissionSetting = data?.data[0] as CommissionSettingType | undefined
    if (commissionSetting) {
      setValue("earnings.service", commissionSetting.service)
      setValue("earnings.session", commissionSetting.session)
      setValue("earnings.class", commissionSetting.class)
    }
  }, [data, setValue])

  return (
    <Loading loading={isLoading}>
      <FormPageEmployee type="create" formProps={formProps} />
    </Loading>
  )
}

export default CreateEmployee
