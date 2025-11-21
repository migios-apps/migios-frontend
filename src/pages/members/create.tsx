import { useNavigate } from "react-router-dom"
import FormPageMember from "@/components/form/member/FormPageMember"
import { useMemberValidation } from "@/components/form/member/memberValidation"

const CreateMember = () => {
  const formProps = useMemberValidation()
  const navigate = useNavigate()

  const onClose = () => {
    navigate("/members")
  }

  return (
    <FormPageMember type="create" formProps={formProps} onSuccess={onClose} />
  )
}

export default CreateMember
