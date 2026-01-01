import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { dayjs } from "@/utils/dayjs"

export const validationSchemaEmployee = yup.object().shape({
  code: yup.string().optional().nullable(),
  photo: yup.string().optional().nullable(),
  name: yup.string().optional().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  identity_number: yup.string().required("Identity number is required"),
  identity_type: yup
    .string()
    .oneOf(["passport", "ktp", "sim"], "Invalid Identity Type")
    .required("Identity type is required"),
  birth_date: yup
    .date()
    .required("Birth Date is required")
    .typeError("Birth Date must be a valid date"),
  join_date: yup
    .date()
    .required("Join Date is required")
    .typeError("Join Date must be a valid date"),
  gender: yup.string().required("Gender is required"),
  specializations: yup
    .array()
    .of(
      yup.object().shape({
        value: yup.mixed().required(),
        label: yup.string().required(),
      })
    )
    .optional()
    .default([]),
  address: yup.string().required("Address is required"),
  description: yup.string().optional().nullable(),
  enabled: yup.boolean().default(true),
  earnings: yup.object().shape({
    base_salary: yup.number().required("Base Salary is required"),
    service: yup.number().optional().default(0),
    session: yup.number().optional().default(0),
    class: yup.number().optional().default(0),
    // Default sales product commission
    default_sales_product_commission: yup
      .number()
      .optional()
      .min(0, "Must be 0 or 1")
      .max(1, "Must be 0 or 1")
      .integer("Must be an integer")
      .default(0),
    default_sales_product_commission_type: yup
      .string()
      .optional()
      .oneOf(["nominal", "percent"], "Invalid commission type")
      .default("nominal"),
    default_sales_product_commission_amount: yup
      .number()
      .min(0, "Amount must be non-negative")
      .default(0),
    // Default sales package commission
    default_sales_package_commission: yup
      .number()
      .min(0, "Must be 0 or 1")
      .max(1, "Must be 0 or 1")
      .integer("Must be an integer")
      .default(0),
    default_sales_package_commission_type: yup
      .string()
      .oneOf(["nominal", "percent"], "Invalid commission type")
      .default("nominal"),
    default_sales_package_commission_amount: yup
      .number()
      .min(0, "Amount must be non-negative")
      .default(0),
  }),
  commission_product: yup.array().of(
    yup.object().shape({
      product_id: yup.number().required("Product ID is required"),
      sales_type: yup.string().required("Product Sales Type is required"),
      sales: yup.number().required("Product Sales is required"),
      commission_type: yup
        .string()
        .required("Product Commission Type is required"),
    })
  ),
  commission_package: yup.array().of(
    yup.object().shape({
      package_id: yup.number().required("Package ID is required"),
      sales_type: yup.string().required("Package Sales Type is required"),
      sales: yup.number().required("Package Sales is required"),
      commission_type: yup
        .string()
        .required("Package Commission Type is required"),
    })
  ),
  roles: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.number().required("Role ID is required"),
        name: yup.string().required("Role Name is required"),
      })
    )
    .required("Role is required")
    .min(1, "Role is required"),
})

export type CreateEmployeeSchema = yup.InferType<
  typeof validationSchemaEmployee
>
export type ReturnEmployeeSchema = ReturnType<
  typeof useForm<CreateEmployeeSchema>
>

export const useEmployeeValidation = (defaultValues?: CreateEmployeeSchema) => {
  return useForm<CreateEmployeeSchema>({
    resolver: yupResolver(validationSchemaEmployee) as any,
    defaultValues: {
      identity_type: "ktp",
      join_date: dayjs().toDate(),
      enabled: true,
      specializations: [],
      earnings: {
        base_salary: 0,
        service: 0,
        session: 0,
        class: 0,
        default_sales_product_commission: 1,
        default_sales_product_commission_type: "nominal",
        default_sales_product_commission_amount: 0,
        default_sales_package_commission: 1,
        default_sales_package_commission_type: "nominal",
        default_sales_package_commission_amount: 0,
      },
      ...defaultValues,
    },
  })
}

export const resetEmployeeForm = (
  form: ReturnEmployeeSchema,
  defaultValues?: CreateEmployeeSchema
) => {
  form.reset({
    identity_type: "ktp",
    join_date: dayjs().toDate(),
    enabled: true,
    specializations: [],
    earnings: {
      base_salary: 0,
      service: 0,
      session: 0,
      class: 0,
      default_sales_product_commission: 1,
      default_sales_product_commission_type: "nominal",
      default_sales_product_commission_amount: 0,
      default_sales_package_commission: 1,
      default_sales_package_commission_type: "nominal",
      default_sales_package_commission_amount: 0,
    },
    ...defaultValues,
  })
}
