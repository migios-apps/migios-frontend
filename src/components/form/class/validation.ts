import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { validationSchemaTrainer } from "../package/package"

export const LevelClassOptions = [
  { label: "Mudah", value: 1 },
  { label: "Sedang", value: 2 },
  { label: "Sulit", value: 3 },
]

export const AvailableForOptions = [
  { label: "Semua", value: 0 },
  { label: "Pria", value: 1 },
  { label: "Wanita", value: 2 },
]

export const VisibleForOptions = [
  { label: "Publik", value: 0 },
  { label: "Pribadi", value: 1 },
]

export const ClassTypeOptions = [
  { label: "Offline", value: 0 },
  { label: "Online", value: 1 },
]

export const IsPublishOptions = [
  { label: "Draf", value: 0 },
  { label: "Terbit", value: 1 },
]

export const DurationTimeTypeOptions = [
  { label: "Menit", value: "minute" },
  { label: "Jam", value: "hour" },
  // { label: "Day", value: "day" },
  // { label: "Week", value: "week" },
  // { label: "Month", value: "month" },
  // { label: "Year", value: "year" },
  // { label: "Forever", value: "forever" },
]

export const WeekdayOptions = [
  { label: "Minggu", value: 0 },
  { label: "Senin", value: 1 },
  { label: "Selasa", value: 2 },
  { label: "Rabu", value: 3 },
  { label: "Kamis", value: 4 },
  { label: "Jumat", value: 5 },
  { label: "Sabtu", value: 6 },
]

export const validationSchemaClassPage = yup.object().shape({
  id: yup.number().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().required("Nama wajib diisi"),
  capacity: yup.number().required("Kapasitas wajib diisi"),
  level: yup.number().optional().nullable(),
  burn_calories: yup.number().optional().nullable(),
  description: yup
    .string()
    .max(150, "Maksimal 150 karakter")
    .optional()
    .nullable(),
  allow_all_instructor: yup.boolean().default(false),
  enabled: yup.boolean().default(true),
  start_date: yup.string().required("Tanggal mulai wajib diisi"),
  end_date: yup
    .string()
    .nullable()
    .when("is_forever", {
      is: (is_forever: boolean) => is_forever === false,
      then: (schema) => schema.required("Tanggal selesai wajib diisi"),
      otherwise: (schema) => schema.nullable().optional(),
    }),
  is_forever: yup.boolean().default(false),
  is_publish: yup.number().required("Status publikasi wajib diisi"),
  available_for: yup.number().required("Ketersediaan wajib diisi"),
  visible_for: yup.number().required("Visibilitas wajib diisi"),
  class_type: yup.number().required("Tipe kelas wajib diisi"),
  embed_video: yup.string().optional().nullable(),
  background_color: yup.string().required("Warna latar wajib diisi"),
  color: yup.string().required("Warna wajib diisi"),
  start_time: yup.string().required("Waktu mulai wajib diisi"),
  duration_time: yup.number().required("Durasi waktu wajib diisi"),
  duration_time_type: yup
    .string()
    .oneOf(["minute", "hour", "day", "week", "month", "year", "forever"])
    .required("Tipe durasi waktu wajib diisi"),
  instructors: yup
    .array()
    .of(validationSchemaTrainer)
    .when("allow_all_instructor", {
      is: (allow_all_instructor: boolean) => allow_all_instructor === false,
      then: (schema) =>
        schema
          .required("Instruktur wajib diisi")
          .min(1, "Minimal satu instruktur wajib diisi"),
    })
    .optional(),
  weekdays_available: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.number().min(0).max(6).required(),
      })
    )
    .required("Hari tersedia wajib diisi")
    .min(1, "Minimal satu hari wajib dipilih"),
  class_photos: yup.array().of(yup.string()).optional(),
  category: yup
    .object({
      id: yup.number().required("ID Kategori wajib diisi"),
      name: yup.string().required("Nama kategori wajib diisi"),
    })
    .optional()
    .nullable(),
})

export type ClassPageFormSchema = yup.InferType<
  typeof validationSchemaClassPage
>
export type ReturnClassPageFormSchema = ReturnType<
  typeof useForm<ClassPageFormSchema>
>

const defaultValues = {
  enabled: true,
  allow_all_instructor: false,
  is_forever: false,
  is_publish: 0,
  available_for: 0,
  visible_for: 0,
  class_type: 0,
  duration_time_type: "minute" as const,
}

export const useClassPageForm = () => {
  return useForm<ClassPageFormSchema>({
    resolver: yupResolver(validationSchemaClassPage) as any,
    defaultValues,
  })
}

export const resetClassPageForm = (form: ReturnClassPageFormSchema) => {
  form.reset({
    ...defaultValues,
  })
}

// category

export const validationSchemaClassCategoryPage = yup.object().shape({
  id: yup.number().optional().nullable(),
  name: yup.string().required("Nama wajib diisi"),
})

export type ClassCategoryPageFormSchema = yup.InferType<
  typeof validationSchemaClassCategoryPage
>
export type ReturnClassCategoryPageFormSchema = ReturnType<
  typeof useForm<ClassCategoryPageFormSchema>
>

export const useClassCategoryPageForm = () => {
  return useForm<ClassCategoryPageFormSchema>({
    resolver: yupResolver(validationSchemaClassCategoryPage) as any,
    defaultValues: {},
  })
}

export const resetClassCategoryPageForm = (
  form: ReturnClassCategoryPageFormSchema
) => {
  form.reset({
    ...{},
  })
}
