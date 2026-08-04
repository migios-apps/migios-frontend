import { lazy } from "react"
import type { ReportSectionDef } from "../types"

export const membersSections: ReportSectionDef[] = [
  {
    slug: "summary",
    label: "Ringkasan",
    component: lazy(() => import("./sections/SummarySection")),
  },
  {
    slug: "retention",
    label: "Akuisisi & Retensi",
    component: lazy(() => import("./sections/RetentionSection")),
  },
  {
    slug: "membership",
    label: "Keanggotaan",
    component: lazy(() => import("./sections/MembershipSection")),
  },
  {
    slug: "attendance",
    label: "Kehadiran",
    component: lazy(() => import("./sections/AttendanceSection")),
  },
  {
    slug: "value",
    label: "Nilai Member",
    component: lazy(() => import("./sections/ValueSection")),
  },
  {
    slug: "loyalty",
    label: "Loyalty Point",
    component: lazy(() => import("./sections/LoyaltySection")),
  },
]
