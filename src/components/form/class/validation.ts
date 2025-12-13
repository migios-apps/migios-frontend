import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { validationSchemaTrainer } from "../package/package"

export const LevelClassOptions = [
  { label: "Easy", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Hard", value: 3 },
]

export const AvailableForOptions = [
  { label: "Everyone", value: 0 },
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
]

export const VisibleForOptions = [
  { label: "Public", value: 0 },
  { label: "Private", value: 1 },
]

export const ClassTypeOptions = [
  { label: "Offline", value: 0 },
  { label: "Online", value: 1 },
]

export const IsPublishOptions = [
  { label: "Draft", value: 0 },
  { label: "Publish", value: 1 },
]

export const DurationTimeTypeOptions = [
  { label: "Minute", value: "minute" },
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "Forever", value: "forever" },
]

export const WeekdayOptions = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
]

export const validationSchemaClassPage = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().required("Name is required"),
  capacity: yup.number().required("Capacity is required"),
  level: yup.number().optional().nullable(),
  burn_calories: yup.number().optional().nullable(),
  description: yup
    .string()
    .max(150, "Maximum 150 characters")
    .optional()
    .nullable(),
  allow_all_instructor: yup.boolean().default(false),
  enabled: yup.boolean().default(true),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  is_forever: yup.boolean().default(false),
  is_publish: yup.number().required("Publish status is required"),
  available_for: yup.number().required("Available for is required"),
  visible_for: yup.number().required("Visible for is required"),
  class_type: yup.number().required("Class type is required"),
  embed_video: yup.string().optional().nullable(),
  background_color: yup.string().optional().nullable(),
  color: yup.string().optional().nullable(),
  start_time: yup.string().required("Start time is required"),
  duration_time: yup.number().required("Duration time is required"),
  duration_time_type: yup
    .string()
    .oneOf(["minute", "hour", "day", "week", "month", "year", "forever"])
    .required("Duration time type is required"),
  instructors: yup
    .array()
    .of(validationSchemaTrainer)
    .when("allow_all_instructor", {
      is: (allow_all_instructor: boolean) => allow_all_instructor === false,
      then: (schema) =>
        schema
          .required("Instructor is required")
          .min(1, "At least one instructor is required"),
    })
    .optional(),
  weekdays_available: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.number().min(0).max(6).required(),
      })
    )
    .optional(),
  class_photos: yup.array().of(yup.string()).optional(),
  category: yup
    .object({
      id: yup.number().required("Category ID is required"),
      name: yup.string().required("Category name is required"),
    })
    .optional()
    .nullable(),
})

export type ClassPageFormSchema = yup.InferType<
  typeof validationSchemaClassPage
>
export type ReturnClassPageFormSchema = ReturnType<
  typeof useForm<ClassPageFormSchema>
>

const defaultValues = {
  enabled: true,
  allow_all_instructor: false,
  is_forever: false,
  is_publish: 0,
  available_for: 0,
  visible_for: 0,
  class_type: 0,
  duration_time_type: "minute" as const,
}

export const useClassPageForm = () => {
  return useForm<ClassPageFormSchema>({
    resolver: yupResolver(validationSchemaClassPage) as any,
    defaultValues,
  })
}

export const resetClassPageForm = (form: ReturnClassPageFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}

// category

export const validationSchemaClassCategoryPage = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Name is required"),
})

export type ClassCategoryPageFormSchema = yup.InferType<
  typeof validationSchemaClassCategoryPage
>
export type ReturnClassCategoryPageFormSchema = ReturnType<
  typeof useForm<ClassCategoryPageFormSchema>
>

export const useClassCategoryPageForm = () => {
  return useForm<ClassCategoryPageFormSchema>({
    resolver: yupResolver(validationSchemaClassCategoryPage) as any,
    defaultValues: {},
  })
}

export const resetClassCategoryPageForm = (
  form: ReturnClassCategoryPageFormSchema
) => {
  form.reset({
    ...{},
  })
}
