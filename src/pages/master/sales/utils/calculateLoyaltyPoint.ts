import { SettingsType } from "@/services/api/@types/settings/settings"

interface CalculateLoyaltyPointProps {
  items: Array<{
    loyalty_point?: {
      points: number
      expired_type: string
      expired_value: number
    } | null
    quantity?: number
  }>
  total_amount: number
  settings: SettingsType | null | undefined
  hasRedeemItems: boolean
}

/**
 * Menghitung total loyalty point yang akan didapatkan customer
 * berdasarkan settings dan items yang dibeli
 */
export function calculateLoyaltyPoint(
  data: CalculateLoyaltyPointProps
): number {
  const { items, total_amount, settings, hasRedeemItems } = data

  // Jika loyalty tidak enabled, return 0
  if (!settings || settings.loyalty_enabled !== 1) {
    return 0
  }

  // Jika ada redeem items dan earnPointsWhenUsingPoints false, return 0
  if (hasRedeemItems && !settings.loyalty_earn_points_when_using_points) {
    return 0
  }

  // Jika earn by total order aktif
  if (settings.loyalty_earn_point_by_total_order) {
    // Cek apakah total_amount memenuhi minimum total order
    if (total_amount < settings.loyalty_min_total_order) {
      return 0
    }

    let pointsEarned = settings.loyalty_points_earned_by_total_order || 0

    // Jika loyalty_earn_point_with_multiple true, hitung kelipatan berdasarkan total_amount
    // Contoh: min_total_order = 100.000, points = 10, total_amount = 250.000
    // Kelipatan = floor(250.000 / 100.000) = 2
    // Total points = 10 * 2 = 20
    if (
      settings.loyalty_earn_point_with_multiple &&
      settings.loyalty_min_total_order > 0
    ) {
      const multiplier = Math.floor(
        total_amount / settings.loyalty_min_total_order
      )
      pointsEarned =
        (settings.loyalty_points_earned_by_total_order || 0) * multiplier
    }

    return pointsEarned
  }

  // Jika earn by item (default)
  const totalPoints = items.reduce((acc, item) => {
    if (!item.loyalty_point || !item.loyalty_point.points) {
      return acc
    }

    const points = item.loyalty_point.points
    const quantity = item.quantity || 1

    // Jika loyalty_earn_point_with_multiple true, kalikan dengan qty
    if (settings.loyalty_earn_point_with_multiple && quantity > 1) {
      return acc + points * quantity
    }

    // Jika tidak, hanya dapat 1x poin per item
    return acc + points
  }, 0)

  return totalPoints
}
