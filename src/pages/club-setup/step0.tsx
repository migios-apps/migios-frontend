import React from "react"
import { Badge } from "@/components/ui/badge"
import { PricingSection, PlanPricing } from "@/components/pricing-section"
import { ReturnClubFormSchema } from "./validation"

type PropsType = {
  onNext?: () => void
  formProps: ReturnClubFormSchema
  onPlanSelect?: (plan: PlanPricing, isYearly: boolean) => void
}

const Step0: React.FC<PropsType> = ({ onNext, onPlanSelect }) => {
  const handlePlanClick = (plan: PlanPricing, isYearly: boolean) => {
    onPlanSelect?.(plan, isYearly)
    onNext?.()
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mx-auto mb-4 flex max-w-2xl flex-col items-center justify-center text-center">
        <Badge variant="outline" className="mb-2">
          Pilihan Paket
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pilih Paket Terbaik Anda
        </h2>
        <p className="text-muted-foreground text-base">
          Temukan solusi yang tepat untuk mendukung pertumbuhan dan kesuksesan
          gym Anda ke level berikutnya.
        </p>
      </div>

      <PricingSection onPlanClick={handlePlanClick} />
    </div>
  )
}

export default Step0
