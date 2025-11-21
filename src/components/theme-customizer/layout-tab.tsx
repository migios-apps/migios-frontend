import { type SVGProps } from "react"
import { Item, Root as Radio } from "@radix-ui/react-radio-group"
import { CircleCheck, RotateCcw } from "lucide-react"
import { IconDir } from "@/assets/custom/icon-dir"
import { IconLayoutCompact } from "@/assets/custom/icon-layout-compact"
import { IconLayoutDefault } from "@/assets/custom/icon-layout-default"
import { IconLayoutFull } from "@/assets/custom/icon-layout-full"
import { IconSidebarFloating } from "@/assets/custom/icon-sidebar-floating"
import { IconSidebarInset } from "@/assets/custom/icon-sidebar-inset"
import { IconSidebarSidebar } from "@/assets/custom/icon-sidebar-sidebar"
import { type Sidebar, useThemeConfig } from "@/stores/theme-config-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/layout/vertical/sidebar"

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold",
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size="icon"
          variant="secondary"
          className="size-4 rounded-full"
          onClick={onReset}
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
}) {
  return (
    <Item
      value={item.value}
      className={cn("group outline-none", "transition duration-200 ease-in")}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          "ring-border relative rounded-[6px] ring-[1px]",
          "group-data-[state=checked]:ring-primary group-data-[state=checked]:shadow-2xl",
          "group-focus-visible:ring-2"
        )}
        role="img"
        aria-hidden="false"
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            "fill-primary size-6 stroke-white",
            "group-data-[state=unchecked]:hidden",
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            "stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground"
          )}
          aria-hidden="true"
        />
      </div>
      <div
        className="mt-1 text-xs"
        id={`${item.value}-description`}
        aria-live="polite"
      >
        {item.label}
      </div>
    </Item>
  )
}

function SidebarConfig() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const defaultLayout = "inset"

  return (
    <div>
      <SectionTitle
        title="Navigation Layout"
        showReset={defaultLayout !== themeConfig.layout}
        onReset={() => setThemeConfig({ layout: defaultLayout })}
      />
      <Radio
        value={themeConfig.layout}
        onValueChange={(value) =>
          setThemeConfig({
            layout: value as "inset" | "sidebar" | "floating" | "horizontal",
          })
        }
        className="grid w-full max-w-md grid-cols-2 gap-4"
        aria-label="Select navigation layout style"
        aria-describedby="sidebar-description"
      >
        {[
          {
            value: "inset",
            label: "Inset",
            icon: IconSidebarInset,
          },
          {
            value: "floating",
            label: "Floating",
            icon: IconSidebarFloating,
          },
          {
            value: "sidebar",
            label: "Sidebar",
            icon: IconSidebarSidebar,
          },
          {
            value: "horizontal",
            label: "Horizontal",
            icon: IconLayoutDefault,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="sidebar-description" className="sr-only">
        Choose between vertical sidebar layouts (inset, floating, standard) or
        horizontal top navigation
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const defaultSidebar = "icon"

  const radioState = open ? "default" : themeConfig.sidebar

  return (
    <div>
      <SectionTitle
        title="Layout"
        showReset={radioState !== "default"}
        onReset={() => {
          setOpen(true)
          setThemeConfig({ sidebar: defaultSidebar })
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === "default") {
            setOpen(true)
            return
          }
          setOpen(false)
          setThemeConfig({ sidebar: v as Sidebar })
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select layout style"
        aria-describedby="layout-description"
      >
        {[
          {
            value: "default",
            label: "Default",
            icon: IconLayoutDefault,
          },
          {
            value: "icon",
            label: "Compact",
            icon: IconLayoutCompact,
          },
          {
            value: "offcanvas",
            label: "Full layout",
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="layout-description" className="sr-only">
        Choose between default expanded, compact icon-only, or full layout mode
      </div>
    </div>
  )
}

function DirConfig() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const setThemeConfig = useThemeConfig((state) => state.setThemeConfig)
  const defaultDir = "ltr"

  return (
    <div>
      <SectionTitle
        title="Direction"
        showReset={defaultDir !== themeConfig.dir}
        onReset={() => setThemeConfig({ dir: defaultDir })}
      />
      <Radio
        value={themeConfig.dir}
        onValueChange={(value) =>
          setThemeConfig({ dir: value as "ltr" | "rtl" })
        }
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select site direction"
        aria-describedby="direction-description"
      >
        {[
          {
            value: "ltr",
            label: "Left to Right",
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir="ltr" {...props} />
            ),
          },
          {
            value: "rtl",
            label: "Right to Left",
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir="rtl" {...props} />
            ),
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="direction-description" className="sr-only">
        Choose between left-to-right or right-to-left site direction
      </div>
    </div>
  )
}

export function LayoutTab() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const isHorizontalLayout = themeConfig.layout === "horizontal"

  return (
    <div className="space-y-6 p-4">
      <SidebarConfig />
      {!isHorizontalLayout && <LayoutConfig />}
      <DirConfig />
    </div>
  )
}
