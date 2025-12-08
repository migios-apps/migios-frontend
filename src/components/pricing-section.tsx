"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { currencyFormat } from "./ui/input-currency"

export interface PlanPricing {
  name: string
  type: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  popular: boolean
  includesPrevious?: string
  cta: string
}

export interface PlanFeature {
  name: string
  included: boolean
  limit?: string
}

const plans: PlanPricing[] = [
  {
    name: "Free",
    type: "free",
    description: "Cocok untuk gym kecil yang baru memulai",
    monthlyPrice: 0,
    yearlyPrice: 2990000,
    features: [
      { name: "Maksimal 100 Member", included: true },
      { name: "1 Cabang Gym", included: true },
      { name: "Member Management", included: true },
      { name: "Basic Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "5 kelas/bulan" },
      { name: "Staff Management", included: true, limit: "3 staff" },
      { name: "WhatsApp Integration", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Multi-Branch Support", included: false },
    ],
    cta: "Pilih Paket",
    popular: false,
  },
  {
    name: "Basic",
    type: "basic",
    description: "Untuk gym menengah dengan fitur lengkap",
    monthlyPrice: 599000,
    yearlyPrice: 5990000,
    features: [
      { name: "Maksimal 500 Member", included: true },
      { name: "Maksimal 3 Cabang Gym", included: true },
      { name: "Member Management", included: true },
      { name: "Basic Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "Unlimited" },
      { name: "Staff Management", included: true, limit: "10 staff" },
      { name: "WhatsApp Integration", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Multi-Branch Support", included: true, limit: "3 cabang" },
      { name: "Custom Branding", included: false },
    ],
    cta: "Pilih Paket",
    popular: true,
    includesPrevious: "Semua fitur Starter, plus",
  },
  {
    name: "Premium",
    type: "premium",
    description: "Solusi lengkap untuk jaringan gym besar",
    monthlyPrice: 1299000,
    yearlyPrice: 12990000,
    features: [
      { name: "Unlimited Member", included: true },
      { name: "Unlimited Cabang Gym", included: true },
      { name: "Member Management", included: true },
      { name: "Basic Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "Unlimited" },
      { name: "Staff Management", included: true, limit: "Unlimited" },
      { name: "WhatsApp Integration", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Multi-Branch Support", included: true, limit: "Unlimited" },
      { name: "Custom Branding", included: true },
    ],
    cta: "Pilih Paket",
    popular: false,
    includesPrevious: "Semua fitur Professional, plus",
  },
]

type PricingSectionProps = {
  onPlanClick?: (plan: PlanPricing, isYearly: boolean) => void
}

export function PricingSection({ onPlanClick }: PricingSectionProps = {}) {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mx-auto mb-4 max-w-2xl text-center">
        {/* Billing Toggle */}
        <div className="mb-2 flex items-center justify-center">
          <div className="bg-muted relative inline-flex rounded-full p-1">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "relative z-10 rounded-full px-6 py-2 font-semibold transition-all duration-200",
                !isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground bg-transparent"
              )}
            >
              Bulanan
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "relative z-10 rounded-full px-6 py-2 font-semibold transition-all duration-200",
                isYearly
                  ? "bg-background text-foreground shadow-sm"
                  : "text-foreground bg-transparent"
              )}
            >
              Tahunan
            </button>
          </div>
        </div>

        <p className="text-muted-foreground text-sm">
          <span className="text-primary font-semibold">Hemat 17%</span> untuk
          pembayaran Tahunan
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-6xl backdrop-blur-xs">
        <div className="rounded-xl border">
          <div className="grid lg:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "row-span-4 grid grid-rows-subgrid gap-4 p-4",
                  plan.popular
                    ? "bg-card ring-foreground/10 mx-4 my-2 rounded-xl border-transparent shadow-xl ring-1 backdrop-blur"
                    : ""
                )}
              >
                <div
                  className={cn(
                    "flex flex-col gap-4",
                    plan.popular ? "bg-accent rounded-xl p-3" : "pt-4"
                  )}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="text-lg font-semibold tracking-tight">
                      {plan.name}
                    </div>
                    <div className="text-muted-foreground text-sm text-balance">
                      {plan.description}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="mb-1 flex h-9 items-center overflow-hidden text-3xl font-bold">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isYearly ? "year" : "month"}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {currencyFormat(
                            isYearly ? plan.yearlyPrice : plan.monthlyPrice
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {isYearly ? "/tahun" : "/bulan"}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={cn(
                        "my-2 w-full cursor-pointer",
                        plan.popular
                          ? "bg-primary ring-primary/15 text-primary-foreground hover:bg-primary/90 border-[0.5px] border-white/25 shadow-md ring-1 shadow-black/20"
                          : "bg-background ring-foreground/10 hover:bg-muted/50 border border-transparent shadow-sm ring-1 shadow-black/15"
                      )}
                      variant={plan.popular ? "default" : "secondary"}
                      onClick={() => onPlanClick?.(plan, isYearly)}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <ul role="list" className="space-y-3 text-sm">
                    {plan.includesPrevious && (
                      <li className="flex items-center gap-3 font-medium">
                        {plan.includesPrevious}
                      </li>
                    )}
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {feature.included ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <div className="border-muted-foreground/30 size-4 rounded-full border-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span
                            className={cn(
                              feature.included
                                ? "text-foreground"
                                : "text-muted-foreground line-through"
                            )}
                          >
                            {feature.name}
                          </span>
                          {feature.limit && feature.included && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({feature.limit})
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
