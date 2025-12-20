import { ApiTypes, MetaApi } from "./api"
import { Role } from "./settings/role"

export interface EmployeeDetail {
  id: number
  user_id: number
  club_id: number
  code: string
  name: string
  identity_number: string
  identity_type: "passport" | "ktp" | "sim"
  birth_date: string
  address: string
  photo?: string
  description?: string
  phone: string
  email: string
  gender: string
  specializations: {
    id: number
    name_id: string
    name_en: string
  }[]
  flag: number
  join_date: string
  enabled: boolean
  created_at?: string
  updated_at?: string
  roles: {
    id: number
    name: string
    display_name: string
    description: string
  }[]
}

export interface EmployeeDetailPage extends EmployeeDetail {
  total_pt_program: number
  total_class: number
  total_members: number
  earnings: {
    base_salary: number
    service: number
    session: number
    class: number
    default_sales_product_commission: number
    default_sales_product_commission_type: "percent" | "nominal"
    default_sales_product_commission_amount: number
    default_sales_package_commission: number
    default_sales_package_commission_type: "percent" | "nominal"
    default_sales_package_commission_amount: number
    fbase_salary: string
    fservice: string
    fsession: string
    fclass: string
  }
}

export type EmployeeListTypeResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeDetail[]; meta: MetaApi }
}

export interface EmployeeCommissionType {
  id: number
  employee_id: number
  due_date: string
  type: string
  amount: number
  session_id: number | null
  package_id: number | null
  product_id: number | null
  transaction_id: number | null
  notes: string | null
  employee_code: string
  transaction_code: string | null
  product?: {
    id: number
    name: string
  } | null
  package?: {
    id: number
    name: string
  } | null
  famount: string
}

export type EmployeeCommissionListTypeResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeCommissionType[]; meta: MetaApi }
}

export interface EmployeeHeadType {
  total_sales: number
  total_completed_session: number
  total_completed_class: number
  total_commission_amount: number
  ftotal_commission_amount: string
}

export interface CreateEmployee {
  club_id: number
  name: string
  identity_number: string
  identity_type: string
  birth_date: string
  address: string
  photo: string | null
  description: string | null
  phone: string
  email: string
  gender: string
  specialization_ids?: number[]
  join_date: string
  enabled: boolean
  roles?: Role[]
  earnings?: {
    base_salary?: number
    service?: number
    session?: number
    class?: number
    default_sales_product_commission?: number
    default_sales_product_commission_type?: "percent" | "nominal"
    default_sales_product_commission_amount?: number
    default_sales_package_commission?: number
    default_sales_package_commission_type?: "percent" | "nominal"
    default_sales_package_commission_amount?: number
  }
  commission_product?: {
    product_id: number
    sales_type: string
    sales: number
    commission_type: string
  }[]
  commission_package?: {
    package_id: number
    sales_type: string
    sales: number
    commission_type: string
  }[]
}

export interface EmployeeCommissionPackage {
  package_id: number
  name: string
  price: number
  discount_type: string
  discount: number
  sell_price: number
  type: string
  is_promo: number
  sales_type: string
  sales: number
  commission_type: string
  classes: {
    id: number
    name: string
    photo: string | null
  }[]
  fsales: string
  fprice: string
}

export type EmployeeCommissionPackageListResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeCommissionPackage[]; meta: MetaApi }
}

export interface EmployeeCommissionProduct {
  product_id: number
  name: string
  price: number
  sales_type: string
  sales: number
  commission_type: string
  fsales: string
  fprice: string
}

export type EmployeeCommissionProductListResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeCommissionProduct[]; meta: MetaApi }
}
