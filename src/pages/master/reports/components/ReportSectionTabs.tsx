import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReportSectionDef } from "../types"

interface ReportSectionTabsProps {
  sections: ReportSectionDef[]
  value: string
  onChange: (slug: string) => void
}

const ReportSectionTabs = ({
  sections,
  value,
  onChange,
}: ReportSectionTabsProps) => {
  const tabListRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeTabRef.current && tabListRef.current) {
      const tabList = tabListRef.current
      const activeTab = activeTabRef.current
      const scrollLeft =
        activeTab.offsetLeft -
        tabList.clientWidth / 2 +
        activeTab.clientWidth / 2

      tabList.scrollTo({ left: scrollLeft, behavior: "smooth" })
    }
  }, [value])

  return (
    <Tabs value={value} onValueChange={onChange} className="w-full">
      <div className="scrollbar-hide overflow-x-auto">
        <TabsList
          ref={tabListRef}
          className={cn(
            "inline-flex h-auto w-full items-center justify-start",
            "gap-2 rounded-none bg-transparent p-0"
          )}
        >
          {sections.map((section) => (
            <TabsTrigger
              key={section.slug}
              ref={value === section.slug ? activeTabRef : undefined}
              value={section.slug}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm whitespace-nowrap",
                "border-border text-muted-foreground bg-transparent",
                "hover:text-foreground focus-visible:outline-none",
                "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none"
              )}
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

export default ReportSectionTabs
