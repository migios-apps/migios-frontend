import CorporateTemplate from "./CorporateTemplate"
import DefaultTemplate from "./DefaultTemplate"
import MinimalistTemplate from "./MinimalistTemplate"
import ModernTemplate from "./ModernTemplate"

export interface InvoiceItem {
  description: string
  qty: number
  unitPrice: number
  discount: number
}

export interface InvoiceData {
  companyName: string
  companyAddress: string
  invoiceTo: string
  invoiceToAddress: string
  invoiceNumber: string
  invoiceDate: string
  salesName: string
  termCondition: string
  paymentMethod: string
  paymentAmount: number
  outstanding: number
  items?: InvoiceItem[]
}

export interface Signatures {
  sales: string
  admin: string
  member: string
}

export interface InvoiceTemplateProps {
  data: InvoiceData
  signatures: Signatures
}

export type TemplateKey = "default" | "modern" | "minimalist" | "corporate"

export const TEMPLATES = {
  default: {
    component: DefaultTemplate,
    name: "Default",
    description: "Template invoice standar dengan desain klasik",
  },
  modern: {
    component: ModernTemplate,
    name: "Modern",
    description: "Template invoice dengan desain modern dan gradien warna",
  },
  minimalist: {
    component: MinimalistTemplate,
    name: "Minimalist",
    description: "Template invoice dengan desain minimalis dan bersih",
  },
  corporate: {
    component: CorporateTemplate,
    name: "Corporate",
    description: "Template invoice korporat dengan layout profesional",
  },
}

export const getTemplateComponent = (templateKey: TemplateKey) => {
  return TEMPLATES[templateKey]?.component || DefaultTemplate
}

export const getTemplateOptions = () => {
  return Object.entries(TEMPLATES).map(([key, template]) => ({
    value: key,
    label: template.name,
    description: template.description,
  }))
}

export default {
  DefaultTemplate,
  ModernTemplate,
  MinimalistTemplate,
  getTemplateComponent,
  getTemplateOptions,
  TEMPLATES,
}
