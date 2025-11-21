import { lazy } from "react"
import type { Routes } from "@/@types/routes"

export const rolesPermissionsRoute: Routes = [
  {
    path: "/settings/roles-permissions",
    component: lazy(() => import("@/pages/master/setting/roles-permissions")),
    authority: [],
  },
  {
    path: "/settings/roles-permissions/create",
    component: lazy(
      () => import("@/pages/master/setting/roles-permissions/create")
    ),
    authority: [],
  },
  {
    path: "/settings/roles-permissions/edit/:id",
    component: lazy(
      () => import("@/pages/master/setting/roles-permissions/edit")
    ),
    authority: [],
  },
]
