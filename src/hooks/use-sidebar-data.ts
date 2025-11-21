import { useMemo } from "react"
import { useAuth } from "@/auth"
import navigationConfig from "@/config/navigation.config"
import { convertNavigationToNavGroups } from "@/utils/get-sidebar-data"
import { ADMIN, USER } from "@/constants/roles.constant"
import { sidebarData } from "@/components/layout/data/sidebar-data"
import type { SidebarData } from "@/components/layout/types"

/**
 * Hook untuk mendapatkan sidebar data berdasarkan user authority
 * Menggunakan navigationConfig dan filter berdasarkan role user
 */
export function useSidebarData(): SidebarData {
  const { user } = useAuth()

  const navGroups = useMemo(() => {
    // Default authority jika user belum login atau tidak punya role
    // const userAuthority =
    //   user?.role_permission?.permissions &&
    //   user.role_permission.permissions.length > 0
    //     ? user.role_permission.permissions.map((p) => p.name)
    //     : [ADMIN, USER]
    const userAuthority =
      user?.role && user.role.length > 0 ? user.role : [ADMIN, USER]
    return convertNavigationToNavGroups(navigationConfig, userAuthority)
  }, [user])

  return {
    ...sidebarData,
    navGroups,
  }
}
