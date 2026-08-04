import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const financeSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "cash-flow",
    label: "Arus Kas",
    component: lazy(() => import("./sections/CashFlowSection")),
  },
  {
    slug: "income",
    label: "Pemasukan",
    component: lazy(() => import("./sections/IncomeSection")),
  },
  {
    slug: "expense",
    label: "Pengeluaran",
    component: lazy(() => import("./sections/ExpenseSection")),
  },
  {
    slug: "rekening",
    label: "Rekening & Mutasi",
    component: lazy(() => import("./sections/RekeningSection")),
  },
  {
    slug: "receivable",
    label: "Piutang",
    component: lazy(() => import("./sections/ReceivableSection")),
  },
  {
    slug: "tax",
    label: "Pajak",
    component: lazy(() => import("./sections/TaxSection")),
  },
]
