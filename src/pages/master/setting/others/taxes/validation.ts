import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

// Schema validasi untuk tambah pajak baru
const taxFormSchema = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Nama pajak harus diisi"),
  rate: yup
    .number()
    .typeError("Persentase harus berupa angka")
    .min(0, "Persentase minimal 0")
    .max(100, "Persentase maksimal 100")
    .required("Persentase harus diisi"),
})

export type CreateTaxSchema = yup.InferType<typeof taxFormSchema>
export type ReturnTaxFormSchema = ReturnType<typeof useForm<CreateTaxSchema>>

export function useTaxForm(defaultValues?: CreateTaxSchema) {
  return useForm<CreateTaxSchema>({
    resolver: yupResolver(taxFormSchema) as any,
    defaultValues: defaultValues || {},
  })
}

export function resetTaxForm(form: ReturnTaxFormSchema) {
  form.reset(
    {
      id: undefined,
      name: "",
      rate: null as unknown as number,
    },
    {
      keepDefaultValues: false,
    }
  )
}

// Schema validasi Yup
const standardRateSchema = yup.object().shape({
  standardRates: yup
    .array()
    .of(
      yup.object().shape({
        type: yup.string().required("Tipe harus diisi"),
        tax_id: yup.number().required("Pajak harus dipilih"),
      })
    )
    .default([]),
})

export type CreateStandardRateSchema = yup.InferType<typeof standardRateSchema>
export type ReturnStandardRateFormSchema = ReturnType<
  typeof useForm<CreateStandardRateSchema>
>

export function useStandardRateForm(defaultValues?: CreateStandardRateSchema) {
  return useForm<CreateStandardRateSchema>({
    resolver: yupResolver(standardRateSchema) as any,
    defaultValues: defaultValues || {
      standardRates: [],
    },
  })
}

export function resetStandardRateForm(form: ReturnStandardRateFormSchema) {
  form.reset(
    { standardRates: [] },
    {
      keepDefaultValues: false,
    }
  )
}
