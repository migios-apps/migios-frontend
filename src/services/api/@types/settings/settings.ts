export interface SettingsType {
  id: number
  club_id: number
  tax_calculation: number
  loyalty_enabled: number
  taxes: {
    id: number
    type: string
    tax_id: number
    name: string
    rate: number
  }[]
}

export interface SettingsTypeResponse {
  data: SettingsType
}
