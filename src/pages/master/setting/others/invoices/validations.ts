import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaInvoice = yup.object({
  companyName: yup.string().required("Company name is required"),
  companyAddress: yup.string().required("Company address is required"),
  invoiceTo: yup.string().required("Invoice to is required"),
  invoiceToAddress: yup.string().required("Invoice to address is required"),
  invoiceNumber: yup.string().required("Invoice number is required"),
  invoiceDate: yup.string().required("Invoice date is required"),
  salesName: yup.string().required("Sales name is required"),
  items: yup
    .array()
    .of(
      yup.object({
        description: yup.string().required("Description is required"),
        qty: yup
          .number()
          .positive("Quantity must be positive")
          .required("Quantity is required"),
        unitPrice: yup
          .number()
          .positive("Unit price must be positive")
          .required("Unit price is required"),
        discount: yup
          .number()
          .min(0, "Discount cannot be negative")
          .required("Discount is required"),
      })
    )
    .min(1, "At least one item is required"),
  paymentMethod: yup.string().required("Payment method is required"),
  paymentAmount: yup
    .number()
    .positive("Payment amount must be positive")
    .required("Payment amount is required"),
  outstanding: yup
    .number()
    .min(0, "Outstanding cannot be negative")
    .required("Outstanding is required"),
  termCondition: yup.string().required("Terms and conditions are required"),
  template: yup
    .string()
    .oneOf(
      ["default", "modern", "minimalist", "corporate"] as const,
      "Template harus dipilih"
    )
    .required("Template invoice harus dipilih"),
})

export type CreateInvoiceFormSchema = yup.InferType<
  typeof validationSchemaInvoice
>
export type ReturnCreateInvoiceFormSchema = ReturnType<
  typeof useForm<CreateInvoiceFormSchema>
>

export function useInvoiceForm(defaultValues?: CreateInvoiceFormSchema) {
  return useForm<CreateInvoiceFormSchema>({
    resolver: yupResolver(validationSchemaInvoice) as any,
    defaultValues: defaultValues,
  })
}

export function resetInvoiceForm(
  form: ReturnCreateInvoiceFormSchema,
  defaultValues?: CreateInvoiceFormSchema
) {
  form.reset({
    ...defaultValues,
  })
}
