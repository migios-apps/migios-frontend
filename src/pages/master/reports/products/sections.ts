import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const productsSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "by-product",
    label: "Per Produk",
    component: lazy(() => import("./sections/ProductBreakdownSection")),
  },
  {
    slug: "stock",
    label: "Stok Saat Ini",
    component: lazy(() => import("./sections/StockSection")),
  },
  {
    slug: "velocity",
    label: "Kecepatan Jual",
    component: lazy(() => import("./sections/VelocitySection")),
  },
  {
    slug: "refund",
    label: "Refund Produk",
    component: lazy(() => import("./sections/RefundSection")),
  },
]
