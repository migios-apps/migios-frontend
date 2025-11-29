import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const expiredTypeOptions = [
  { label: "Forever", value: "forever" },
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

const validationSchemaLoyaltyPoint = yup.object().shape({
  points: yup
    .number()
    .required("Points harus diisi")
    .min(1, "Points minimal 1")
    .typeError("Points harus berupa angka"),
  expired_type: yup
    .string()
    .oneOf(["forever", "day", "week", "month", "year"], "Invalid expired type")
    .required("Expired type harus diisi"),
  expired_value: yup.number().when("expired_type", {
    is: (val: string) => val !== "forever",
    then: (schema) =>
      schema
        .required("Expired value harus diisi")
        .min(1, "Expired value minimal 1")
        .typeError("Expired value harus berupa angka"),
    otherwise: (schema) => schema.optional().default(1),
  }),
})

export type LoyaltyPointFormSchema = yup.InferType<
  typeof validationSchemaLoyaltyPoint
>

export type ReturnLoyaltyPointFormSchema = ReturnType<
  typeof useForm<LoyaltyPointFormSchema>
>

export const useLoyaltyPointForm = (defaultValues?: LoyaltyPointFormSchema) => {
  return useForm<LoyaltyPointFormSchema>({
    resolver: yupResolver(validationSchemaLoyaltyPoint) as any,
    defaultValues: {
      expired_type: "month",
      expired_value: 1,
      ...defaultValues,
    },
  })
}

export const resetLoyaltyPointForm = (
  form: ReturnLoyaltyPointFormSchema,
  defaultValues?: LoyaltyPointFormSchema
) => {
  form.reset({
    expired_type: "month",
    expired_value: 1,
    ...defaultValues,
  })
}
