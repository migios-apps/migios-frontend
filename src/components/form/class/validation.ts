import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { validationEventSchema } from "../event/events"
import { validationSchemaTrainer } from "../package/package"

export const LevelClassOptions = [
  { label: "Easy", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Hard", value: 3 },
]

export const validationSchemaClassPage = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone number is required"),
  capacity: yup.number().required("Capacity is required"),
  level: yup.number().required("Level is required"),
  burn_calories: yup.number().required("Burn calories is required"),
  description: yup.string().max(150, "Maximum 150 characters").nullable(),
  allow_all_instructor: yup.boolean().default(false),
  enabled: yup.boolean().default(true),
  instructors: yup
    .array()
    .of(validationSchemaTrainer)
    .when("allow_all_instructor", {
      is: (allow_all_instructor: boolean) => allow_all_instructor === false,
      then: (schema) =>
        schema
          .required("Instructor is required")
          .min(1, "At least one instructor is required"),
    }),
  events: yup
    .array()
    .of(validationEventSchema)
    .required("Schedule is required")
    .min(1, "At least one schedule is required"),
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
