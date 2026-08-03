import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMember } from "@/services/api/MembeService"
import { useNavigate, useParams } from "react-router"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageMember from "@/components/form/member/FormPageMember"
import { useMemberValidation } from "@/components/form/member/memberValidation"

const EditMember = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const formProps = useMemberValidation()
  const { setValue } = formProps

  const { data: memberData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.memberDetail, code],
    queryFn: () => apiGetMember(code as string),
    enabled: !!code,
  })

  useEffect(() => {
    const data = memberData?.data as MemberDetail | undefined
    if (!data) return

    setValue("code", data.code)
    setValue("name", data.name)
    setValue("email", data.email)
    setValue("phone", data.phone)
    setValue("identity_number", data.identity_number)
    setValue("identity_type", data.identity_type as any)

    if (data.birth_date) {
      setValue("birth_date", dayjs(data.birth_date).toDate())
    }

    setValue("gender", data.gender as any)
    setValue("address", data.address)
    setValue("photo", data.photo)
    setValue("goals", data.goals)
    setValue("notes", data.notes)
    setValue("height_cm", data.height_cm)

    if (data.join_date) {
      setValue("join_date", dayjs(data.join_date).toDate())
    }

    setValue("enabled", data.enabled)
  }, [memberData, setValue])

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
