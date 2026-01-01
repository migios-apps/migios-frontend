import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"
import { dayjs } from "@/utils/dayjs"

// {
//     "item_type": "freeze",
//     "name": "Freeze membership",
//     "start_date": "2025-03-11",
//     "end_date": "2025-03-18",
//     "quantity": 1,
//     "price": 50000,
//     "discount_type": "nominal",
//     "discount": 0,
//     "notes": "keluar kota"
// }

export const freezeItemSchema = Yup.object().shape({
  start_date: Yup.date().required("Start date is required for packages."),
  end_date: Yup.date().required("End date is required for packages."),
  notes: Yup.string().nullable(),
})

export type FreezeItemSchema = Yup.InferType<typeof freezeItemSchema>

export const validationTransactionFreezeSchema = Yup.object().shape({
  balance_amount: Yup.number().required("Balance amount is required."),
  tax_rate: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Tax rate cannot be negative.")
    .nullable(),
  notes: Yup.string().nullable(),
  items: Yup.array()
    .of(freezeItemSchema)
    .required("Freeze items are required.")
    .min(1, "At least one freeze item is required."),
  payments: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("Rekening ID is required."),
        name: Yup.string().required("Payment name is required."),
        amount: Yup.number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required("Payment amount is required.")
          .min(0, "Payment amount must be at least 0."),
      })
    )
    .required("Payments are required.")
    .min(0, "At least one payment is required."),
})

export const defaultValueTransactionFreeze: any = {
  discount_type: "nominal",
  discount: 0,
  tax_rate: 0,
  is_paid: 1,
  notes: null,
  items: [
    {
      start_date: dayjs().toDate(),
      end_date: dayjs().toDate(),
    },
  ],
  payments: [],
  refund_from: [],
}

export type ValidationTransactionFreezeSchema = Yup.InferType<
  typeof validationTransactionFreezeSchema
>

export type ReturnTransactionFreezeFormSchema = ReturnType<
  typeof useForm<ValidationTransactionFreezeSchema>
>

export const useTransactionFreezeForm = () => {
  return useForm<ValidationTransactionFreezeSchema>({
    resolver: yupResolver(validationTransactionFreezeSchema) as any,
    defaultValues: {
      ...defaultValueTransactionFreeze,
    },
  })
}

export const resetTransactionFreezeForm = (
  form: ReturnTransactionFreezeFormSchema
) => {
  form.reset({
    ...defaultValueTransactionFreeze,
  })
}
