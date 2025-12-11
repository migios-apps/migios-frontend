import React, { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SettingsType } from "@/services/api/@types/settings/settings"
import { CreateTaxCalculateType } from "@/services/api/@types/settings/taxes"
import { apiCreateOrUpdateTaxCalculate } from "@/services/api/settings/TaxesService"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { TaxCalculationType } from "./types"

type DialogTaxCalculationProps = {
  settingsData?: SettingsType
  open: boolean
  onClose: () => void
}

const DialogTaxCalculation: React.FC<DialogTaxCalculationProps> = ({
  settingsData,
  open,
  onClose,
}) => {
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculationType>(0)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open && settingsData && settingsData.tax_calculation !== undefined) {
      console.log("Setting tax calculation to:", settingsData.tax_calculation)
      setTaxCalculation(settingsData.tax_calculation as TaxCalculationType)
    }
  }, [open, settingsData])

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] })
    onClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateTaxCalculateType) =>
      apiCreateOrUpdateTaxCalculate(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Perhitungan Pajak</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div
            className={cn(
              "border-border flex cursor-pointer items-start gap-4 rounded-lg border p-6 transition-colors",
              taxCalculation === 1
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
            onClick={() => setTaxCalculation(1)}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                taxCalculation === 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              )}
            >
              {taxCalculation === 1 && <Check className="size-4" />}
            </div>
            <div className="flex-1">
              <div className="text-foreground mb-2 font-semibold">
                Harga Retail Termasuk Pajak
              </div>
              <div className="text-muted-foreground text-sm">
                Pajak = (Tarif Pajak * Harga retail) / (1 + Tarif Pajak)
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                Misalnya: pajak 20% untuk item $10,00 menjadi $1,67
              </div>
            </div>
          </div>

          <div
            className={cn(
              "border-border flex cursor-pointer items-start gap-4 rounded-lg border p-6 transition-colors",
              taxCalculation === 0
                ? "border-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
            onClick={() => setTaxCalculation(0)}
          >
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                taxCalculation === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              )}
            >
              {taxCalculation === 0 && <Check className="size-4" />}
            </div>
            <div className="flex-1">
              <div className="text-foreground mb-2 font-semibold">
                Harga Retail Tidak Termasuk Pajak (Default)
              </div>
              <div className="text-muted-foreground text-sm">
                Pajak = Tarif Pajak * Harga retail
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                Misalnya: pajak 20% untuk item $10,00 menjadi $2,00
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Batal
          </Button>
          <Button
            disabled={create.isPending}
            onClick={() => {
              create.mutate({ tax_calculation: taxCalculation })
            }}
          >
            {create.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogTaxCalculation
