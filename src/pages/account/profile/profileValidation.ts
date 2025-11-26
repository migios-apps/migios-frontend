import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

export const validationSchemaEmployeeProfile = yup.object().shape({
  name: yup
    .string()
    .min(2, "Nama minimal 2 karakter")
    .required("Nama harus diisi"),
  phone: yup.string().required("Nomor telepon harus diisi"),
  identity_number: yup.string().required("Nomor identitas harus diisi"),
  identity_type: yup
    .string()
    .oneOf(["ktp", "kk", "passport", "other"], "Invalid Identity Type")
    .default("ktp")
    .required("Jenis identitas harus diisi"),
  birth_date: yup
    .date()
    .required("Tanggal lahir harus diisi")
    .typeError("Tanggal lahir harus diisi"),
  address: yup.string().optional(),
  gender: yup
    .string()
    .oneOf(["m", "f"], "Invalid Gender")
    .required("Jenis kelamin harus diisi"),
  specialist: yup.string().optional(),
})

export type EmployeeProfileSchema = yup.InferType<
  typeof validationSchemaEmployeeProfile
>

export type ReturnEmployeeProfileSchema = ReturnType<
  typeof useForm<EmployeeProfileSchema>
>

export const useEmployeeProfileValidation = (
  defaultValues?: EmployeeProfileSchema
) => {
  return useForm<EmployeeProfileSchema>({
    resolver: yupResolver(validationSchemaEmployeeProfile) as any,
    defaultValues: {
      name: "",
      phone: "",
      identity_number: "",
      identity_type: "ktp",
      birth_date: undefined,
      address: "",
      gender: "m",
      specialist: "",
      ...defaultValues,
    },
  })
}

export const resetEmployeeProfileForm = (
  form: ReturnEmployeeProfileSchema,
  defaultValues?: EmployeeProfileSchema
) => {
  form.reset({
    name: "",
    phone: "",
    identity_number: "",
    identity_type: "ktp",
    birth_date: undefined,
    address: "",
    gender: "m",
    specialist: "",
    ...defaultValues,
  })
}
