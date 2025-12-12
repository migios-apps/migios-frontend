import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { InputPercentNominal } from "@/components/ui/input-percent-nominal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DiscountTabContentProps {
  pendingDiscount: {
    type: "default" | "custom" | null
    discount_type?: "percent" | "nominal"
    discount_amount?: number
  } | null
  setPendingDiscount: React.Dispatch<
    React.SetStateAction<{
      type: "default" | "custom" | null
      discount_type?: "percent" | "nominal"
      discount_amount?: number
    } | null>
  >
  customDiscountType: "percent" | "nominal"
  setCustomDiscountType: React.Dispatch<
    React.SetStateAction<"percent" | "nominal">
  >
  customDiscountValue: number | string | null
  setCustomDiscountValue: React.Dispatch<
    React.SetStateAction<number | string | null>
  >
  selectedDefaultDiscount: string
  setSelectedDefaultDiscount: React.Dispatch<React.SetStateAction<string>>
}

const DiscountTabContent: React.FC<DiscountTabContentProps> = ({
  pendingDiscount,
  setPendingDiscount,
  customDiscountType,
  setCustomDiscountType,
  customDiscountValue,
  setCustomDiscountValue,
  selectedDefaultDiscount,
  setSelectedDefaultDiscount,
}) => {
  // Default discount options
  const defaultDiscounts = React.useMemo(() => [50, 40, 30, 20, 10], [])

  // Check discount mode dari pending discount
  const isUsingDefaultDiscount = pendingDiscount?.type === "default"
  const isUsingCustomDiscount = pendingDiscount?.type === "custom"

  return (
    <ScrollArea className="h-full px-2 pr-3">
      <div className="space-y-6 px-1 pt-1 pb-4">
        {/* Custom Discount Input */}
        <div className="space-y-2">
          <InputPercentNominal
            value={customDiscountValue}
            size="xl"
            onChange={(val) => {
              const value = val === null || val === "" ? 0 : Number(val)
              setCustomDiscountValue(val)
              if (value > 0) {
                // Set pending discount sebagai custom
                setPendingDiscount({
                  type: "custom",
                  discount_type: customDiscountType,
                  discount_amount: value,
                })
                setSelectedDefaultDiscount("")
              } else {
                // Clear pending discount jika value dihapus
                setPendingDiscount(null)
              }
            }}
            type={customDiscountType}
            onTypeChange={(type) => {
              setCustomDiscountType(type)
              if (pendingDiscount?.type === "custom") {
                setPendingDiscount({
                  ...pendingDiscount,
                  discount_type: type,
                })
              }
            }}
            placeholderPercent="10%"
            placeholderNominal="Jumlah diskon"
            disabled={isUsingDefaultDiscount}
          />
          {isUsingCustomDiscount && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendingDiscount(null)
                setCustomDiscountValue(null)
                setCustomDiscountType("percent")
              }}
              className="text-destructive hover:text-destructive w-full"
            >
              Hapus Diskon
            </Button>
          )}
          {isUsingDefaultDiscount && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Switch dari default ke custom
                setPendingDiscount(null)
                setSelectedDefaultDiscount("")
                setCustomDiscountValue(null)
                setCustomDiscountType("percent")
              }}
              className="w-full"
            >
              Ganti ke Diskon Custom
            </Button>
          )}
        </div>

        {/* List discount default - hide if using custom discount */}
        {!isUsingCustomDiscount && (
          <RadioGroup
            value={selectedDefaultDiscount}
            onValueChange={(value) => {
              setSelectedDefaultDiscount(value)
              // Set pending discount sebagai default
              setPendingDiscount({
                type: "default",
                discount_type: "percent",
                discount_amount: Number(value),
              })
              // Clear custom discount
              setCustomDiscountValue(null)
            }}
          >
            {defaultDiscounts.map((discount) => (
              <div
                key={discount}
                className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3"
              >
                <RadioGroupItem
                  value={String(discount)}
                  id={`disc-${discount}`}
                  disabled={isUsingCustomDiscount}
                />
                <label
                  htmlFor={`disc-${discount}`}
                  className={cn("flex flex-1 cursor-pointer flex-col", {
                    "cursor-not-allowed opacity-50": isUsingCustomDiscount,
                  })}
                >
                  <span className="font-semibold">Disc {discount}</span>
                  <span className="text-muted-foreground text-sm">
                    {discount}%
                  </span>
                </label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    </ScrollArea>
  )
}

export default DiscountTabContent
