import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import parseToDecimal from "@/utils/parseToDecimal"

export const validationSchemaProduct = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Name is required"),
  description: yup.string().optional().nullable(),
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
  photo: yup.string().optional().nullable(),
  quantity: yup.number().required("Quantity is required"),
  sku: yup.string().optional().nullable(),
  code: yup.string().optional().nullable(),
  hpp: yup
    .number()
    .transform((_, originalValue) => {
      if (!originalValue) return null
      const num = parseToDecimal(originalValue)
      return num === 0 && originalValue !== 0 && originalValue !== "0"
        ? null
        : num
    })
    .typeError("HPP must be a valid number")
    .positive("HPP must be positive")
    .nullable()
    .optional(),
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
  enable_commission: yup.number().min(0).max(1).default(0),
})

export type CreateProductSchema = yup.InferType<typeof validationSchemaProduct>
export type ReturnProductFormSchema = ReturnType<
  typeof useForm<CreateProductSchema>
>

export function useProductForm() {
  return useForm<CreateProductSchema>({
    resolver: yupResolver(validationSchemaProduct) as any,
    defaultValues: {
      enable_commission: 0,
    },
  })
}

export function resetProductForm(form: ReturnProductFormSchema) {
  form.reset({
    ...{},
  })
}
