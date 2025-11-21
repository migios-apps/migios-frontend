export interface TaxesType {
  id: number
  name: string
  rate: number
  enabled: boolean
}

export interface TaxesTypeResponse {
  data: TaxesType[]
}

export interface CreateTaxesType {
  name: string
  rate: number
  enabled?: boolean
}

export interface TaxDefaultSaleItemType {
  id?: number | null
  type: string
  tax_id: number
}

export interface TaxDefaultSaleItemTypeResponse {
  data: TaxDefaultSaleItemType[]
}

export interface CreateTaxDefaultSaleItemType {
  items: TaxDefaultSaleItemType[]
}

export interface CreateTaxCalculateType {
  tax_calculation: number //0 = price exclude tax, 1 = price include tax
}
