import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import * as yup from "yup"

export const validationSchemaCuttingSession = yup.object().shape({
  id: yup.number().optional().nullable(),
  member_id: yup
    .number()
    .required("Member is required")
    .test("member-required", "Member is required", function (value) {
      return !!this.parent.member || !!value
    }),
  member: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
      code: yup.string().required(),
      photo: yup.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  member_package_id: yup
    .number()
    .required("Member Package is required")
    .test(
      "member-package-required",
      "Member Package is required",
      function (value) {
        return !!this.parent.member_package || !!value
      }
    ),
  member_package: yup
    .object({
      id: yup.number().required(),
    })
    .optional()
    .nullable(),
  trainer_id: yup
    .number()
    .required("Trainer is required")
    .test("trainer-required", "Trainer is required", function (value) {
      return !!this.parent.trainer || !!value
    }),
  trainer: yup
    .object({
      id: yup.number().required(),
      name: yup.string().required(),
      code: yup.string().required(),
      photo: yup.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  type: yup.string().required("Type is required"),
  session_cut: yup
    .number()
    .required("Session Cut is required")
    .min(1, "Session Cut must be at least 1"),
  description: yup.string().optional().nullable(),
  due_date: yup.string().required("Due Date is required"),
  start_date: yup
    .string()
    .required("Start Date is required")
    .test("is-valid-date", "Start date is invalid", (value) =>
      dayjs(value).isValid()
    ),
  end_date: yup
    .string()
    .required("End date is required")
    .test("is-valid-date", "End date is invalid", (value) =>
      dayjs(value).isValid()
    )
    .test(
      "is-after-start",
      "End date must be after the start date",
      function (value) {
        const { start_date } = this.parent
        if (!start_date || !value) return true
        return dayjs(value).isAfter(dayjs(start_date))
      }
    ),
  exercises: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("Exercise name is required"),
        sets: yup
          .number()
          .required("Sets is required")
          .min(1, "Sets must be at least 1"),
        reps: yup
          .number()
          .required("Reps is required")
          .min(1, "Reps must be at least 1"),
        weight_kg: yup
          .number()
          .required("Weight is required")
          .min(0, "Weight must be at least 0"),
        rpe: yup
          .number()
          .required("RPE is required")
          .min(1, "RPE must be at least 1")
          .max(10, "RPE must be at most 10"),
      })
    )
    .optional()
    .nullable(),
})

export type CuttingSessionFormSchema = yup.InferType<
  typeof validationSchemaCuttingSession
>
export type ReturnCuttingSessionFormSchema = ReturnType<
  typeof useForm<CuttingSessionFormSchema>
>

const defaultValues = {
  club_id: 0,
  member_id: 0,
  member: null,
  member_package_id: 0,
  member_package: null,
  trainer_id: 0,
  trainer: null,
  type: "",
  session_cut: 0,
  description: null,
  due_date: "",
  start_date: "",
  end_date: "",
  exercises: [],
}

export const useCuttingSessionForm = () => {
  return useForm<CuttingSessionFormSchema>({
    resolver: yupResolver(validationSchemaCuttingSession) as any,
    defaultValues,
  })
}

export const resetCuttingSessionForm = (
  form: ReturnCuttingSessionFormSchema
) => {
  form.reset({
    ...defaultValues,
  })
}
