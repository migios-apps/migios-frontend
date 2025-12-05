import { ProcessedItem } from "./generateCartData"

export type GroupedDisplayItem =
  | {
      type: "item"
      item: ProcessedItem
      originalIndex: number
    }
  | {
      type: "redeem_collection"
      rewardId: number
      rewardName?: string
      items: ProcessedItem[]
      originalIndices: number[]
    }

/**
 * Mengelompokkan items berdasarkan loyalty_reward_id untuk redeem items
 * Items dengan source_from = 'redeem_item' akan dikelompokkan berdasarkan loyalty_reward_id
 * Items dengan source_from = 'item' tetap sebagai individual items
 */
export function groupItemsByRedeem(
  items: ProcessedItem[]
): GroupedDisplayItem[] {
  const result: GroupedDisplayItem[] = []
  const processedIndices = new Set<number>()

  // Group redeem items
  const redeemGroups = new Map<
    number,
    { items: ProcessedItem[]; indices: number[] }
  >()

  items.forEach((item, index) => {
    if (
      item.source_from === "redeem_item" &&
      item.loyalty_reward_id !== null &&
      item.loyalty_reward_id !== undefined
    ) {
      const rewardId = item.loyalty_reward_id
      if (!redeemGroups.has(rewardId)) {
        redeemGroups.set(rewardId, { items: [], indices: [] })
      }
      const group = redeemGroups.get(rewardId)!
      group.items.push(item)
      group.indices.push(index)
      processedIndices.add(index)
    }
  })

  // Add grouped redeem items to result
  redeemGroups.forEach((group, rewardId) => {
    // Ambil loyalty_reward_name dari item pertama (semua item dalam group punya nama yang sama)
    const rewardName = group.items[0]?.loyalty_reward_name || undefined
    result.push({
      type: "redeem_collection",
      rewardId,
      rewardName,
      items: group.items,
      originalIndices: group.indices,
    })
  })

  // Add regular items (source_from = 'item')
  items.forEach((item, index) => {
    if (!processedIndices.has(index)) {
      result.push({
        type: "item",
        item,
        originalIndex: index,
      })
    }
  })

  // Sort to maintain original order as much as possible
  return result.sort((a, b) => {
    const aIndex =
      a.type === "item" ? a.originalIndex : Math.min(...a.originalIndices)
    const bIndex =
      b.type === "item" ? b.originalIndex : Math.min(...b.originalIndices)
    return aIndex - bIndex
  })
}
