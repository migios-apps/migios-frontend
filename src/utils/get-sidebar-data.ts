import type { ElementType, ReactElement, ReactNode } from "react"
import type { NavigationTree } from "@/@types/navigation"
import {
  NAV_ITEM_TYPE_COLLAPSE,
  NAV_ITEM_TYPE_TITLE,
} from "@/constants/navigation.constant"
import type { NavGroup, NavItem } from "@/components/layout/types"

/**
 * Convert NavigationTree to NavGroup format untuk sidebar
 */
export function convertNavigationToNavGroups(
  navigationTree: NavigationTree[],
  userAuthority: string[] = []
): NavGroup[] {
  const filteredNav = navigationTree.filter((nav) => {
    // Filter by authority
    if (nav.authority.length === 0) return true
    return nav.authority.some((auth) => userAuthority.includes(auth))
  })

  const groups: NavGroup[] = []
  const directItems: NavItem[] = []

  filteredNav.forEach((nav) => {
    if (nav.type === NAV_ITEM_TYPE_TITLE) {
      // Group dengan title
      groups.push({
        title: nav.title,
        items: nav.subMenu
          .filter((subNav) => {
            if (subNav.authority.length === 0) return true
            return subNav.authority.some((auth) => userAuthority.includes(auth))
          })
          .map((subNav) => convertNavItemToSidebarItem(subNav, userAuthority)),
      })
    } else {
      // Direct item (NAV_ITEM_TYPE_ITEM atau NAV_ITEM_TYPE_COLLAPSE)
      directItems.push(convertNavItemToSidebarItem(nav, userAuthority))
    }
  })

  // Jika ada direct items, masukkan ke group tanpa title di awal
  if (directItems.length > 0) {
    groups.unshift({
      title: "",
      items: directItems,
    })
  }

  return groups
}

/**
 * Convert icon dari ReactNode atau function ke ElementType
 */
function convertIcon(
  icon?: ReactNode | (() => ReactNode)
): ElementType | undefined {
  if (!icon) return undefined

  // Jika icon adalah function, return function sebagai component
  if (typeof icon === "function") {
    return icon as ElementType
  }

  // Jika icon adalah ReactElement (JSX), extract component type
  if (typeof icon === "object" && icon !== null && "type" in icon) {
    const element = icon as ReactElement
    // Return the component type directly (e.g., LayoutDashboard, Settings, etc.)
    return element.type as ElementType
  }

  return undefined
}

/**
 * Convert single NavigationTree item to NavItem
 */
function convertNavItemToSidebarItem(
  nav: NavigationTree,
  userAuthority: string[] = []
): NavItem {
  const icon = convertIcon(nav.icon)

  if (nav.type === NAV_ITEM_TYPE_COLLAPSE && nav.subMenu.length > 0) {
    // Collapsible with subitems
    return {
      title: nav.title,
      icon,
      items: nav.subMenu
        .filter((subNav) => {
          if (subNav.authority.length === 0) return true
          return subNav.authority.some((auth) => userAuthority.includes(auth))
        })
        .map((subNav) => ({
          title: subNav.title,
          url: subNav.path,
          icon: convertIcon(subNav.icon),
        })),
    }
  }

  // Single item with URL
  return {
    title: nav.title,
    url: nav.path,
    icon,
  }
}
