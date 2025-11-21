import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import type { NavCollapsible, NavGroup, NavItem, NavLink } from "../types"

type HorizontalNavProps = {
  navGroups: NavGroup[]
}

export function HorizontalNav({ navGroups }: HorizontalNavProps) {
  const location = useLocation()
  const href = location.pathname
  const isMobile = useIsMobile()

  // Flatten all items from all groups for horizontal display
  const allItems = navGroups.flatMap((group) => group.items)

  return (
    <NavigationMenu viewport={isMobile} className="hidden md:flex">
      <NavigationMenuList>
        {allItems.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items) {
            return <HorizontalNavLink key={key} item={item} href={href} />
          }

          return <HorizontalNavCollapsible key={key} item={item} href={href} />
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function HorizontalNavLink({ item, href }: { item: NavLink; href: string }) {
  const isActive = checkIsActive(href, item)

  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild active={isActive}>
        <Link
          to={item.url}
          className={cn("!bg-transparent", navigationMenuTriggerStyle())}
        >
          {item.title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

function HorizontalNavCollapsible({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const hasActiveChild = item.items.some((subItem) =>
    checkIsActive(href, subItem)
  )

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "!bg-transparent",
          hasActiveChild && "text-accent-foreground"
        )}
      >
        {item.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex w-max flex-col gap-1 p-2">
          {item.items.map((subItem) => {
            const isActive = checkIsActive(href, subItem)
            return (
              <li key={subItem.url}>
                <NavigationMenuLink asChild active={isActive}>
                  <Link
                    to={subItem.url}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-start gap-2 rounded-md px-3 py-2 text-sm transition-colors outline-none select-none",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {subItem.title}
                  </Link>
                </NavigationMenuLink>
              </li>
            )
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    (item.items && item.items.some((i) => i.url === href))
  )
}
