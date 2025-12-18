import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"

export const validationSchemaCommission = Yup.object().shape({
  id: Yup.number().optional().nullable(),
  club_id: Yup.number()
    .required("Club ID is required")
    .positive("Club ID must be a positive number")
    .integer("Club ID must be an integer"),
  commission_sales_by_item_before_tax: Yup.number()
    .optional()
    .min(0, "Must be 0 or 1")
    .max(1, "Must be 0 or 1")
    .integer("Must be an integer"),
  commission_sales_by_item_before_discount: Yup.number()
    .optional()
    .min(0, "Must be 0 or 1")
    .max(1, "Must be 0 or 1")
    .integer("Must be an integer"),
  commission_prorate_by_total_sales: Yup.number()
    .optional()
    .min(0, "Must be 0 or 1")
    .max(1, "Must be 0 or 1")
    .integer("Must be an integer"),
  service: Yup.number()
    .optional()
    .min(0, "Service must be a non-negative number"),
  session: Yup.number()
    .optional()
    .min(0, "Session must be a non-negative number"),
  class: Yup.number().optional().min(0, "Class must be a non-negative number"),
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
      commission_sales_by_item_before_tax: 0,
      commission_sales_by_item_before_discount: 0,
      commission_prorate_by_total_sales: 0,
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
