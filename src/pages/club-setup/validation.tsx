import { useForm } from "react-hook-form"
import * as yup from "yup"

export const howdidfindus = [
  {
    label: "Mesin pencari (Google, Bing, dll.)",
    value: "Mesin pencari (Google, Bing, dll.)",
  },
  {
    label: "Industry partner",
    value: "Industry partner",
  },
  {
    label: "Facebook",
    value: "Facebook",
  },
  {
    label: "Instagram",
    value: "Instagram",
  },
  {
    label: "Tiktok",
    value: "Tiktok",
  },
  {
    label: "Reddit",
    value: "Reddit",
  },
  {
    label: "Lainnya",
    value: "Lainnya",
  },
]

export const profileClubSchema = yup.object().shape({
  name: yup.string().required("Nama klub diperlukan"),
  photo: yup.string().optional().nullable(),
  phone: yup.string().required("Telepon diperlukan"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email diperlukan"),
  address: yup.string().required("Alamat diperlukan"),
})

export const aboutCLubSchema = yup.object().shape({
  about_club: yup.object().shape({
    total_staff: yup.string().optional().nullable(),
    total_member: yup.string().optional().nullable(),
    total_location: yup.string().optional().nullable(),
    how_did_find_us: yup.string().optional().nullable(),
    is_other_find_us: yup.boolean().default(false),
  }),
})

export const programSchema = yup.object().shape({
  programs: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("Program name is required"),
        type: yup
          .string()
          .oneOf(["membership", "pt_program", "class"], "Invalid program type"),
        classes: yup.array().of(yup.string()).default([]),
      })
    )
    .default([]),
})

export const memberSchema = yup.object().shape({
  members: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required("Member name is required"),
        email: yup
          .string()
          .email("Invalid email format")
          .required("Email is required"),
        photo: yup.string().nullable(),
        address: yup.string().required("Address is required"),
        identity_number: yup.string().required("Identity number is required"),
        identity_type: yup
          .string()
          .oneOf(["ktp", "sim", "passport"], "Invalid identity type")
          .required(),
        birth_date: yup.date().required("Birth date is required"),
        gender: yup
          .string()
          .oneOf(["m", "f"], "Gender must be 'm' or 'f'")
          .required("Gender is required"),
        phone: yup.string().required("Phone is required"),
        notes: yup.string().nullable(),
        goals: yup.string().nullable(),
        join_date: yup.date().required("Join date is required"),
      })
    )
    .default([]),
})

export const subscriptionSchema = yup.object().shape({
  plan_type: yup
    .string()
    .oneOf(
      ["free", "basic", "premium", "pro", "growth", "enterprise"],
      "Pilih plan yang valid"
    )
    .required("Plan subscription diperlukan"),
  duration: yup.number().required("Durasi diperlukan"),
  duration_type: yup
    .string()
    .oneOf(
      ["day", "week", "month", "year", "forever"],
      "Tipe durasi tidak valid"
    )
    .required("Tipe durasi diperlukan"),
  amount: yup
    .number()
    .min(0, "Amount tidak boleh negatif")
    .required("Amount diperlukan"),
  payment_method: yup
    .string()
    .oneOf(
      ["credit_card", "bank_transfer", "paypal", "cash"],
      "Metode pembayaran tidak valid"
    )
    .required("Metode pembayaran diperlukan"),
})

export const allSchema = profileClubSchema
  .concat(aboutCLubSchema)
  .concat(programSchema)
  .concat(memberSchema)
  .concat(subscriptionSchema)

export const allaowNextSchema = yup.object().shape({})

export type FormValues = yup.InferType<typeof allSchema>
export type ReturnClubFormSchema = ReturnType<typeof useForm<FormValues>>

// export type ProfileClubSchema = yup.InferType<typeof profileClubSchema>

// export const useProfileClubForm = () => {
//   return useForm<ProfileClubSchema>({
//     resolver: yupResolver(profileClubSchema) as any,
//     defaultValues: {},
//   })
// }

// export const resetProfileClubForm = (form: ReturnProfileClubFormSchema) => {
//   form.reset({})
// }
