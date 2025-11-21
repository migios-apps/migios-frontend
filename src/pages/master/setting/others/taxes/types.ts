// Tipe data
// export type TaxRate = {
//   id: number
//   name: string
//   rate: number
//   enabled: boolean
// }

export type TaxType = {
  key: string
  label: string
}

// export type StandardRate = {
//   type: string
//   tax_id: number
// }

// Tipe untuk form tambah/edit pajak
export type TaxFormValues = {
  name: string
  rate: number
}

// Tipe untuk perhitungan pajak
export type TaxCalculationType = 0 | 1 | 2
