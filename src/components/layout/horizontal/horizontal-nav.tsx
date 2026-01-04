import React from "react"
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

  return (
    <NavigationMenu viewport={isMobile} className="hidden lg:flex">
      <NavigationMenuList>
        {navGroups.map((group, index) => {
          const key = `${group.title}-${index}`

          // If group has a title, render it as a dropdown (like "Masters")
          if (group.title) {
            return <HorizontalNavGroup key={key} group={group} href={href} />
          }

          // If group has no title, render its items directly (like "Dashboard")
          return group.items.map((item) => {
            const itemKey = `${item.title}-${item.url}`
            if (!item.items) {
              return <HorizontalNavLink key={itemKey} item={item} href={href} />
            }
            return (
              <HorizontalNavCollapsible key={itemKey} item={item} href={href} />
            )
          })
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
          className={cn("bg-transparent!", navigationMenuTriggerStyle())}
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
          "bg-transparent!",
          hasActiveChild && "text-accent-foreground"
        )}
      >
        {item.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="flex w-max flex-col gap-1 p-2">
          {item.items.map((subItem) => {
            const isActive = checkIsActive(href, subItem)
            const Icon = subItem.icon
            return (
              <li key={subItem.url}>
                <NavigationMenuLink asChild active={isActive}>
                  <Link
                    to={subItem.url}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors outline-none select-none",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                  >
                    {Icon && <Icon size={16} />}
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

function HorizontalNavGroup({
  group,
  href,
}: {
  group: NavGroup
  href: string
}) {
  // Check if any item inside the group is active
  const hasActiveChild = group.items.some((item) => {
    if (item.items) {
      return item.items.some((subItem) => checkIsActive(href, subItem))
    }
    return checkIsActive(href, item)
  })

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          "bg-transparent!",
          hasActiveChild && "text-accent-foreground"
        )}
      >
        {group.title}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-1 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
          {group.items.map((item) => {
            // If item is collapsible (like "Settings"), render as a section
            if (item.items) {
              const Icon = item.icon
              return (
                <li key={item.title} className="row-span-3">
                  <div className="text-foreground/70 mb-2 flex items-center gap-2 px-2 text-sm leading-none font-medium">
                    {Icon && <Icon size={16} />}
                    {item.title}
                  </div>
                  <ul className="ml-2 flex flex-col gap-1 border-l pl-2">
                    {item.items.map((subItem) => (
                      <ListItem
                        key={subItem.url}
                        href={subItem.url}
                        title={subItem.title}
                        icon={subItem.icon}
                        isActive={checkIsActive(href, subItem)}
                      />
                    ))}
                  </ul>
                </li>
              )
            }

            // Regular item
            return (
              <ListItem
                key={item.url}
                href={item.url}
                title={item.title}
                icon={item.icon}
                isActive={checkIsActive(href, item)}
              />
            )
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    isActive?: boolean
    icon?: React.ElementType
  }
>(
  (
    { className, title, children, isActive, href, icon: Icon, ...props },
    ref
  ) => {
    return (
      <li>
        <NavigationMenuLink asChild active={isActive}>
          <Link
            ref={ref}
            to={href!}
            className={cn(
              "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none",
              isActive && "bg-accent text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="flex items-center gap-2 text-sm leading-none font-medium">
              {Icon && <Icon size={16} />}
              {title}
            </div>
            {children && (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                {children}
              </p>
            )}
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }
)
ListItem.displayName = "ListItem"

function checkIsActive(href: string, item: NavItem) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    (item.items && item.items.some((i) => i.url === href))
  )
}
