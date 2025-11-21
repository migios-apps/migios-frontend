import React from "react"
import { ArrowRight, ChevronRight, Moon, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useThemeConfig } from "@/stores/theme-config-store"
import { useSearch } from "@/context/search-provider"
import { useSidebarData } from "@/hooks/use-sidebar-data"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { ScrollArea } from "./ui/scroll-area"

export function CommandMenu() {
  const navigate = useNavigate()
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const { open, setOpen } = useSearch()
  const { navGroups } = useSidebarData()

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pe-1">
          <CommandEmpty>No results found.</CommandEmpty>
          {navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate(navItem.url))
                      }}
                    >
                      <div className="flex size-4 items-center justify-center">
                        <ArrowRight className="text-muted-foreground/80 size-2" />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${navItem.title}-${subItem.url}-${i}`}
                    value={`${navItem.title}-${subItem.url}`}
                    onSelect={() => {
                      runCommand(() => navigate(subItem.url))
                    }}
                  >
                    <div className="flex size-4 items-center justify-center">
                      <ArrowRight className="text-muted-foreground/80 size-2" />
                    </div>
                    {navItem.title} <ChevronRight /> {subItem.title}
                  </CommandItem>
                ))
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() =>
                runCommand(() => setThemeConfig({ theme: "light" }))
              }
            >
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => setThemeConfig({ theme: "dark" }))
              }
            >
              <Moon className="scale-90" />
              <span>Dark</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
