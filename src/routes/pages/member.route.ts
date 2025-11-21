import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const memberRoute: Routes = [
  {
    path: "/members",
    component: lazy(() => import("@/pages/members")),
    authority: [],
  },
  {
    path: "/members/create",
    component: lazy(() => import("@/pages/members/create")),
    authority: [],
  },
  {
    path: "/members/edit/:code",
    component: lazy(() => import("@/pages/members/edit")),
    authority: [],
  },
  {
    path: "/members/details/:id",
    component: lazy(() => import("@/pages/members/detail")),
    authority: [],
  },
  // Old route (dikomentar untuk referensi)
  // {
  //   path: '/members/member-create',
  //   component: lazy(() => import('@/pages/members/MemberCreate')),
  //   authority: [],
  // },
]
