export interface ApiTypes {
  data: unknown
  success: boolean
  status: number
}

type ConditionTypes =
  | "like"
  | "not like"
  | "is"
  | "is not"
  | "!="
  | ">="
  | "<="
  | "<"
  | ">"
  | "="

export interface Filter {
  search_column?: string
  search_text?: string
  search_condition?: ConditionTypes
  search_operator?: "AND" | "OR" | "and" | "or"
  [key: string]: any
}

export interface ApplySearchCondition extends Filter {
  search?: Filter[]
}

export interface Sort {
  sort_column: string
  sort_type?: "asc" | "desc"
  [key: string]: any
}

export interface ParamsFilter extends ApplySearchCondition {
  page?: number | string
  per_page?: number | string
  sort_column?: string
  sort_type?: "asc" | "desc"
  sort?: Sort[]
  [key: string]: any
}

export interface MetaApi {
  total: number
  page: number
  per_page: number
  total_page: number
}

export interface ErrorApi {
  error: {
    message: string
    error_code: number
  }
  status: number
  success: boolean
}
