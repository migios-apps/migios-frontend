import { useState } from "react"
import {
  Infinity as InfinityIcon,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  User,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LayoutGymSetting from "./Layout"

type PlanFeature = {
  name: string
  included: boolean
  limit?: string
}

type MigiosPlan = {
  id: string
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  memberLimit: number | "unlimited"
  branchLimit: number | "unlimited"
  features: PlanFeature[]
  isPopular: boolean
  isCurrentPlan: boolean
  color: string
  icon: React.ReactNode
}

const MIGIOS_PLANS: MigiosPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Cocok untuk gym kecil yang baru memulai",
    price: {
      monthly: 299000,
      yearly: 2990000,
    },
    memberLimit: 100,
    branchLimit: 1,
    features: [
      { name: "Member Management", included: true },
      { name: "Basic Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "10 kelas/bulan" },
      { name: "Staff Management", included: true, limit: "3 staff" },
      { name: "WhatsApp Integration", included: false },
      { name: "Advanced Analytics", included: false },
      { name: "Multi-Branch Support", included: false },
      { name: "Custom Branding", included: false },
      { name: "API Access", included: false },
    ],
    isPopular: false,
    isCurrentPlan: false,
    color: "blue",
    icon: <User className="size-6 text-blue-600" />,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Untuk gym menengah dengan fitur lengkap",
    price: {
      monthly: 599000,
      yearly: 5990000,
    },
    memberLimit: 500,
    branchLimit: 3,
    features: [
      { name: "Member Management", included: true },
      { name: "Advanced Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "Unlimited" },
      { name: "Staff Management", included: true, limit: "10 staff" },
      { name: "WhatsApp Integration", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Multi-Branch Support", included: true, limit: "3 cabang" },
      { name: "Custom Branding", included: true },
      { name: "API Access", included: false },
    ],
    isPopular: true,
    isCurrentPlan: true,
    color: "green",
    icon: <Users className="size-6 text-green-600" />,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Solusi lengkap untuk jaringan gym besar",
    price: {
      monthly: 1299000,
      yearly: 12990000,
    },
    memberLimit: "unlimited",
    branchLimit: "unlimited",
    features: [
      { name: "Member Management", included: true },
      { name: "Advanced Reporting", included: true },
      { name: "Payment Tracking", included: true },
      { name: "Class Scheduling", included: true, limit: "Unlimited" },
      { name: "Staff Management", included: true, limit: "Unlimited" },
      { name: "WhatsApp Integration", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Multi-Branch Support", included: true, limit: "Unlimited" },
      { name: "Custom Branding", included: true },
      { name: "API Access", included: true },
    ],
    isPopular: false,
    isCurrentPlan: false,
    color: "purple",
    icon: <Crown className="size-6 text-purple-600" />,
  },
]

const GymPlan = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  )
  const [, setSelectedPlan] = useState<string>("professional")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getPlanColor = (color: string, variant: "bg" | "border" | "text") => {
    const colors = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
      },
    }
    return colors[color as keyof typeof colors]?.[variant] || ""
  }

  return (
    <LayoutGymSetting>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Paket Langganan Migios
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Pilih paket yang sesuai dengan kebutuhan gym Anda
          </p>
        </div>

        {/* Current Plan Status */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50 dark:border-green-800 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="size-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">
                  Paket Aktif: Professional
                </h3>
                <p className="text-muted-foreground text-sm">
                  Berlaku hingga 15 September 2024
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(599000)}
              </div>
              <div className="text-muted-foreground text-sm">/bulan</div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              Bulanan
            </button>
            <button
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              <span>Tahunan</span>
              <Badge variant="default" className="ml-2">
                Hemat 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {MIGIOS_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 ${
                plan.isCurrentPlan
                  ? `${getPlanColor(plan.color, "border")} ring-2 ring-green-200 dark:ring-green-800`
                  : "hover:shadow-lg"
              } ${plan.isPopular ? "scale-105" : ""}`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <Badge
                    variant="default"
                    className="bg-orange-500 px-4 py-1 text-white"
                  >
                    Paling Populer
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {plan.isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="default"
                    className="bg-green-500 px-3 py-1 text-white"
                  >
                    Paket Aktif
                  </Badge>
                </div>
              )}

              <CardContent className="p-6">
                {/* Plan Header */}
                <div className="mb-6 text-center">
                  <div
                    className={`h-16 w-16 ${getPlanColor(plan.color, "bg")} mx-auto mb-4 flex items-center justify-center rounded-full`}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="text-foreground mb-2 text-xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 text-center">
                  <div className="text-foreground text-3xl font-bold">
                    {formatPrice(plan.price[billingCycle])}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    /{billingCycle === "monthly" ? "bulan" : "tahun"}
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="mt-1 text-xs text-green-600">
                      Hemat{" "}
                      {formatPrice(plan.price.monthly * 12 - plan.price.yearly)}{" "}
                      per tahun
                    </div>
                  )}
                </div>

                {/* Plan Limits */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <User className="text-muted-foreground size-4" />
                    </div>
                    <div className="text-foreground text-sm font-medium">
                      {plan.memberLimit === "unlimited" ? (
                        <div className="flex items-center justify-center gap-1">
                          <InfinityIcon className="size-4" />
                          <span>Unlimited</span>
                        </div>
                      ) : (
                        `${plan.memberLimit} Member`
                      )}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="mb-1 flex items-center justify-center">
                      <Calendar className="text-muted-foreground size-4" />
                    </div>
                    <div className="text-foreground text-sm font-medium">
                      {plan.branchLimit === "unlimited" ? (
                        <div className="flex items-center justify-center gap-1">
                          <InfinityIcon className="size-4" />
                          <span>Unlimited</span>
                        </div>
                      ) : (
                        `${plan.branchLimit} Cabang`
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {feature.included ? (
                          <CheckCircle2 className="size-4 text-green-500" />
                        ) : (
                          <div className="border-muted-foreground/30 size-4 rounded-full border-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`text-sm ${
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.name}
                        </span>
                        {feature.limit && feature.included && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({feature.limit})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  variant={plan.isCurrentPlan ? "outline" : "default"}
                  disabled={plan.isCurrentPlan}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.isCurrentPlan ? (
                    "Paket Aktif"
                  ) : (
                    <>
                      Pilih Paket
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Fitur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-foreground px-4 py-3 text-left font-medium">
                      Fitur
                    </th>
                    {MIGIOS_PLANS.map((plan) => (
                      <th
                        key={plan.id}
                        className="text-foreground px-4 py-3 text-center font-medium"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MIGIOS_PLANS[0].features.map((_, featureIndex) => (
                    <tr key={featureIndex} className="border-border border-b">
                      <td className="text-foreground px-4 py-3 text-sm">
                        {MIGIOS_PLANS[0].features[featureIndex].name}
                      </td>
                      {MIGIOS_PLANS.map((plan) => (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          {plan.features[featureIndex].included ? (
                            <div className="flex items-center justify-center">
                              <CheckCircle2 className="size-4 text-green-500" />
                              {plan.features[featureIndex].limit && (
                                <span className="text-muted-foreground ml-1 text-xs">
                                  {plan.features[featureIndex].limit}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="border-muted-foreground/30 mx-auto size-4 rounded-full border-2" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ or Support */}
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Butuh Bantuan Memilih Paket?
            </h3>
            <p className="text-muted-foreground mb-4">
              Tim kami siap membantu Anda menemukan paket yang tepat
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm">
                Hubungi Sales
              </Button>
              <Button size="sm">Chat WhatsApp</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutGymSetting>
  )
}

export default GymPlan
