import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaChangeStatus = yup.object().shape({
  id: yup.number().required("Cutting Session is required"),
  status: yup.number().required("Status is required"),
  notes: yup.string().optional().nullable(),
})

export type ChangeStatusFormSchema = yup.InferType<
  typeof validationSchemaChangeStatus
>
export type ReturnChangeStatusFormSchema = ReturnType<
  typeof useForm<ChangeStatusFormSchema>
>

const defaultValues = {
  notes: null,
}

export const useChangeStatusForm = () => {
  return useForm<ChangeStatusFormSchema>({
    resolver: yupResolver(validationSchemaChangeStatus) as any,
    defaultValues,
  })
}

export const resetChangeStatusForm = (form: ReturnChangeStatusFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}
