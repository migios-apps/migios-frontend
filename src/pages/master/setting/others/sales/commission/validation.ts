import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"

export const validationSchemaCommission = Yup.object().shape({
  id: Yup.number().optional().nullable(),
  club_id: Yup.number()
    .required("Club ID is required")
    .positive("Club ID must be a positive number")
    .integer("Club ID must be an integer"),
  sales: Yup.number()
    .required("Sales is required")
    .min(0, "Sales must be a non-negative number"),
  sales_type: Yup.string()
    .required("Sales type is required")
    .oneOf(
      ["percent", "nominal"],
      'Sales type must be either "percent" or "nominal"'
    ),
  service: Yup.number()
    .required("Service is required")
    .min(0, "Service must be a non-negative number"),
  session: Yup.number()
    .required("Session is required")
    .min(0, "Session must be a non-negative number"),
  class: Yup.number()
    .required("Class is required")
    .min(0, "Class must be a non-negative number"),
})

export type CreateCommissionSchema = Yup.InferType<
  typeof validationSchemaCommission
>
export type ReturnCommissionFormSchema = ReturnType<
  typeof useForm<CreateCommissionSchema>
>

export function useCommissionForm() {
  return useForm<CreateCommissionSchema>({
    resolver: yupResolver(validationSchemaCommission) as any,
    defaultValues: {
      sales: 0,
      sales_type: "percent",
      service: 0,
      session: 0,
      class: 0,
    },
  })
}

export function resetCommissionForm(form: ReturnCommissionFormSchema) {
  form.reset({
    ...form.getValues(),
  })
}
