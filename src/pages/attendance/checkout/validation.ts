import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaCheckOut = yup.object().shape({
  code: yup.string().optional().default(""),
})

export type CheckOutFormSchema = yup.InferType<typeof validationSchemaCheckOut>
export type ReturnCheckOutFormSchema = ReturnType<
  typeof useForm<CheckOutFormSchema>
>

export const useCheckOutValidation = () => {
  return useForm<CheckOutFormSchema>({
    resolver: yupResolver(validationSchemaCheckOut) as any,
  })
}

export const resetCheckOutValidation = (form: ReturnCheckOutFormSchema) => {
  form.reset({})
}
