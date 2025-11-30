import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaProduct = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Name is required"),
  description: yup.string().optional().nullable(),
  price: yup.number().required("Price is required"),
  photo: yup.string().optional().nullable(),
  quantity: yup.number().required("Quantity is required"),
  sku: yup.string().optional().nullable(),
  code: yup.string().optional().nullable(),
  hpp: yup.number().optional().nullable(),
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

export type CreateProductSchema = yup.InferType<typeof validationSchemaProduct>
export type ReturnProductFormSchema = ReturnType<
  typeof useForm<CreateProductSchema>
>

export function useProductForm() {
  return useForm<CreateProductSchema>({
    resolver: yupResolver(validationSchemaProduct) as any,
    defaultValues: {},
  })
}

export function resetProductForm(form: ReturnProductFormSchema) {
  form.reset({
    ...{},
  })
}
