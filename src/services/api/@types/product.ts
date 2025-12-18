import { ApiTypes, MetaApi } from "./api"
import { PackageProductLoyaltyPointDto } from "./package"

export interface ProductDetail {
  id: number
  club_id: number
  name: string
  description: string
  price: number
  photo: string
  quantity: number
  sku: string
  code: string
  hpp?: number | null
  enable_commission: number
  created_at: string
  updated_at: string
  fprice: string
  fhpp?: string | null
  loyalty_point_value: number
  loyalty_point: PackageProductLoyaltyPointDto | null
}

export interface CreateProduct {
  club_id: number
  name: string
  description?: string | null
  price: number
  photo?: string | null
  quantity: number
  sku?: string | null
  code?: string | null
  hpp?: number | null
  enable_commission?: number
  loyalty_point?: PackageProductLoyaltyPointDto | null
}

export type ProductListResponse = Omit<ApiTypes, "data"> & {
  data: { data: ProductDetail[]; meta: MetaApi }
}
