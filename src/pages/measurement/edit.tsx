import { useQuery } from "@tanstack/react-query"
import { MemberMeasurement } from "@/services/api/@types/measurement"
import { apiGetMemberMeasurement } from "@/services/api/MeasurementService"
import { useNavigate, useParams } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import FormPageMeasurement from "@/components/form/measurement/FormPageMeasurement"
import { useMeasurementForm } from "@/components/form/measurement/validation"

const EditMeasurement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const formProps = useMeasurementForm()

  const { isLoading } = useQuery({
    queryKey: [QUERY_KEY.measurements, id],
    queryFn: async () => {
      const res = await apiGetMemberMeasurement(Number(id))
      const data = res.data as MemberMeasurement

      if (data) {
        formProps.setValue("id", data.id)
        formProps.setValue("member_id", data.member_id)
        formProps.setValue("member", data.member)
        formProps.setValue("trainer_id", data.trainer_id)
        formProps.setValue("trainer", data.trainer)
        formProps.setValue("measured_at", data.measured_at)
        formProps.setValue("weight_kg", data.weight_kg)
        formProps.setValue("body_fat_percent", data.body_fat_percent)
        formProps.setValue("muscle_mass_kg", data.muscle_mass_kg)
        formProps.setValue("bone_mass_kg", data.bone_mass_kg)
        formProps.setValue(
          "total_body_water_percent",
          data.total_body_water_percent
        )
        formProps.setValue("visceral_fat_level", data.visceral_fat_level)
        formProps.setValue("metabolic_age_years", data.metabolic_age_years)
        formProps.setValue("protein_percent", data.protein_percent)
        formProps.setValue("body_age_years", data.body_age_years)
        formProps.setValue("physique_rating", data.physique_rating)
        formProps.setValue("neck_cm", data.neck_cm)
        formProps.setValue("right_arm_cm", data.right_arm_cm)
        formProps.setValue("left_arm_cm", data.left_arm_cm)
        formProps.setValue("chest_cm", data.chest_cm)
        formProps.setValue("abdominal_cm", data.abdominal_cm)
        formProps.setValue("hip_cm", data.hip_cm)
        formProps.setValue("right_thigh_cm", data.right_thigh_cm)
        formProps.setValue("left_thigh_cm", data.left_thigh_cm)
        formProps.setValue("right_calf_cm", data.right_calf_cm)
        formProps.setValue("left_calf_cm", data.left_calf_cm)
        formProps.setValue("result", data.result as any)
        formProps.setValue("notes", data.notes)
        formProps.setValue("calorie_target_kcal", data.calorie_target_kcal)
        formProps.setValue("adherence_score", data.adherence_score)
        formProps.setValue("activity_factor", data.activity_factor)
        if (data.photos && data.photos.length > 0) {
          formProps.setValue("photos", data.photos as any)
        }
      }

      return res
    },
    enabled: !!id,
  })

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
