import { useNavigate } from "react-router-dom"
import FormPageMeasurement from "@/components/form/measurement/FormPageMeasurement"
import { useMeasurementForm } from "@/components/form/measurement/validation"

const CreateMeasurement = () => {
  const formProps = useMeasurementForm()
  const navigate = useNavigate()

  const onClose = () => {
    navigate("/measurement")
  }

  return (
    <FormPageMeasurement
      type="create"
      formProps={formProps}
      onSuccess={onClose}
    />
  )
}

export default CreateMeasurement
