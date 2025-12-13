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
  specialist: string
  flag: number
  join_date: string
  enabled: boolean
  created_at?: string
  updated_at?: string
}

export interface EmployeeDetailPage extends EmployeeDetail {
  total_pt_program: number
  total_class: number
  total_members: number
  earnings: {
    base_salary: number
    sales: number
    sales_type: "nominal" | "percent"
    service: number
    session: number
    class: number
    fbase_salary: string
    fsales: string
    fservice: string
    fsession: string
    fclass: string
  }
  roles: {
    id: number
    name: string
    display_name: string
    description: string
  }[]
}

export type EmployeeListTypeResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeDetail[]; meta: MetaApi }
}

export interface EmployeeCommissionType {
  id: number
  employee_id: number
  due_date: string
  type: string
  created_at: string
  updated_at: string
  package_id?: number | null
  session_id?: number | null
  transaction_id?: number | null
  notes: string
  amount: number
  famount: string
}

export type EmployeeCommissionListTypeResponse = Omit<ApiTypes, "data"> & {
  data: { data: EmployeeCommissionType[]; meta: MetaApi }
}

export interface EmployeeHeadType {
  total_sales: string
  total_session: string
  total_class: string
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
  specialist?: string | null
  join_date: string
  enabled: boolean
  earnings?: {
    base_salary?: number
    sales?: number
    sales_type?: "nominal" | "percent"
    service?: number
    session?: number
    class?: number
  }
  roles?: Role[]
}
