import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as Yup from "yup"

// Skema validasi untuk payment
export const validationPaymentSchema = Yup.object().shape({
  balance_amount: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Jumlah pembayaran diperlukan")
    .min(0, "Jumlah pembayaran tidak boleh negatif"),
  payments: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required("ID metode pembayaran diperlukan"),
        name: Yup.string().required("Nama metode pembayaran diperlukan"),
        amount: Yup.number()
          .transform((value) => (isNaN(value) ? undefined : value))
          .required("Jumlah pembayaran diperlukan")
          .min(1, "Jumlah pembayaran minimal 1"),
      })
    )
    .required("Metode pembayaran diperlukan")
    .test(
      "payment-amount-match",
      "Total pembayaran harus sesuai dengan jumlah yang harus dibayar",
      function (payments) {
        const { balance_amount } = this.parent

        // Jika tidak ada pembayaran, validasi gagal
        if (!payments || payments.length === 0) {
          return this.createError({
            message: "Metode pembayaran diperlukan",
            path: "payments",
          })
        }

        // Hitung total pembayaran
        const totalPayment = payments.reduce(
          (sum, payment) => sum + (payment.amount || 0),
          0
        )

        // Jika balance_amount adalah 0, maka pembayaran sudah lunas
        if (balance_amount === 0) {
          return true
        }

        // Jika total pembayaran tidak sama dengan balance_amount, validasi gagal
        if (totalPayment !== balance_amount) {
          return this.createError({
            message: `Total pembayaran (${totalPayment}) harus sama dengan jumlah yang harus dibayar (${balance_amount})`,
            path: "payments",
          })
        }

        return true
      }
    ),
  isPaid: Yup.number()
    .oneOf([0, 1, 2, 3], "Status pembayaran tidak valid")
    .required("Status pembayaran diperlukan"),
})

// Nilai default untuk form payment
export const defaultPaymentValues = {
  balance_amount: 0,
  payments: [],
  isPaid: 0,
}

// Tipe untuk skema validasi payment
export type ValidationPaymentSchema = Yup.InferType<
  typeof validationPaymentSchema
>

// Tipe untuk return dari useForm
export type ReturnPaymentFormSchema = ReturnType<
  typeof useForm<ValidationPaymentSchema>
>

// Hook untuk form payment
export const usePaymentForm = () => {
  return useForm<ValidationPaymentSchema>({
    resolver: yupResolver(validationPaymentSchema) as any,
    defaultValues: defaultPaymentValues,
  })
}

// Fungsi untuk reset form payment
export const resetPaymentForm = (form: ReturnPaymentFormSchema) => {
  form.reset({
    ...defaultPaymentValues,
  })
}
