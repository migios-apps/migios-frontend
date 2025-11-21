// import { lazy } from 'react'
import type { Routes } from "@/@types/routes"
import { gymSettingsRoute } from "./gymSettings.route"
import { othersSettingsRoute } from "./othersSettings.route"
import { rolesPermissionsRoute } from "./rolesPermissions.route"

export const settingsRoute: Routes = [
  ...rolesPermissionsRoute,
  ...othersSettingsRoute,
  ...gymSettingsRoute,
]
