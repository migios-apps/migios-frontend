"use client"

// import { tweakcnThemes } from "./config/theme-data"
import React from "react"
import { Layout, Palette, RotateCcw, Settings, X } from "lucide-react"
import { useThemeConfig } from "@/stores/theme-config-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import { useThemeManager } from "./hooks/use-theme-manager"
import { ImportModal } from "./import-modal"
import { LayoutTab } from "./layout-tab"
import { ThemeTab } from "./theme-tab"
import type { ImportedTheme } from "./types/theme-customizer"

interface ThemeCustomizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const {
    applyImportedTheme,
    isDarkMode,
    resetTheme,
    applyRadius,
    setBrandColorsValues,
    applyTheme,
    applyTweakcnTheme,
  } = useThemeManager()
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const resetThemeConfig = useThemeConfig((state) => state.resetThemeConfig)

  const [activeTab, setActiveTab] = React.useState("theme")
  const [selectedTheme, setSelectedTheme] = React.useState("default")
  const [selectedTweakcnTheme, setSelectedTweakcnTheme] = React.useState("")
  const [selectedRadius, setSelectedRadius] = React.useState("0.5rem")
  const [importModalOpen, setImportModalOpen] = React.useState(false)
  const [importedTheme, setImportedTheme] =
    React.useState<ImportedTheme | null>(null)

  const handleReset = () => {
    // Complete reset to application defaults

    // 1. Reset all state variables to initial values
    setSelectedTheme("") // Clear theme selection after reset
    setSelectedTweakcnTheme("")
    setSelectedRadius("0.5rem")
    setImportedTheme(null) // Clear imported theme
    setBrandColorsValues({}) // Clear brand colors state

    // 2. Completely remove all custom CSS variables
    resetTheme()

    // 3. Reset the radius to default
    applyRadius("0.5rem")

    // 4. Reset theme config to defaults (including sidebar settings)
    resetThemeConfig()
  }

  const handleImport = (themeData: ImportedTheme) => {
    setImportedTheme(themeData)
    // Clear other selections to indicate custom import is active
    setSelectedTheme("")
    setSelectedTweakcnTheme("")

    // Apply the imported theme
    applyImportedTheme(themeData, isDarkMode)
  }

  const handleImportClick = () => {
    setImportModalOpen(true)
  }

  // // Re-apply themes when theme mode changes
  // React.useEffect(() => {
  //   if (importedTheme) {
  //     applyImportedTheme(importedTheme, isDarkMode)
  //   } else if (selectedTheme) {
  //     applyTheme(selectedTheme, isDarkMode)
  //   } else if (selectedTweakcnTheme) {
  //     const selectedPreset = tweakcnThemes.find(
  //       (t) => t.value === selectedTweakcnTheme
  //     )?.preset
  //     if (selectedPreset) {
  //       applyTweakcnTheme(selectedPreset, isDarkMode)
  //     }
  //   }
  // }, [
  //   isDarkMode,
  //   importedTheme,
  //   selectedTheme,
  //   selectedTweakcnTheme,
  //   applyImportedTheme,
  //   applyTheme,
  //   applyTweakcnTheme,
  // ])

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={themeConfig.sidebar_side === "left" ? "right" : "left"}
          className="pointer-events-auto flex w-[400px] flex-col gap-0 overflow-hidden p-0 [&>button]:hidden"
          onInteractOutside={(e) => {
            // Prevent the sheet from closing when dialog is open
            if (importModalOpen) {
              e.preventDefault()
            }
          }}
        >
          <SheetHeader className="space-y-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-lg p-2">
                <Settings className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg font-semibold">
                Customizer
              </SheetTitle>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetDescription className="text-muted-foreground sr-only text-sm">
              Customize the them and layout of your dashboard.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full flex-col"
            >
              <div className="py-2">
                <TabsList className="grid h-12 w-full grid-cols-2 rounded-none p-1.5">
                  <TabsTrigger
                    value="theme"
                    className="data-[state=active]:bg-background cursor-pointer"
                  >
                    <Palette className="mr-1 h-4 w-4" /> Theme
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="data-[state=active]:bg-background cursor-pointer"
                  >
                    <Layout className="mr-1 h-4 w-4" /> Layout
                  </TabsTrigger>
                </TabsList>
                {/* <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger value="theme" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Palette className="h-4 w-4 mr-1" /> Theme</TabsTrigger>
                  <TabsTrigger value="layout" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Layout className="h-4 w-4 mr-1" /> Layout</TabsTrigger>
                </TabsList> */}
              </div>

              <TabsContent value="theme" className="mt-0 flex-1">
                <ThemeTab
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  selectedTweakcnTheme={selectedTweakcnTheme}
                  setSelectedTweakcnTheme={setSelectedTweakcnTheme}
                  selectedRadius={selectedRadius}
                  setSelectedRadius={setSelectedRadius}
                  setImportedTheme={setImportedTheme}
                  onImportClick={handleImportClick}
                />
              </TabsContent>

              <TabsContent value="layout" className="mt-0 flex-1">
                <LayoutTab />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImport}
      />
    </>
  )
}

// Floating trigger button - positioned dynamically based on sidebar side
export function ThemeCustomizerTrigger({ onClick }: { onClick: () => void }) {
  const sidebarSide = useThemeConfig((state) => state.themeConfig.sidebar_side)

  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "bg-primary hover:bg-primary/90 text-primary-foreground fixed top-1/2 z-50 h-12 w-12 -translate-y-1/2 cursor-pointer rounded-full shadow-lg",
        sidebarSide === "left" ? "right-4" : "left-4"
      )}
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
