import { useQuery } from "@tanstack/react-query"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMember } from "@/services/api/MembeService"
import { useNavigate, useParams } from "react-router-dom"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageMember from "@/components/form/member/FormPageMember"
import { useMemberValidation } from "@/components/form/member/memberValidation"

const EditMember = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const formProps = useMemberValidation()

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.memberDetail, code],
    queryFn: async () => {
      const res = await apiGetMember(code as string)
      const data = res.data as MemberDetail

      if (data) {
        // Mengisi semua field form berdasarkan data dari API
        formProps.setValue("code", data.code)
        formProps.setValue("name", data.name)
        formProps.setValue("email", data.email)
        formProps.setValue("phone", data.phone)
        formProps.setValue("identity_number", data.identity_number)
        formProps.setValue("identity_type", data.identity_type as any)

        if (data.birth_date) {
          formProps.setValue("birth_date", dayjs(data.birth_date).toDate())
        }

        formProps.setValue("gender", data.gender as any)
        formProps.setValue("address", data.address)
        formProps.setValue("photo", data.photo)
        formProps.setValue("goals", data.goals)
        formProps.setValue("notes", data.notes)
        formProps.setValue("height_cm", data.height_cm)

        if (data.join_date) {
          formProps.setValue("join_date", dayjs(data.join_date).toDate())
        }

        formProps.setValue("enabled", data.enabled)
      }

      return res
    },
    enabled: !!code,
  })

  const onClose = () => {
    console.log("code", code)
    navigate(`/members/detail/${code}`)
  }

  return (
    <Loading loading={isLoading}>
      <FormPageMember type="update" formProps={formProps} onSuccess={onClose} />
    </Loading>
  )
}

export default EditMember
