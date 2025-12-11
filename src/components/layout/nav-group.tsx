import { type ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/layout/vertical/sidebar"
import { Badge } from "../ui/badge"
import {
  type NavCollapsible,
  type NavGroup as NavGroupProps,
  type NavItem,
  type NavLink,
} from "./types"

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const location = useLocation()
  const href = location.pathname
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />

          if (state === "collapsed" && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            )

          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
}

function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={checkIsActive(href, item)}
        tooltip={item.title}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const { setOpenMobile } = useSidebar()
  const hasActiveChild = item.items.some((subItem) =>
    checkIsActive(href, subItem)
  )
  const isActive = checkIsActive(href, item, true) || hasActiveChild
  return (
    <Collapsible
      asChild
      defaultOpen={checkIsActive(href, item, true)}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            data-has-active-child={hasActiveChild}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkIsActive(href, subItem)}
                >
                  <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`}>
              <Link
                to={sub.url}
                className={`${checkIsActive(href, sub) ? "bg-secondary" : ""}`}
              >
                {sub.icon && <sub.icon />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ms-auto text-xs">{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  // Normalize href by removing query params
  const normalizedHref = href.split("?")[0]

  // Check if item has url and href includes it
  if (item.url) {
    const normalizedItemUrl = item.url.split("?")[0]

    // Exact match
    if (href === item.url || normalizedHref === normalizedItemUrl) {
      return true
    }

    // Include check: href starts with item.url or item.url starts with href
    // This ensures path matching (e.g., /employee/detail/123 matches /employee)
    if (
      normalizedHref.startsWith(normalizedItemUrl) ||
      normalizedItemUrl.startsWith(normalizedHref)
    ) {
      // Ensure we're matching at path boundaries to avoid false positives
      // e.g., /a should not match /about, but /employee should match /employee/detail
      if (normalizedHref.startsWith(normalizedItemUrl)) {
        // Check if it's at a path boundary (end of string or followed by /)
        const remaining = normalizedHref.slice(normalizedItemUrl.length)
        if (remaining === "" || remaining.startsWith("/")) {
          return true
        }
      }
      if (normalizedItemUrl.startsWith(normalizedHref)) {
        const remaining = normalizedItemUrl.slice(normalizedHref.length)
        if (remaining === "" || remaining.startsWith("/")) {
          return true
        }
      }
    }
  }

  // Check if any child nav is active (for collapsible menus)
  if (item?.items && item.items.length > 0) {
    const hasActiveChild = item.items.some((subItem) => {
      if (!subItem.url) return false
      const normalizedSubItemUrl = subItem.url.split("?")[0]

      // Exact match
      if (href === subItem.url || normalizedHref === normalizedSubItemUrl) {
        return true
      }

      // Include check: href starts with subItem.url or subItem.url starts with href
      if (normalizedHref.startsWith(normalizedSubItemUrl)) {
        const remaining = normalizedHref.slice(normalizedSubItemUrl.length)
        if (remaining === "" || remaining.startsWith("/")) {
          return true
        }
      }
      if (normalizedSubItemUrl.startsWith(normalizedHref)) {
        const remaining = normalizedSubItemUrl.slice(normalizedHref.length)
        if (remaining === "" || remaining.startsWith("/")) {
          return true
        }
      }

      return false
    })

    if (hasActiveChild) {
      return true
    }
  }

  // For mainNav, check if first segment matches
  if (mainNav && item?.url) {
    const hrefFirstSegment = href.split("/")[1]
    const itemFirstSegment = item.url.split("/")[1]

    if (hrefFirstSegment !== "" && hrefFirstSegment === itemFirstSegment) {
      return true
    }

    // Include check for first segment
    if (
      hrefFirstSegment &&
      itemFirstSegment &&
      (hrefFirstSegment.startsWith(itemFirstSegment) ||
        itemFirstSegment.startsWith(hrefFirstSegment))
    ) {
      return true
    }
  }

  return false
}
