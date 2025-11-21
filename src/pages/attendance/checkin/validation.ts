import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaCheckIn = yup.object().shape({
  code: yup.string().optional().default(""),
})

export type CheckInFormSchema = yup.InferType<typeof validationSchemaCheckIn>
export type ReturnCheckInFormSchema = ReturnType<
  typeof useForm<CheckInFormSchema>
>

export const useCheckInValidation = () => {
  return useForm<CheckInFormSchema>({
    resolver: yupResolver(validationSchemaCheckIn) as any,
  })
}

export const resetCheckInValidation = (form: ReturnCheckInFormSchema) => {
  form.reset({})
}
