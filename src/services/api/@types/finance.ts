import { ApiTypes, MetaApi } from "./api"

// rekening
export interface RekeningDetail {
  id: number
  name: string
  number: string
  balance: number
  enabled: boolean
  club_id: number
  show_in_payment: number
  created_at: string
  updated_at: string
  fbalance: string
}

export type RekeningDetailListResponse = Omit<ApiTypes, "data"> & {
  data: { data: RekeningDetail[]; meta: MetaApi }
}

export interface CreateRekening {
  name: string
  number?: string | null
  balance: number
  enabled: boolean
  club_id: number
  show_in_payment: number
}

// category
export interface CategoryDetail {
  id: number
  name: string
  type: string
  club_id: number
  created_at: string
  updated_at: string
}

export type CategoryDetailListResponse = Omit<ApiTypes, "data"> & {
  data: { data: CategoryDetail[]; meta: MetaApi }
}

export interface CreateCategory {
  name: string
  type: string
  club_id: number
}

// financial record
export interface CreateFinancialRecord {
  club_id: number
  transaction_id?: any
  product_id?: any
  package_id?: any
  financial_category_id: number
  rekening_id: number
  amount: number
  type: string
  description?: string
  editable: boolean
  date: string
}

export interface FinancialRecordDetail {
  id: number
  user_id?: number | null
  club_id: number
  transaction_id?: number | null
  product_id?: number | null
  package_id?: number | null
  financial_category_id?: number | null
  financial_rekening_id: number
  amount: number
  type: string
  description: string
  editable: boolean
  date: Date | string
  created_at: string
  updated_at: string
  rekening_name: string
  categories_name?: string | null
  packages_name?: string | null
  code?: string | null
  product_name?: string | null
  rekenings?: {
    id: number
    name: string
    number: string
    enabled: boolean
  }
  categories?: {
    id: number
    name: string
    type: string
  }
  packages?: {
    id: number
    name: string
  }
  products?: {
    id: number
    name: string
  }
  transactions?: {
    id: number
    code: string
  }
  famount: string
}

export type FinancialRecordDetailListResponse = Omit<ApiTypes, "data"> & {
  data: { data: FinancialRecordDetail[]; meta: MetaApi }
}
