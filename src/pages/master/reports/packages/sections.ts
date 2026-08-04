import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const packagesSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "by-package",
    label: "Per Paket",
    component: lazy(() => import("./sections/PackageBreakdownSection")),
  },
  {
    slug: "membership",
    label: "Keanggotaan Aktif",
    component: lazy(() => import("./sections/MembershipSection")),
  },
  {
    slug: "sessions",
    label: "Pemakaian Sesi",
    component: lazy(() => import("./sections/SessionSection")),
  },
  {
    slug: "freeze",
    label: "Freeze",
    component: lazy(() => import("./sections/FreezeSection")),
  },
  {
    slug: "classes",
    label: "Kelas",
    component: lazy(() => import("./sections/ClassSection")),
  },
]
