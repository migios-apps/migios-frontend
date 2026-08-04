import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const salesSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "by-item",
    label: "Per Item",
    component: lazy(() => import("./sections/ItemSection")),
  },
  {
    slug: "by-employee",
    label: "Per Karyawan",
    component: lazy(() => import("./sections/EmployeeSection")),
  },
  {
    slug: "payment",
    label: "Pembayaran & Piutang",
    component: lazy(() => import("./sections/PaymentSection")),
  },
  {
    slug: "discount-tax",
    label: "Diskon, Voucher & Pajak",
    component: lazy(() => import("./sections/DiscountTaxSection")),
  },
  {
    slug: "refund-void",
    label: "Refund & Void",
    component: lazy(() => import("./sections/RefundVoidSection")),
  },
  {
    slug: "analytic",
    label: "Analitik",
    component: lazy(() => import("./sections/AnalyticSection")),
  },
]
