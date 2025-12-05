export const dummySalesData = {
  club_id: 1,
  member_id: 123, // diperlukan karena ada item package
  discount_type: "percent" as const,
  discount: 10,
  tax_rate: 11,
  is_paid: 1,
  due_date: new Date("2024-12-31"),
  notes: "Catatan transaksi",
  transaction_items: [
    {
      item_type: "package" as const,
      package_id: 1,
      product_id: null,
      name: "Paket Membership Gold",
      quantity: 1,
      price: 1000000,
      discount_type: "percent" as const,
      discount: 5,
      duration: 12,
      duration_type: "month" as const,
      session_duration: 60,
      extra_session: 2,
      extra_day: 7,
      start_date: new Date("2024-01-01"),
      notes: "Catatan item package",
    },
    {
      item_type: "product" as const,
      package_id: null,
      product_id: 2,
      name: "Protein Shake",
      quantity: 2,
      price: 50000,
      discount_type: "nominal" as const,
      discount: 10000,
      duration: null,
      duration_type: null,
      session_duration: null,
      extra_session: null,
      extra_day: null,
      start_date: null,
      notes: "Catatan item produk",
    },
  ],
  payments: [
    {
      amount: 1090000,
      rekening_id: 1,
      reference_no: "PAY-001",
      notes: "Pembayaran pertama",
      payment_date: new Date("2024-12-29"),
    },
  ],
  refund_from: [
    {
      rekening_id: 2,
      amount: 50000,
      notes: "Refund dari pembayaran double",
    },
  ],
}

// Contoh transaksi produk saja (tanpa package)
export const dummyProductOnlyData = {
  club_id: 1,
  member_id: null, // tidak diperlukan karena tidak ada package
  discount_type: "nominal" as const,
  discount: 25000,
  tax_rate: 11,
  is_paid: 2,
  due_date: new Date("2024-12-31"),
  notes: "Transaksi produk saja",
  transaction_items: [
    {
      item_type: "product" as const,
      package_id: null,
      product_id: 3,
      name: "Handuk",
      quantity: 3,
      price: 75000,
      discount_type: "percent" as const,
      discount: 0,
      duration: null,
      duration_type: null,
      session_duration: null,
      extra_session: null,
      extra_day: null,
      start_date: null,
      notes: null,
    },
  ],
  payments: [], // belum ada pembayaran
  refund_from: [], // belum ada refund
}
