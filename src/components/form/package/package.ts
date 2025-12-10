import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import parseToDecimal from "@/utils/parseToDecimal"

export const durationTypeOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

const defaultValues = {
  enabled: true,
  is_promo: 0,
}

// Membership validation
export const validationSchemaMembership = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().optional().required("Name is required"),
  price: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Price must be a valid number")
    .positive("Price must be positive")
    .required("Price is required"),
  description: yup.string().optional().nullable(),
  // max_member: yup.number().optional().nullable(),
  duration: yup
    .number()
    .typeError("Duration must be a number")
    .required("Duration is required"),
  duration_type: yup.string().required("Duration Type is required"),
  session_duration: yup.number().optional().default(0),
  enabled: yup.boolean().default(true),
  allow_all_trainer: yup.boolean().default(false),
  is_promo: yup.number().default(0),
  discount_type: yup.string().when("is_promo", {
    is: (val: number) => val === 1,
    then: (schema) =>
      schema
        .required("Discount Type is required")
        .oneOf(["percent", "nominal"], "Invalid discount type value"),
    otherwise: (schema) => schema,
  }),
  discount: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Discount must be a valid number")
    .when("is_promo", {
      is: (val: number) => val === 1,
      then: (schema) => schema.required("Discount Value is required"),
      otherwise: (schema) => schema,
    }),
  loyalty_point: yup
    .object()
    .shape({
      points: yup.number().min(0).required(),
      expired_type: yup
        .string()
        .oneOf(["forever", "day", "week", "month", "year"])
        .required(),
      expired_value: yup
        .number()
        .min(0)
        .when("expired_type", {
          is: (val: string) => val !== "forever",
          then: (schema) => schema.required().min(1),
          otherwise: (schema) => schema.optional().default(0),
        }),
    })
    .optional()
    .nullable(),
})

export type MembershipFormSchema = yup.InferType<
  typeof validationSchemaMembership
>
export type ReturnMembershipFormSchema = ReturnType<
  typeof useForm<MembershipFormSchema>
>

export const usePackageMembershipForm = () => {
  return useForm<MembershipFormSchema>({
    resolver: yupResolver(validationSchemaMembership) as any,
    defaultValues,
  })
}

export const resetPackageMembershipForm = (
  form: ReturnMembershipFormSchema
) => {
  form.reset({
    ...defaultValues,
  })
}

// Package Trainer validation
export const validationSchemaTrainer = yup.object().shape({
  id: yup.number().required("ID is required"),
  code: yup.string().required("Trainer Code is required"),
  name: yup.string().required("Name is required"),
  photo: yup.string().optional().nullable(),
})

export const validationSchemaPtTrainer = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().optional().required("Name is required"),
  price: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Price must be a valid number")
    .positive("Price must be positive")
    .required("Price is required"),
  description: yup.string().optional().nullable(),
  // max_member: yup.number().required('Max Member is required'),
  duration: yup
    .number()
    .typeError("Duration must be a number")
    .required("Duration is required"),
  duration_type: yup.string().required("Duration Type is required"),
  session_duration: yup
    .number()
    .typeError("Total session must be a number")
    .required("Total session is required"),
  enabled: yup.boolean().default(true),
  allow_all_trainer: yup.boolean().default(false),
  is_promo: yup.number().default(0),
  discount_type: yup.string().when("is_promo", {
    is: (val: number) => val === 1,
    then: (schema) =>
      schema
        .required("Discount Type is required")
        .oneOf(["percent", "nominal"], "Invalid discount type value"),
    otherwise: (schema) => schema,
  }),
  discount: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Discount must be a valid number")
    .when("is_promo", {
      is: (val: number) => val === 1,
      then: (schema) => schema.required("Discount Value is required"),
      otherwise: (schema) => schema,
    }),
  loyalty_point: yup
    .object()
    .shape({
      points: yup.number().min(0).required(),
      expired_type: yup
        .string()
        .oneOf(["forever", "day", "week", "month", "year"])
        .required(),
      expired_value: yup
        .number()
        .min(0)
        .when("expired_type", {
          is: (val: string) => val !== "forever",
          then: (schema) => schema.required().min(1),
          otherwise: (schema) => schema.optional().default(0),
        }),
    })
    .optional()
    .nullable(),
  trainers: yup
    .array()
    .of(validationSchemaTrainer)
    .when("allow_all_trainer", {
      is: (allow_all_trainer: boolean) => allow_all_trainer === false,
      then: (schema) =>
        schema
          .required("Trainer is required")
          .min(1, "At least one trainer is required"),
      otherwise: (schema) => schema.nullable(),
    }),
})

export type PtTrainerFormSchema = yup.InferType<
  typeof validationSchemaPtTrainer
>
export type ReturnPtTrainerFormSchema = ReturnType<
  typeof useForm<PtTrainerFormSchema>
>

export const usePackagePtTrainerForm = () => {
  return useForm<PtTrainerFormSchema>({
    resolver: yupResolver(validationSchemaPtTrainer) as any,
    defaultValues: {
      ...defaultValues,
    },
  })
}

export const resetPackagePtTrainerForm = (form: ReturnPtTrainerFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}

// Package Class validation
export const validationSchemaClass = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().optional().required("Name is required"),
  price: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Price must be a valid number")
    .positive("Price must be positive")
    .required("Price is required"),
  description: yup.string().optional().nullable(),
  // max_member: yup.number().optional().nullable(),
  duration: yup
    .number()
    .typeError("Duration must be a number")
    .required("Duration is required"),
  duration_type: yup.string().required("Duration Type is required"),
  // session_duration: yup.number().optional().default(0),
  enabled: yup.boolean().default(true),
  allow_all_trainer: yup.boolean().default(false),
  is_promo: yup.number().default(0),
  discount_type: yup.string().when("is_promo", {
    is: (val: number) => val === 1,
    then: (schema) =>
      schema
        .required("Discount Type is required")
        .oneOf(["percent", "nominal"], "Invalid discount type value"),
    otherwise: (schema) => schema,
  }),
  discount: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return undefined
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? undefined
        : num
    })
    .typeError("Discount must be a valid number")
    .when("is_promo", {
      is: (val: number) => val === 1,
      then: (schema) => schema.required("Discount Value is required"),
      otherwise: (schema) => schema,
    }),
  loyalty_point: yup
    .object()
    .shape({
      points: yup.number().min(0).required(),
      expired_type: yup
        .string()
        .oneOf(["forever", "day", "week", "month", "year"])
        .required(),
      expired_value: yup
        .number()
        .min(0)
        .when("expired_type", {
          is: (val: string) => val !== "forever",
          then: (schema) => schema.required().min(1),
          otherwise: (schema) => schema.optional().default(0),
        }),
    })
    .optional()
    .nullable(),
  classes: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.number().required("Class ID is required"),
        name: yup.string().required("Class Name is required"),
      })
    )
    .required("Classes is required")
    .min(1, "At least one class is required"),
})

export type ClassFormSchema = yup.InferType<typeof validationSchemaClass>
export type ReturnClassFormSchema = ReturnType<typeof useForm<ClassFormSchema>>

export const usePackageClassForm = () => {
  return useForm<ClassFormSchema>({
    resolver: yupResolver(validationSchemaClass) as any,
    defaultValues,
  })
}

export const resetPackageClassForm = (form: ReturnClassFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}
