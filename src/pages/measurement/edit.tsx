import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { MemberMeasurement } from "@/services/api/@types/measurement"
import { apiGetMemberMeasurement } from "@/services/api/MeasurementService"
import { useNavigate, useParams } from "react-router"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageMeasurement from "@/components/form/measurement/FormPageMeasurement"
import { useMeasurementForm } from "@/components/form/measurement/validation"

const EditMeasurement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const formProps = useMeasurementForm()
  const { setValue } = formProps

  const { data: measurementData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.measurements, id],
    queryFn: () => apiGetMemberMeasurement(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    const data = measurementData?.data as MemberMeasurement | undefined
    if (!data) return

    setValue("id", data.id)
    setValue("member_id", data.member_id)
    setValue("member", data.member)
    setValue("trainer_id", data.trainer_id)
    setValue("trainer", data.trainer)
    setValue("measured_at", data.measured_at)
    setValue("weight_kg", data.weight_kg)
    setValue("body_fat_percent", data.body_fat_percent)
    setValue("muscle_mass_kg", data.muscle_mass_kg)
    setValue("bone_mass_kg", data.bone_mass_kg)
    setValue("total_body_water_percent", data.total_body_water_percent)
    setValue("visceral_fat_level", data.visceral_fat_level)
    setValue("metabolic_age_years", data.metabolic_age_years)
    setValue("protein_percent", data.protein_percent)
    setValue("body_age_years", data.body_age_years)
    setValue("physique_rating", data.physique_rating)
    setValue("neck_cm", data.neck_cm)
    setValue("right_arm_cm", data.right_arm_cm)
    setValue("left_arm_cm", data.left_arm_cm)
    setValue("chest_cm", data.chest_cm)
    setValue("abdominal_cm", data.abdominal_cm)
    setValue("hip_cm", data.hip_cm)
    setValue("right_thigh_cm", data.right_thigh_cm)
    setValue("left_thigh_cm", data.left_thigh_cm)
    setValue("right_calf_cm", data.right_calf_cm)
    setValue("left_calf_cm", data.left_calf_cm)
    setValue("result", data.result as any)
    setValue("notes", data.notes)
    setValue("calorie_target_kcal", data.calorie_target_kcal)
    setValue("adherence_score", data.adherence_score)
    setValue("activity_factor", data.activity_factor)
    if (data.photos && data.photos.length > 0) {
      setValue("photos", data.photos as any)
    }
  }, [measurementData, setValue])

  const onClose = () => {
    navigate("/measurement")
  }

  return (
    <Loading loading={isLoading}>
      <FormPageMeasurement
        type="update"
        formProps={formProps}
        onSuccess={onClose}
      />
    </Loading>
  )
}

export default EditMeasurement
