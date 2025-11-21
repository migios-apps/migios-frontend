import { ChevronRight, Menu } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavCollapsible, NavItem, NavLink } from "../types"
import { TeamSwitcherHorizontal } from "./team-switcher-horizontal"

type MobileMenuSheetProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MobileMenuSheet({ open, onOpenChange }: MobileMenuSheetProps) {
  const location = useLocation()
  const href = location.pathname
  const sidebarData = useSidebarData()

  const handleLinkClick = () => {
    onOpenChange?.(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Mobile navigation menu</SheetDescription>
        </SheetHeader>

        {/* Header - Team Switcher */}
        <div className="p-4">
          <TeamSwitcherHorizontal teams={sidebarData.teams} />
        </div>
        <Separator />

        {/* Content - Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {sidebarData.navGroups.map((group, groupIndex) => (
              <div
                key={group.title || `group-${groupIndex}`}
                className="space-y-3"
              >
                {group.title && (
                  <h4 className="text-muted-foreground px-2 text-sm font-semibold">
                    {group.title}
                  </h4>
                )}
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const key = `${item.title}-${item.url}`

                    if (!item.items) {
                      return (
                        <MobileMenuLink
                          key={key}
                          item={item}
                          href={href}
                          onClick={handleLinkClick}
                        />
                      )
                    }

                    return (
                      <MobileMenuCollapsible
                        key={key}
                        item={item}
                        href={href}
                        onClick={handleLinkClick}
                      />
                    )
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - User */}
        {/* <div className="mt-auto border-t p-4">
          <NavUser user={sidebarData.user} />
        </div> */}
      </SheetContent>
    </Sheet>
  )
}

function MobileMenuLink({
  item,
  href,
  onClick,
}: {
  item: NavLink
  href: string
  onClick: () => void
}) {
  const isActive = checkIsActive(href, item)
  return (
    <Link
      to={item.url}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {item.icon && <item.icon className="size-4 shrink-0" />}
      <span>{item.title}</span>
    </Link>
  )
}

function MobileMenuCollapsible({
  item,
  href,
  onClick,
}: {
  item: NavCollapsible
  href: string
  onClick: () => void
}) {
  const hasActiveChild = item.items.some((subItem) =>
    checkIsActive(href, subItem)
  )

  return (
    <Collapsible defaultOpen={hasActiveChild} className="space-y-1">
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors [&[data-state=open]>svg]:rotate-90",
          hasActiveChild
            ? "bg-accent/50 text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {item.icon && <item.icon className="size-4 shrink-0" />}
        <span className="flex-1 text-left">{item.title}</span>
        <ChevronRight className="size-4 shrink-0 transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 pl-6">
        {item.items.map((subItem) => {
          const isActive = checkIsActive(href, subItem)
          return (
            <Link
              key={subItem.url}
              to={subItem.url}
              onClick={onClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {subItem.icon && <subItem.icon className="size-4 shrink-0" />}
              <span>{subItem.title}</span>
            </Link>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}

function checkIsActive(href: string, item: NavItem) {
  return (
    href === item.url ||
    href.split("?")[0] === item.url ||
    (item.items && item.items.some((i) => i.url === href))
  )
}
