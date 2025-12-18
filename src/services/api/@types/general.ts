export interface Specialization {
  id: number
  name_en: string
  name_id: string
}

export interface SpecializationCategory {
  id: number
  name_en: string
  name_id: string
  order: number
  specializations: Specialization[]
}

export interface SpecializationCategoryListResponse {
  data: SpecializationCategory[]
}
