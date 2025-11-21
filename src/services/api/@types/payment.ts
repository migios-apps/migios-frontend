import { ApiTypes, MetaApi } from "./api"
import { Club } from "./club"
import { MemberDetail } from "./member"
import { PackageType } from "./package"

export interface PaymentSaleType {
  id: number
  member_id: number
  club_id: number
  transaction_id: number
  amount: number
  invoice_code: string
  issue_date: string
  due_date: string
  status: string
  fstatus: string
  created_at: string
  updated_at: string
  member: {
    id: number
    name: string
  }
  fprice: string
  current_payments: number
  fcurrent_payments: string
}

interface Item {
  id: number
  invoice_id: number
  package_id: number
  discount_type: string
  discount_amount: number
  discount: number
  hpp: number
  total_price: number
  tax_amount: number
  tax_rate: number
  quantity: number
  member_package_id: number
  created_at: string
  updated_at: string
  member_package: {
    id: number
    duration: number
    duration_type: string
    session_duration: number
    extra_session: number
    extra_day: number
    start_date: string
    end_date: string
    trainer_id: number | null
    status: string
    notes: string
    package: PackageType
    trainer: {
      name: string
    }
  }
  fdiscount_amount: string
  fdiscount: string
  fhpp: string
  ftax_amount: string
  ftotal_price: string
}

export interface InvoiceDetailType {
  id: number
  member_id: number
  club_id: number
  sales_id: number
  sales_name: string
  transaction_id: number
  invoice_code: string
  issue_date: string
  due_date: string
  status: string
  invoice_date: string
  created_at: string
  updated_at: string
  clubs: Club
  items: Item[]
  member: MemberDetail
  transaction: {
    id: number
    transaction_code: string
    member_id: number
    club_id: number
    type: string
    sale_type: string
    subtotal: number
    discount_type: string
    discount_amount: number
    discount: number
    tax_rate: number
    tax_amount: number
    amount: number
    status: string
    flag: any
    created_at: string
    updated_at: string
  }
  payments: {
    id: number
    transaction_id: number
    account_id: number
    invoice_id: number
    payment_date: string
    amount: number
    status: string
    created_at: string
    updated_at: string
    account_journals: {
      id: number
      name: string
    }
    fprice: string
  }[]
  subtotal: number
  grand_total: number
  discount: number
  total_payments: number
  outstanding_amount: number
  return: number
  fsubtotal: string
  fdiscount: string
  ftax_amount: string
  fgrand_total: string
  ftotal_payments: string
  foutstanding_amount: string
  freturn: string
}

export type PaymentSaleListResponse = Omit<ApiTypes, "data"> & {
  data: { data: PaymentSaleType[]; meta: MetaApi }
}

export type InvoiceDetailResponse = Omit<ApiTypes, "data"> & {
  data: InvoiceDetailType
}
