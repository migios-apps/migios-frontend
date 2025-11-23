// Status colors untuk membership dan general status
export const statusColor: Record<string, string> = {
  sukses: "bg-emerald-100 text-emerald-700 border-emerald-300",
  active: "bg-green-100 text-green-700 border-green-300",
  inactive: "bg-gray-100 text-gray-700 border-gray-300",
  warning: "bg-amber-100 text-amber-700 border-amber-300",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  expired: "bg-red-100 text-red-700 border-red-300",
  freeze: "bg-cyan-100 text-cyan-700 border-cyan-300",
  error: "bg-rose-100 text-rose-700 border-rose-300",
  approve: "bg-teal-100 text-teal-700 border-teal-300",
  rejected: "bg-orange-100 text-orange-700 border-orange-300",
}

// Status colors untuk payment
export const statusPaymentColor: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-300",
  part_paid: "bg-amber-200 text-amber-700 border-amber-300",
  unpaid: "bg-gray-100 text-gray-700 border-gray-300",
  overdue: "bg-rose-100 text-rose-700 border-rose-300",
  refunded: "bg-purple-100 text-purple-700 border-purple-300",
  void: "bg-red-100 text-red-700 border-red-300",
  pending: "bg-gray-900 text-gray-100 border-gray-900",
  completed: "bg-green-100 text-green-700 border-green-300",
}
