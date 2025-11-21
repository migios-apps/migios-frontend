import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaRolePermission = yup.object().shape({
  id: yup.number().optional().nullable(),
  display_name: yup.string().required("Role name wajib diisi"),
  description: yup.string().nullable(),
  permissions: yup.array().min(1, "Minimal satu permission harus dipilih"),
})

export type CreateRolePermissionFormSchema = yup.InferType<
  typeof validationSchemaRolePermission
>
export type ReturnRolePermissionFormSchema = ReturnType<
  typeof useForm<CreateRolePermissionFormSchema>
>

export function useRolePermissionForm() {
  return useForm<CreateRolePermissionFormSchema>({
    resolver: yupResolver(validationSchemaRolePermission) as any,
    defaultValues: {
      display_name: "",
      description: "",
      permissions: [],
    },
  })
}

export function resetRolePermissionForm(form: ReturnRolePermissionFormSchema) {
  form.reset({
    ...{
      display_name: "",
      description: "",
      permissions: [],
    },
  })
}
