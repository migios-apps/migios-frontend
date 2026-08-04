import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const employeeSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "commission",
    label: "Komisi Detail",
    component: lazy(() => import("./sections/CommissionSection")),
  },
  {
    slug: "commission-item",
    label: "Komisi per Paket & Produk",
    component: lazy(() => import("./sections/CommissionItemSection")),
  },
  {
    slug: "sales-performance",
    label: "Kinerja Penjualan",
    component: lazy(() => import("./sections/SalesPerformanceSection")),
  },
  {
    slug: "trainer",
    label: "Trainer & Sesi",
    component: lazy(() => import("./sections/TrainerSection")),
  },
  {
    slug: "attendance",
    label: "Kehadiran",
    component: lazy(() => import("./sections/AttendanceSection")),
  },
  {
    slug: "payroll",
    label: "Estimasi Payroll",
    component: lazy(() => import("./sections/PayrollSection")),
  },
]
