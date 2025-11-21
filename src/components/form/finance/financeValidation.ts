import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaRekening = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Name is required"),
  number: yup.string().optional().nullable(),
  balance: yup.number().required("Balance is required"),
  enabled: yup.boolean().default(true).required("Enabled is required"),
  show_in_payment: yup.number().required("Show in payment is required"),
})

export type CreateRekeningSchema = yup.InferType<
  typeof validationSchemaRekening
>
export type ReturnRekeningFormSchema = ReturnType<
  typeof useForm<CreateRekeningSchema>
>

const defaultValuesRekening = {
  enabled: true,
  show_in_payment: 1,
}

export const useRekeningForm = () => {
  return useForm<CreateRekeningSchema>({
    resolver: yupResolver(validationSchemaRekening) as any,
    defaultValues: {
      ...defaultValuesRekening,
    },
  })
}

export const resetRekeningForm = (form: ReturnRekeningFormSchema) => {
  form.reset({
    ...defaultValuesRekening,
  })
}

export const validationSchemaCategory = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required").oneOf(["income", "expense"]),
})

export type CreateCategorySchema = yup.InferType<
  typeof validationSchemaCategory
>
export type ReturnCategoryFormSchema = ReturnType<
  typeof useForm<CreateCategorySchema>
>

export const useCategoryForm = () => {
  return useForm<CreateCategorySchema>({
    resolver: yupResolver(validationSchemaCategory) as any,
    defaultValues: {},
  })
}

export const resetCategoryForm = (form: ReturnCategoryFormSchema) => {
  form.reset({
    ...{},
  })
}

export const validationSchemaFinancialRecord = yup.object().shape({
  id: yup.number().optional().nullable(),
  category: yup
    .object({
      id: yup.number().required("Category ID is required"),
      name: yup.string().required("Category name is required"),
      type: yup.string().required("Category type is required"),
    })
    .required("Category is required"),
  rekening: yup
    .object({
      id: yup.number().required("Rekening ID is required"),
      name: yup.string().required("Rekening name is required"),
      enabled: yup.boolean().required("Rekening enabled is required"),
    })
    .required("Rekening is required"),
  amount: yup.number().required("Amount is required"),
  type: yup.string().required("Type is required"),
  description: yup.string().optional().nullable(),
  editable: yup.boolean().default(true).required("Editable is required"),
  date: yup
    .date()
    .required("Date is required")
    .typeError("Date must be a valid date"),
})

export type CreateFinancialRecordSchema = yup.InferType<
  typeof validationSchemaFinancialRecord
>
export type ReturnFinancialRecordFormSchema = ReturnType<
  typeof useForm<CreateFinancialRecordSchema>
>

export const useFinancialRecordForm = () => {
  return useForm<CreateFinancialRecordSchema>({
    resolver: yupResolver(validationSchemaFinancialRecord) as any,
    defaultValues: {},
  })
}

export const resetFinancialRecordForm = (
  form: ReturnFinancialRecordFormSchema
) => {
  form.reset({
    ...{},
  })
}
