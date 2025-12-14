import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover"

export interface ColorPair {
  background: string
  color: string
}

const DEFAULT_PAIRS: ColorPair[] = [
  { background: "#FEF9C3", color: "#854D0E" }, // Yellow 100/800
  { background: "#FEE2E2", color: "#991B1B" }, // Red 100/800
  { background: "#FFEDD5", color: "#9A3412" }, // Orange 100/800
  { background: "#DCFCE7", color: "#166534" }, // Green 100/800
  { background: "#D1FAE5", color: "#065F46" }, // Emerald 100/800
  { background: "#CFFAFE", color: "#155E75" }, // Cyan 100/800
  { background: "#F1F5F9", color: "#0F172A" }, // Slate 100/900
  { background: "#E0F2FE", color: "#075985" }, // Sky 100/800
  { background: "#DBEAFE", color: "#1E40AF" }, // Blue 100/800
  { background: "#E0E7FF", color: "#3730A3" }, // Indigo 100/800
  { background: "#EDE9FE", color: "#5B21B6" }, // Violet 100/800
  { background: "#FAE8FF", color: "#86198F" }, // Fuchsia 100/800
  { background: "#FCE7F3", color: "#9D174D" }, // Pink 100/800
  { background: "#FFE4E6", color: "#9F1239" }, // Rose 100/800
]

interface ColorPalettePickerProps {
  value?: ColorPair
  onChange: (value: ColorPair) => void
  className?: string
  pairs?: ColorPair[]
  disabled?: boolean
}

export function ColorPalettePicker({
  value,
  onChange,
  className,
  pairs = DEFAULT_PAIRS,
  disabled,
}: ColorPalettePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Local state for the custom picker
  const [customBg, setCustomBg] = useState(value?.background || "#FFFFFF")
  const [customColor, setCustomColor] = useState(value?.color || "#000000")

  useEffect(() => {
    if (value) {
      setCustomBg(value.background)
      setCustomColor(value.color)
    }
  }, [value])

  const handleCustomChange = (newBg: string, newColor: string) => {
    setCustomBg(newBg)
    setCustomColor(newColor)
    onChange({ background: newBg, color: newColor })
  }

  const isCustomSelected =
    value &&
    !pairs.some(
      (p) => p.background === value.background && p.color === value.color
    )

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 transition-opacity",
        className,
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <TooltipProvider>
        {pairs.map((pair, index) => {
          const isSelected =
            value?.background.toLowerCase() === pair.background.toLowerCase() &&
            value?.color.toLowerCase() === pair.color.toLowerCase()

          return (
            <Tooltip key={`${pair.background}-${index}`}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "group relative flex size-10 cursor-pointer items-center justify-center rounded-md transition-all hover:scale-105"
                  )}
                  onClick={() => !disabled && onChange(pair)}
                  style={{ backgroundColor: pair.background }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: pair.color }}
                  >
                    Aa
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="color-palette-selection"
                      className="ring-primary absolute inset-0 rounded-md ring-2 ring-offset-2"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    >
                      <div className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full shadow-sm">
                        <Check className="size-3" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bg: {pair.background}</p>
                <p>Text: {pair.color}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "bg-muted hover:bg-muted/80 text-muted-foreground relative flex size-10 cursor-pointer items-center justify-center rounded-md border transition-all"
                  )}
                >
                  <Plus className="size-5" />
                  <span className="sr-only">Pick custom color</span>
                  {isCustomSelected && (
                    <motion.div
                      layoutId="color-palette-selection"
                      className="ring-primary absolute inset-0 rounded-md ring-2 ring-offset-2"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    >
                      <div className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full shadow-sm">
                        <Check className="size-3" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Custom Color</p>
            </TooltipContent>
          </Tooltip>

          <PopoverContent className="w-64 p-3">
            <div className="space-y-3">
              <h4 className="leading-none font-medium">Custom Color</h4>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="bg-color">Bg</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <div
                      className="size-6 rounded border shadow-sm"
                      style={{ backgroundColor: customBg }}
                    />
                    <Input
                      id="bg-color"
                      type="color"
                      className="h-8 w-full p-1"
                      value={customBg}
                      onChange={(e) =>
                        handleCustomChange(e.target.value, customColor)
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label htmlFor="text-color">Text</Label>
                  <div className="col-span-2 flex items-center gap-2">
                    <div
                      className="size-6 rounded border shadow-sm"
                      style={{ backgroundColor: customColor }}
                    />
                    <Input
                      id="text-color"
                      type="color"
                      className="h-8 w-full p-1"
                      value={customColor}
                      onChange={(e) =>
                        handleCustomChange(customBg, e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div
                className="mt-2 rounded-md border p-2 text-center text-sm font-medium shadow-sm"
                style={{ backgroundColor: customBg, color: customColor }}
              >
                Preview Text
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </div>
  )
}
