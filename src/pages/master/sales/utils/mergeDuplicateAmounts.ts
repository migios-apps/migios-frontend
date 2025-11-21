export function mergeDuplicateAmounts(data: any[]) {
  return Object.values(
    data.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { ...item }
      } else {
        acc[item.id].amount += item.amount
      }
      return acc
    }, {})
  )
}
