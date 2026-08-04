import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import parseToDecimal from "@/utils/parseToDecimal"

const numberField = (label: string) =>
  yup
    .number()
    .transform((_, originalValue) => {
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      )
        return undefined
      return parseToDecimal(originalValue)
    })
    .typeError(`${label} harus berupa angka`)

export const validationSchemaVoucher = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Nama voucher wajib diisi"),
  description: yup.string().optional().nullable(),
  code: yup
    .string()
    .required("Kode voucher wajib diisi")
    .matches(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _"),
  discount_type: yup
    .string()
    .oneOf(["percent", "nominal"])
    .required("Tipe diskon wajib dipilih"),
  discount_value: numberField("Nilai diskon")
    .nullable()
    .min(0, "Nilai diskon tidak boleh negatif")
    .test(
      "wajib-diisi",
      "Nilai diskon wajib diisi",
      (value) => value !== null && value !== undefined
    )
    .when("discount_type", {
      is: "percent",
      then: (schema) => schema.max(100, "Diskon persen maksimal 100"),
    }),
  min_purchase: numberField("Minimal pembelian").nullable().min(0).optional(),
  max_discount: numberField("Maksimal diskon").nullable().min(0).optional(),
  max_usage: numberField("Kuota total").nullable().min(0).integer().optional(),
  max_usage_per_member: numberField("Kuota per member")
    .nullable()
    .min(0)
    .integer()
    .optional(),
  target: yup.string().oneOf(["public", "package_type"]).required(),
  package_types: yup
    .array()
    .of(yup.string().oneOf(["membership", "pt_program", "class"]))
    .when("target", {
      is: "package_type",
      then: (schema) => schema.min(1, "Pilih minimal satu jenis paket"),
    }),
  scope: yup.string().oneOf(["all", "specific_items"]).required(),
  scope_package_ids: yup
    .array()
    .of(yup.number().required())
    .default([])
    .test(
      "cakupan-item-wajib",
      "Pilih minimal satu paket atau produk",
      function (value) {
        if (this.parent.scope !== "specific_items") return true
        const products = (this.parent.scope_product_ids ?? []) as number[]
        return (value ?? []).length > 0 || products.length > 0
      }
    ),
  scope_product_ids: yup.array().of(yup.number().required()).default([]),
  enabled: yup.boolean().optional(),
  start_date: yup.string().required("Tanggal mulai wajib diisi"),
  expire_date: yup
    .string()
    .required("Tanggal berakhir wajib diisi")
    .test(
      "after-start",
      "Tanggal berakhir tidak boleh sebelum tanggal mulai",
      function (value) {
        const { start_date } = this.parent
        if (!value || !start_date) return true
        return new Date(value) >= new Date(start_date)
      }
    ),
})

export type VoucherFormSchema = yup.InferType<typeof validationSchemaVoucher>

export const voucherFormDefault: Partial<VoucherFormSchema> = {
  name: "",
  description: "",
  code: "",
  discount_type: "percent",
  discount_value: null,
  min_purchase: null,
  max_discount: null,
  max_usage: null,
  max_usage_per_member: null,
  target: "public",
  package_types: [],
  scope: "all",
  scope_package_ids: [],
  scope_product_ids: [],
  enabled: true,
  start_date: "",
  expire_date: "",
}

export const useVoucherForm = () =>
  useForm({
    resolver: yupResolver(validationSchemaVoucher),
    defaultValues: voucherFormDefault as VoucherFormSchema,
    mode: "onChange",
  })

export const resetVoucherForm = (
  formProps: ReturnType<typeof useVoucherForm>
) => formProps.reset(voucherFormDefault as VoucherFormSchema)
