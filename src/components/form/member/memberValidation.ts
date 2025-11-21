import { useForm } from "react-hook-form"
import { MemberDetail } from "@/services/api/@types/member"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import * as yup from "yup"

export const validationSchemaMember = yup.object().shape({
  code: yup.string().optional().nullable(),
  name: yup.string().required("Name is required"),
  address: yup.string().required("Address is required"),
  identity_number: yup.string().required("Identity Number is required"),
  identity_type: yup
    .string()
    .oneOf(["passport", "ktp", "sim"], "Invalid Identity Type")
    .required("Identity Type is required"),
  birth_date: yup
    .date()
    .required("Birth Date is required")
    .typeError("Birth Date must be a valid date"),
  gender: yup
    .string()
    .oneOf(["m", "f"], "Invalid Gender")
    .required("Gender is required"),
  phone: yup.string().required("Phone is required"),
  photo: yup.string().optional().nullable(),
  email: yup.string().email("Invalid email").required("Email is required"),
  join_date: yup
    .date()
    .required("Join Date is required")
    .typeError("Join Date must be a valid date"),
  notes: yup.string().optional().nullable(),
  goals: yup.string().optional().nullable(),
  height_cm: yup.number().optional().nullable(),
  enabled: yup.boolean().default(true),
})

export type CreateMemberSchema = yup.InferType<typeof validationSchemaMember>
export type ReturnMemberSchema = ReturnType<typeof useForm<CreateMemberSchema>>

export const useMemberValidation = () => {
  return useForm<CreateMemberSchema>({
    resolver: yupResolver(validationSchemaMember) as any,
    defaultValues: {
      identity_type: "ktp",
      join_date: dayjs().toDate(),
      enabled: true,
    },
  })
}

export const resetMemberForm = (form: ReturnMemberSchema) => {
  form.reset({
    identity_type: "ktp",
    join_date: dayjs().toDate(),
    enabled: true,
  })
}

export const setMemberForm = (
  formProps: ReturnMemberSchema,
  data: MemberDetail
) => {
  formProps.setValue("code", data.code)
  formProps.setValue("name", data.name)
  formProps.setValue("address", data.address)
  formProps.setValue("identity_number", data.identity_number)
  formProps.setValue("identity_type", data.identity_type as any)
  formProps.setValue("birth_date", dayjs(data.birth_date).toDate())
  formProps.setValue("gender", data.gender as any)
  formProps.setValue("phone", data.phone)
  formProps.setValue("photo", data.photo)
  formProps.setValue("email", data.email)
  formProps.setValue("join_date", dayjs(data.join_date).toDate())
  formProps.setValue("notes", data.notes)
  // formProps.setValue('private_notes', data.private_notes)
  formProps.setValue("goals", data.goals)
  formProps.setValue("height_cm", data.height_cm)
  formProps.setValue("enabled", data.enabled)
}
