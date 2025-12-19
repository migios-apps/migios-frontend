import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

// Tipe untuk reward item
const rewardItemSchema = yup.object().shape({
  product_id: yup.number().nullable(),
  package_id: yup.number().nullable(),
  quantity: yup.number().required("Jumlah item diperlukan").min(1, "Minimal 1"),
  name: yup.string().optional().nullable(),
  foriginal_price: yup.string().optional().nullable(),
  fprice: yup.string().optional().nullable(),
  price: yup.number().optional().nullable(),
})

// Schema validasi untuk loyalty point
const loyaltyFormSchema = yup.object().shape({
  id: yup.number().optional().nullable(),
  type: yup
    .string()
    .oneOf(["discount", "free_item"], "Tipe harus discount atau free_item")
    .required("Tipe reward harus diisi"),
  name: yup.string().when("type", {
    is: "free_item",
    then: (schema) => schema.required("Nama harus diisi"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  points_required: yup
    .number()
    .required("Jumlah poin diperlukan")
    .min(1, "Minimal 1 poin"),
  enabled: yup.boolean().default(true),
  is_forever: yup.boolean().default(false),
  start_date: yup.date().when("is_forever", {
    is: false,
    then: (schema) => schema.required("Tanggal mulai harus diisi"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  end_date: yup.date().when("is_forever", {
    is: false,
    then: (schema) =>
      schema
        .required("Tanggal berakhir harus diisi")
        .min(
          yup.ref("start_date"),
          "Tanggal berakhir harus setelah tanggal mulai"
        ),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  discount_type: yup.string().when("type", {
    is: "discount",
    then: (schema) =>
      schema
        .oneOf(["percent", "nominal"], "Tipe diskon harus percent atau nominal")
        .required("Tipe diskon diperlukan"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  discount_value: yup.number().when("type", {
    is: "discount",
    then: (schema) =>
      schema
        .required("Nilai diskon diperlukan")
        .min(1, "Nilai diskon minimal 1"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  reward_items: yup.array().when("type", {
    is: "free_item",
    then: (schema) =>
      schema
        .of(rewardItemSchema)
        .min(1, "Minimal harus ada 1 item reward")
        .required("Item reward diperlukan"),
    otherwise: (schema) => schema.optional().default([]),
  }),
})

export type CreateLoyaltySchema = yup.InferType<typeof loyaltyFormSchema>
export type ReturnLoyaltyFormSchema = ReturnType<
  typeof useForm<CreateLoyaltySchema>
>

export function useLoyaltyForm(defaultValues?: CreateLoyaltySchema) {
  return useForm<CreateLoyaltySchema>({
    resolver: yupResolver(loyaltyFormSchema) as any,
    defaultValues: defaultValues || {},
  })
}

export function resetLoyaltyForm(
  form: ReturnLoyaltyFormSchema,
  defaultValues?: CreateLoyaltySchema
) {
  form.reset(
    {
      ...defaultValues,
    },
    {
      keepDefaultValues: false,
    }
  )
}
