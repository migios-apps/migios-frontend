import { useState } from "react"
import { InfoCircle } from "iconsax-reactjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import LayoutOtherSetting from "../Layout"

type MembershipFeature = {
  id: string
  title: string
  description: string
  enabled: boolean
  category: "access" | "booking" | "benefits" | "restrictions"
  isPremium?: boolean
}

type MembershipSettings = {
  features: MembershipFeature[]
  globalSettings: {
    allowMultipleLocations: boolean
    requireCheckInApproval: boolean
    enableGuestPass: boolean
  }
}

const INITIAL_SETTINGS: MembershipSettings = {
  features: [
    {
      id: "multi_location_access",
      title: "Akses Multi Lokasi",
      description: "Member dapat check-in di semua cabang gym",
      enabled: true,
      category: "access",
    },
    {
      id: "unlimited_checkin",
      title: "Check-in Tanpa Batas",
      description: "Member dapat check-in kapan saja tanpa batasan waktu",
      enabled: true,
      category: "access",
    },
    {
      id: "guest_pass",
      title: "Guest Pass",
      description: "Member dapat membawa tamu dengan biaya tambahan",
      enabled: false,
      category: "access",
    },
    {
      id: "class_booking",
      title: "Booking Kelas",
      description: "Member dapat melakukan booking kelas fitness",
      enabled: true,
      category: "booking",
    },
    {
      id: "pt_booking",
      title: "Booking Personal Trainer",
      description: "Member dapat melakukan booking sesi personal trainer",
      enabled: true,
      category: "booking",
    },
    {
      id: "advance_booking",
      title: "Booking Jauh Hari",
      description: "Member dapat booking hingga 30 hari ke depan",
      enabled: false,
      category: "booking",
      isPremium: true,
    },
    {
      id: "priority_booking",
      title: "Priority Booking",
      description: "Member mendapat prioritas dalam booking kelas populer",
      enabled: false,
      category: "booking",
      isPremium: true,
    },
    {
      id: "locker_access",
      title: "Akses Locker",
      description: "Member dapat menggunakan locker secara gratis",
      enabled: true,
      category: "benefits",
    },
    {
      id: "towel_service",
      title: "Layanan Handuk",
      description: "Member mendapat layanan handuk bersih gratis",
      enabled: false,
      category: "benefits",
    },
    {
      id: "parking_free",
      title: "Parkir Gratis",
      description: "Member mendapat fasilitas parkir gratis",
      enabled: true,
      category: "benefits",
    },
    {
      id: "member_discount",
      title: "Diskon Member",
      description: "Member mendapat diskon untuk pembelian produk dan layanan",
      enabled: true,
      category: "benefits",
    },
    {
      id: "freeze_membership",
      title: "Freeze Membership",
      description: "Member dapat membekukan membership sementara",
      enabled: true,
      category: "restrictions",
    },
    {
      id: "transfer_membership",
      title: "Transfer Membership",
      description: "Member dapat mentransfer membership ke orang lain",
      enabled: false,
      category: "restrictions",
    },
  ],
  globalSettings: {
    allowMultipleLocations: true,
    requireCheckInApproval: false,
    enableGuestPass: false,
  },
}

const CATEGORY_LABELS = {
  access: "Akses & Check-in",
  booking: "Booking & Reservasi",
  benefits: "Fasilitas & Benefit",
  restrictions: "Pembatasan & Transfer",
}

const MembershipSetting = () => {
  const [settings, setSettings] = useState<MembershipSettings>(INITIAL_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFeatureToggle = (featureId: string) => {
    setSettings((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.id === featureId
          ? { ...feature, enabled: !feature.enabled }
          : feature
      ),
    }))
    setHasChanges(true)
  }

  const handleGlobalSettingToggle = (
    settingKey: keyof typeof settings.globalSettings
  ) => {
    setSettings((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        [settingKey]: !prev.globalSettings[settingKey],
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // TODO: Implement API call to save settings
    console.log("Saving membership settings:", settings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(INITIAL_SETTINGS)
    setHasChanges(false)
  }

  const groupedFeatures = settings.features.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = []
      }
      acc[feature.category].push(feature)
      return acc
    },
    {} as Record<string, MembershipFeature[]>
  )

  return (
    <LayoutOtherSetting>
      <div className="relative mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Pengaturan Membership
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Atur hak akses dan fasilitas yang tersedia untuk member
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button size="sm" disabled={!hasChanges} onClick={handleSave}>
              Simpan Perubahan
            </Button>
          </div>
        </div>

        {/* Global Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Pengaturan Global</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoCircle size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pengaturan yang berlaku untuk semua member</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-border flex items-center justify-between border-b py-3">
                <div>
                  <h4 className="text-foreground font-medium">
                    Izinkan Akses Multi Lokasi
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Member dapat menggunakan fasilitas di semua cabang
                  </p>
                </div>
                <Switch
                  checked={settings.globalSettings.allowMultipleLocations}
                  onCheckedChange={() =>
                    handleGlobalSettingToggle("allowMultipleLocations")
                  }
                />
              </div>

              <div className="border-border flex items-center justify-between border-b py-3">
                <div>
                  <h4 className="text-foreground font-medium">
                    Persetujuan Check-in
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Memerlukan persetujuan staff untuk check-in member
                  </p>
                </div>
                <Switch
                  checked={settings.globalSettings.requireCheckInApproval}
                  onCheckedChange={() =>
                    handleGlobalSettingToggle("requireCheckInApproval")
                  }
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-foreground font-medium">
                    Aktifkan Guest Pass
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Member dapat membawa tamu dengan sistem guest pass
                  </p>
                </div>
                <Switch
                  checked={settings.globalSettings.enableGuestPass}
                  onCheckedChange={() =>
                    handleGlobalSettingToggle("enableGuestPass")
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Categories */}
        {Object.entries(groupedFeatures).map(([category, features]) => (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>
                  {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                </CardTitle>
                <Badge variant="secondary">
                  {features.filter((f) => f.enabled).length}/{features.length}{" "}
                  aktif
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-between py-3 ${
                      index < features.length - 1
                        ? "border-border border-b"
                        : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-medium">
                          {feature.title}
                        </h4>
                        {feature.isPremium && (
                          <Badge variant="outline" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        <Card className="bg-muted">
          <CardContent className="text-center">
            <h3 className="text-foreground mb-2 text-lg font-semibold">
              Ringkasan Pengaturan
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              {Object.entries(groupedFeatures).map(([category, features]) => (
                <div key={category} className="text-center">
                  <div className="text-primary text-lg font-bold">
                    {features.filter((f) => f.enabled).length}
                  </div>
                  <div className="text-muted-foreground">
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutOtherSetting>
  )
}

export default MembershipSetting
