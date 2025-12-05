import { ApiTypes, MetaApi } from "./api"
import { PackageProductLoyaltyPointDto } from "./package"

export type ItemType = "package" | "product" | "freeze"
export type DurationType = "day" | "month" | "year"
export type DiscountType = "percent" | "nominal"
export type PaymentStatus = 0 | 1 | 2 | 3 // 0 = belum bayar, 1 = bayar semua, 2 = bayar sebagian. 3 = bayar sebagian dan aktifkan member package jika terdapat package
export type PackageType = "membership" | "pt_program" | "class"
export type TransactionStatus =
  | "unpaid"
  | "paid"
  | "part_paid"
  | "overdue"
  | "refunded"
  | "void"
  | "pending"
  | "completed"

export interface SalesItem {
  item_type: ItemType
  trainer_id?: number
  package_id?: number
  product_id?: number
  name?: string
  quantity: number
  price: number
  sell_price?: number
  discount_type?: DiscountType | null
  discount?: number | null
  duration?: number | null
  duration_type?: DurationType | null
  session_duration?: number | null
  extra_session?: number | null
  extra_day?: number | null
  start_date?: string | null
  end_date?: string | null
  notes?: string | null

  // custom fields
  is_promo?: number
  loyalty_point?: number
  package_type?: PackageType | null
}

interface Payment {
  amount: number
  id: number
  //   reference_no: string
  //   notes?: string
  //   payment_date: string
}

interface RefundFromItem {
  id: number
  amount: number
  //   notes?: string
}

export interface CheckoutRequest {
  transaction_id?: number
  club_id: number
  member_id?: number
  discount_type: DiscountType
  discount?: number
  tax_rate?: number
  is_paid: PaymentStatus
  due_date?: string
  notes?: string
  items: SalesItem[]
  loyalty_redeem_items?: Array<{
    id: number
    points_required: number
  }>
  payments: Payment[]
  refund_from: RefundFromItem[]
}

export interface UpdateSalesPaymentDto {
  transaction_id: number
  is_paid: number
  balance: number
  payments: {
    id: number
    amount: number
    payment_date: string
  }[]
}

export interface RefundSalesDto {
  transaction_id: number
  club_id: number
  member_id: number
  employee_id: number
  is_paid: number
  due_date: string
  notes: string
  items: {
    trainer_id: number
    item_type: string
    package_id?: number
    product_id?: number
    quantity: number
    price: number
  }[]
  payments: {
    id: number
    amount: number
    payment_date: string
  }[]
}

export interface SalesType {
  id: number
  code: string
  member_id: number
  club_id: number
  employee_id: number
  type: string
  discount_type: string
  discount: number
  total_tax: number
  total_discount: number
  total_amount: number
  status: string
  is_paid: number
  is_refunded: number
  flag: any
  due_date: string
  notes: any
  billing_address: any
  shipping_address: any
  created_at: string
  updated_at: string
  is_void: number
  ballance_amount: number
  return_amount: number
  subtotal: number
  member: {
    id: number
    code: string
    name: string
    photo: string
    email: string
  }
  employee: {
    id: number
    code: string
    name: string
    photo: string
    email: string
  }
  fstatus: string
  fdiscount: string
  fsubtotal: string
  ftotal_tax: string
  ftotal_discount: string
  ftotal_amount: string
  total_payments: number
  ftotal_payments: string
  freturn_amount: string
  fballance_amount: string
}

export type SalesTypeListResponse = Omit<ApiTypes, "data"> & {
  data: { data: SalesType[]; meta: MetaApi }
}

// sales detail
export interface SalesDetailType {
  id: number
  code: string
  member_id: number
  club_id: number
  employee_id: number
  type: string
  discount_type: string
  discount: number
  total_tax: number
  total_discount: number
  total_amount: number
  status: string
  is_paid: number
  is_refunded: number
  flag: string | null
  due_date: string
  notes: string
  billing_address: string
  shipping_address: string
  created_at: string
  updated_at: string
  is_void: number
  ballance_amount: number
  return_amount: number
  subtotal: number
  void_status: string | null
  void_date: string | null
  void_notes: string | null
  void_processed_by: number | null
  void_processed_at: string | null
  refund_status: string | null
  refund_date: string | null
  refund_notes: string | null
  refund_processed_by: number | null
  refund_processed_at: string | null
  point_earned: number
  point_redeemed: number
  fstatus: string
  fdiscount: string
  fsubtotal: string
  ftotal_tax: string
  ftotal_discount: string
  ftotal_amount: string
  freturn_amount: string
  fballance_amount: string
  subtotal_net_amount: number
  fsubtotal_net_amount: string

  member: {
    id: number
    code: string
    name: string
    address: string
    gender: string
    phone: string
    photo: string | null
    email: string
  } | null
  employee?: {
    id: number
    name: string
    photo: string | null
  } | null
  items: {
    id: number
    transaction_id: number
    product_id: number | null
    package_id: number | null
    freeze_id: number | null
    item_type: "package" | "product"
    name: string
    description: string | null
    quantity: number
    qty_refund: number
    price: number
    subtotal: number
    discount_type: string
    discount: number
    total: number
    notes: string | null
    gross_amount: number
    discount_amount: number
    net_amount: number
    total_tax_amount: number
    total_amount: number
    duration_type: string | null
    duration: number
    session_duration: number
    extra_session: number
    extra_day: number
    start_date: string
    end_date: string | null
    created_at: string
    updated_at: string
    taxes: {
      id: number
      name: string
      rate: number
      amount: number
      frate: number
      famount: string
    }[]
    fprice: string
    fdiscount: string
    fgross_amount: string
    fdiscount_amount: string
    fnet_amount: string
    ftotal_tax_amount: string
    ftotal_amount: string
    subtotal_net_amount: number
    fsubtotal_net_amount: string
    product?: {
      id: number
      name: string
      description: string
      price: number
      photo: string
      quantity: number
      loyalty_point: PackageProductLoyaltyPointDto | null
      loyalty_point_value: number
    } | null
    package?: {
      id: number
      name: string
      duration_type: string
      duration: number
      session_duration: number
      photo: any
      type: string
      is_promo: number
      discount_type: string
      discount: number
      price: number
      sell_price: number
      max_member: any
      allow_all_trainer: boolean
      loyalty_point: PackageProductLoyaltyPointDto | null
      loyalty_point_value: number
    } | null
    trainer?: {
      id: number
      type: string
      code: string
      name: string
      phone: string
      email: string
      photo: string | null
      gender: string
    } | null
    freeze?: any | null
  }[]
  payments: {
    id: number
    transaction_id: number
    amount: number
    rekening_id: number
    status: string
    reference_no: string | null
    notes: string | null
    date: string
    created_at: string
    updated_at: string
    rekening_name: string
    famount: string
  }[]
  refunds: {
    id: number
    transaction_id: number
    amount: number
    rekening_id: number
    status: string
    reference_no: string | null
    notes: string | null
    date: string
    created_at: string
    updated_at: string
    rekening_name?: string
    famount?: string
  }[]
  club: {
    name: string
    domain: string
    address: string
    photo: string
    phone: string
    email: string
    country: string
    country_code: string
    state: string
    city: string
    village: string
    zip_code: string
  }
}

export type SalesDetailResponse = Omit<ApiTypes, "data"> & {
  data: SalesDetailType
}

// Refund types
export interface RefundItem {
  trainer_id?: number
  item_type: ItemType
  package_id?: number
  product_id?: number
  quantity: number
  price: number
}

export interface RefundPayment {
  amount: number
  id: number
  reference_no: string
  notes?: string
  payment_date: string
}

export interface RefundRequest {
  transaction_id: number
  club_id: number
  member_id: number
  employee_id: number
  is_paid: PaymentStatus
  due_date: string
  notes?: string
  items: RefundItem[]
  payments: RefundPayment[]
}
