import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaMeasurement = yup.object().shape({
  id: yup.number().optional().nullable(),
  member_id: yup.number().required("Member is required"),
  member: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
      code: yup.string().required(),
      photo: yup.string().optional().nullable(),
      gender: yup.string().optional().nullable(),
      age: yup.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  trainer_id: yup.number().optional().nullable(),
  trainer: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
      code: yup.string().required(),
      photo: yup.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  measured_at: yup.string().optional().nullable(),
  // Body Composition
  weight_kg: yup.number().optional().nullable(),
  body_fat_percent: yup.number().optional().nullable(),
  muscle_mass_kg: yup.number().optional().nullable(),
  bone_mass_kg: yup.number().optional().nullable(),
  total_body_water_percent: yup.number().optional().nullable(),
  visceral_fat_level: yup.number().optional().nullable(),
  metabolic_age_years: yup.number().optional().nullable(),
  protein_percent: yup.number().optional().nullable(),
  body_age_years: yup.number().optional().nullable(),
  physique_rating: yup.number().optional().nullable(),
  // Body Size
  neck_cm: yup.number().optional().nullable(),
  right_arm_cm: yup.number().optional().nullable(),
  left_arm_cm: yup.number().optional().nullable(),
  chest_cm: yup.number().optional().nullable(),
  abdominal_cm: yup.number().optional().nullable(),
  hip_cm: yup.number().optional().nullable(),
  right_thigh_cm: yup.number().optional().nullable(),
  left_thigh_cm: yup.number().optional().nullable(),
  right_calf_cm: yup.number().optional().nullable(),
  left_calf_cm: yup.number().optional().nullable(),
  // Result & Notes
  result: yup
    .string()
    .oneOf(
      ["excellent", "good", "average", "need_improvement", "poor"],
      "Invalid result value"
    )
    .optional()
    .nullable(),
  notes: yup.string().optional().nullable(),
  // Nutrition Target
  calorie_target_kcal: yup.number().optional().nullable(),
  adherence_score: yup.number().optional().nullable(),
  activity_factor: yup.number().optional().nullable(),
  // Photos
  photos: yup
    .array()
    .of(
      yup.object().shape({
        view: yup
          .string()
          .oneOf(["front", "back", "left", "right"], "Invalid view value")
          .required(),
        url: yup.string().required(),
      })
    )
    .optional()
    .nullable(),
})

export type MeasurementFormSchema = yup.InferType<
  typeof validationSchemaMeasurement
>
export type ReturnMeasurementFormSchema = ReturnType<
  typeof useForm<MeasurementFormSchema>
>

const defaultValues = {
  member_id: 0,
  member: null,
  trainer_id: null,
  trainer: null,
  measured_at: null,
  weight_kg: null,
  body_fat_percent: null,
  muscle_mass_kg: null,
  bone_mass_kg: null,
  total_body_water_percent: null,
  visceral_fat_level: null,
  metabolic_age_years: null,
  protein_percent: null,
  body_age_years: null,
  physique_rating: null,
  neck_cm: null,
  right_arm_cm: null,
  left_arm_cm: null,
  chest_cm: null,
  abdominal_cm: null,
  hip_cm: null,
  right_thigh_cm: null,
  left_thigh_cm: null,
  right_calf_cm: null,
  left_calf_cm: null,
  result: null,
  notes: null,
  calorie_target_kcal: null,
  adherence_score: null,
  activity_factor: null,
  photos: null,
}

export const useMeasurementForm = () => {
  return useForm<MeasurementFormSchema>({
    resolver: yupResolver(validationSchemaMeasurement) as any,
    defaultValues,
  })
}

export const resetMeasurementForm = (form: ReturnMeasurementFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}
