import { ApiTypes, MetaApi } from "./api"

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
  created_at: string
  updated_at: string
  fprice: string
  fhpp?: string | null
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
}

export type ProductListResponse = Omit<ApiTypes, "data"> & {
  data: { data: ProductDetail[]; meta: MetaApi }
}
