import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  apiGetSettings,
  apiUpdateSettings,
} from "@/services/api/settings/settings"
import { ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import LayoutOtherSetting from "../Layout"
import CommissionSetting from "./commission"

const LoadingSalesSetting = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Pembulatan */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>

          {/* Jumlah Pembulatan */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-36" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Penjelasan */}
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const SalesSettings = () => {
  const queryClient = useQueryClient()
  const [isRoundingEnabled, setIsRoundingEnabled] = useState(false)
  const [roundingMode, setRoundingMode] = useState<"up" | "down">("up")
  const [roundingValue, setRoundingValue] = useState<number>(100)

  const { data: settingsData, isLoading } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: () => apiGetSettings(),
    select: (res) => res.data,
  })

  useEffect(() => {
    if (settingsData) {
      setIsRoundingEnabled(settingsData.sales_is_rounding === 1)
      setRoundingMode(settingsData.sales_rounding_mode || "up")
      const value = settingsData.sales_rounding_value || 100
      setRoundingValue(value >= 100 ? value : 100)
    }
  }, [settingsData])

  const updateSettingsMutation = useMutation({
    mutationFn: (data: {
      sales_is_rounding?: number
      sales_rounding_value?: number
      sales_rounding_mode?: "up" | "down"
    }) => apiUpdateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
      toast.success("Pengaturan pembulatan pembayaran berhasil disimpan")
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal menyimpan pengaturan pembulatan pembayaran"
      )
    },
  })

  const handleToggleRounding = (checked: boolean) => {
    setIsRoundingEnabled(checked)
    updateSettingsMutation.mutate({
      sales_is_rounding: checked ? 1 : 0,
      sales_rounding_value: roundingValue,
      sales_rounding_mode: roundingMode,
    })
  }

  const handleModeChange = (mode: "up" | "down") => {
    setRoundingMode(mode)
    if (isRoundingEnabled) {
      updateSettingsMutation.mutate({
        sales_is_rounding: 1,
        sales_rounding_value: roundingValue,
        sales_rounding_mode: mode,
      })
    }
  }

  const handleValueChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    const finalValue = numValue >= 100 ? numValue : 100
    setRoundingValue(finalValue)
    if (isRoundingEnabled) {
      updateSettingsMutation.mutate({
        sales_is_rounding: 1,
        sales_rounding_value: finalValue,
        sales_rounding_mode: roundingMode,
      })
    }
  }

  const handleIncrement = () => {
    const newValue = roundingValue + 100
    setRoundingValue(newValue)
    if (isRoundingEnabled) {
      updateSettingsMutation.mutate({
        sales_is_rounding: 1,
        sales_rounding_value: newValue,
        sales_rounding_mode: roundingMode,
      })
    }
  }

  const handleDecrement = () => {
    const newValue = Math.max(100, roundingValue - 100)
    setRoundingValue(newValue)
    if (isRoundingEnabled) {
      updateSettingsMutation.mutate({
        sales_is_rounding: 1,
        sales_rounding_value: newValue,
        sales_rounding_mode: roundingMode,
      })
    }
  }

  return (
    <LayoutOtherSetting>
      <div className="mx-auto max-w-3xl space-y-6">
        <CommissionSetting />

        {isLoading ? (
          <LoadingSalesSetting />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Pembulatan Pembayaran
                  </CardTitle>
                </div>
                <Switch
                  checked={isRoundingEnabled}
                  onCheckedChange={handleToggleRounding}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Pembulatan */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Mode pembulatan</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={roundingMode === "up" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      roundingMode === "up" &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleModeChange("up")}
                    disabled={!isRoundingEnabled}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Pembulatan keatas ↑
                  </Button>
                  <Button
                    type="button"
                    variant={roundingMode === "down" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      roundingMode === "down" &&
                        "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleModeChange("down")}
                    disabled={!isRoundingEnabled}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Pembulatan kebawah ↓
                  </Button>
                </div>
              </div>

              {/* Jumlah Pembulatan */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Jumlah pembulatan
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={roundingValue}
                      onChange={(e) => handleValueChange(e.target.value)}
                      disabled={!isRoundingEnabled}
                      min={100}
                      step={100}
                      className="pr-10"
                    />
                    <div className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={!isRoundingEnabled}
                        className="hover:bg-accent flex h-3 w-4 items-center justify-center rounded text-xs disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={!isRoundingEnabled}
                        className="hover:bg-accent flex h-3 w-4 items-center justify-center rounded text-xs disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Penjelasan */}
              <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
                <p className="text-muted-foreground text-sm">
                  Sistem akan otomatis mengecek nominal Total Pembayaran untuk
                  dibulatkan.
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Round up</p>
                    <p className="text-muted-foreground text-sm">
                      Round up akan membulatkan nominal yang kurang dari
                      Rounding Target menjadi Rounding Target. Contoh, jika
                      Rounding Target bernilai 100 maka Total Pembayaran 9050,5
                      akan dibulatkan menjadi 9100.
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Round down</p>
                    <p className="text-muted-foreground text-sm">
                      Round down akan membulatkan nominal yang kurang dari
                      Rounding Target menjadi 0. Contoh, jika Rounding Target
                      bernilai 100 maka Total Pembayaran 9050,5 akan dibulatkan
                      menjadi 9000.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutOtherSetting>
  )
}

export default SalesSettings
