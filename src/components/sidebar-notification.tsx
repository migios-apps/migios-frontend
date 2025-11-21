"use client"

import * as React from "react"
import { X } from "lucide-react"
import { useThemeConfig } from "@/stores/theme-config-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SidebarNotification() {
  const themeConfig = useThemeConfig((state) => state.themeConfig)
  const [isVisible, setIsVisible] = React.useState(true)

  if (!isVisible) return null

  return (
    <Card
      className={cn(
        "mb-3 border py-0 shadow-none",
        themeConfig.layout === "inset"
          ? "border-border-inset from-primary/10 bg-gradient-to-t to-transparent"
          : "border-sidebar-border from-primary/10 bg-gradient-to-t to-transparent"
      )}
    >
      <CardContent className="relative p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-2 right-2 h-6 w-6 p-0",
            themeConfig.layout === "inset"
              ? "bg-border-inset text-sidebar-inset-text/50 hover:bg-sidebar-accent-inset-foreground/20 hover:text-sidebar-accent-inset-foreground"
              : "hover:bg-neutral-200 dark:hover:bg-neutral-700"
          )}
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Close notification</span>
        </Button>

        <div className="pr-6">
          <h3
            className={cn(
              "mt-1 mb-2 flex items-center gap-3 font-semibold",
              themeConfig.layout === "inset"
                ? "text-sidebar-inset-text"
                : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            <div>
              Welcome to{" "}
              <a
                href="https://migios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Migios
              </a>
            </div>
          </h3>
          <p
            className={cn(
              "text-muted-foreground text-sm leading-relaxed",
              themeConfig.layout === "inset"
                ? "text-sidebar-inset-text/80"
                : "dark:text-neutral-400"
            )}
          >
            Nikmati fitur lengkap Migios. Mulai gunakan versi{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Premium
            </a>{" "}
            untuk hasil maksimal.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
