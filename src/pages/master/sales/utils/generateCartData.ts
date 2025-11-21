import { currencyFormat } from "@/components/ui/input-currency"
import {
  TransactionItemSchema,
  ValidationTransactionSchema,
} from "./validation"

export interface TaxItem {
  id: number
  type: string
  name: string
  rate: number
  tax_amount: number
  ftax_amount: string
}

export type ProcessedItem = TransactionItemSchema & {
  taxes: TaxItem[]

  // Nilai harga dasar (setelah perhitungan pajak jika include tax)
  price: number
  gross_amount: number
  discount_amount: number
  net_amount: number
  total_tax_amount: number
  total_amount: number

  // Original values (sebelum pengaruh pajak)
  original_price: number
  original_gross_amount: number
  original_discount_amount: number
  original_net_amount: number
  original_total_amount: number

  // Formatted fields untuk harga dasar
  fprice: string
  fgross_amount: string
  fdiscount_amount: string
  fnet_amount: string
  ftotal_tax_amount: string
  ftotal_amount: string

  // Formatted fields untuk original values
  foriginal_price: string
  foriginal_gross_amount: string
  foriginal_discount_amount: string
  foriginal_net_amount: string
  foriginal_total_amount: string
}

export type CartDataGenratedType = {
  // Informasi dasar transaksi
  club_id?: number
  member_id?: number
  employee_id?: number
  discount_type: ValidationTransactionSchema["discount_type"]
  discount: ValidationTransactionSchema["discount"]
  is_paid?: number
  due_date?: string
  notes?: ValidationTransactionSchema["notes"]
  billing_address?: string
  shipping_address?: string
  items: ProcessedItem[]
  payments: ValidationTransactionSchema["payments"]
  refund_from: ValidationTransactionSchema["refund_from"]
  item_include_tax: ValidationTransactionSchema["tax_calculation"]

  // Nilai dengan pajak
  subtotal: number
  gross_amount: number
  total_tax: number
  total_discount: number
  total_amount: number
  balance_amount: number
  return_amount: number

  // Nilai original (sebelum pajak)
  original_subtotal: number
  original_gross_amount: number
  original_total_discount: number
  original_total_amount: number

  // Formatted fields untuk nilai dengan pajak
  fsubtotal: string
  fgross_amount: string
  ftotal_tax: string
  ftotal_discount: string
  ftotal_amount: string
  fbalance_amount: string
  freturn_amount: string

  // Formatted fields untuk nilai original
  foriginal_subtotal: string
  foriginal_gross_amount: string
  foriginal_total_discount: string
  foriginal_total_amount: string
}

type CalculateDiscountAmountProps = {
  price: number
  discount_type: "percent" | "nominal"
  discount_amount?: number
}

/**
 * Calculate discount amount berdasarkan type dan value
 */
function calculateDiscountAmount(data: CalculateDiscountAmountProps): number {
  if (data.discount_type === "percent" && Number(data.discount_amount) > 0) {
    return data.price * ((data.discount_amount ?? 0) / 100)
  } else if (data.discount_type === "nominal") {
    return data.discount_amount ?? 0
  } else {
    return 0
  }
}

/**
 * Generate cart data dari watchTransaction dengan tax calculation sesuai backend logic
 * @param watchTransaction - Data dari transactionSchema.watch()
 * @returns CartDataGenratedType yang siap untuk API
 */
export function generateCartData(
  watchTransaction: ValidationTransactionSchema
): CartDataGenratedType {
  // Validasi input
  if (!watchTransaction) {
    throw new Error("watchTransaction is required")
  }

  const {
    items = [],
    taxes = [],
    tax_calculation = 0,
    discount_type = "nominal",
    discount = 0,
    member,
    employee,
    payments = [],
    refund_from = [],
    notes,
  } = watchTransaction

  // Validasi tax_calculation value
  if (![0, 1].includes(tax_calculation)) {
    console.warn(
      `Invalid tax_calculation value: ${tax_calculation}. Using default: 0`
    )
  }

  // Buat map untuk tax berdasarkan tipe
  const taxByType = taxes.reduce(
    (acc: Record<string, ValidationTransactionSchema["taxes"]>, tax) => {
      const taxType = tax.type || "default"
      if (!acc[taxType]) {
        acc[taxType] = []
      }
      acc[taxType].push(tax)
      return acc
    },
    {} as Record<string, ValidationTransactionSchema["taxes"]>
  )

  // Process setiap item dengan logic yang sama seperti backend
  const processedItems = items
    .map((item): ProcessedItem | null => {
      // Validasi item
      if (!item || typeof item !== "object") {
        console.warn("Invalid item detected, skipping:", item)
        return null
      }

      // Ambil taxes berdasarkan item type
      let itemTaxes: ValidationTransactionSchema["taxes"] = []
      if (item.item_type === "package") {
        itemTaxes = taxByType[item.package_type || "package"] || []
      } else if (item.item_type === "product") {
        itemTaxes = taxByType["product"] || []
      }

      // ===== BAGIAN 1: PERHITUNGAN HARGA ORIGINAL (SEBELUM PAJAK) =====
      // Simpan harga asli sebelum perhitungan pajak
      const original_price = Math.max(
        0,
        (item.data as any)?.price || item.price || 0
      )

      // Hitung original gross amount (harga asli sebelum pajak)
      const quantity = Math.max(0, item.quantity || 1)
      const original_gross_amount = original_price * quantity

      // Hitung original discount amount (diskon dari harga asli sebelum pajak)
      const discountType = item.discount_type || "nominal"
      const discountValue = item.discount || 0
      const original_discount_amount = calculateDiscountAmount({
        price: original_gross_amount,
        discount_type: discountType,
        discount_amount: discountValue,
      })
      const final_original_discount = Math.min(
        original_discount_amount,
        original_gross_amount
      )

      // Original net amount (net amount sebelum pajak)
      const original_net_amount =
        original_gross_amount - final_original_discount

      // ===== BAGIAN 2: PERHITUNGAN HARGA DENGAN PAJAK =====
      // Hitung total pajak terlebih dahulu untuk menentukan harga dasar
      let total_tax_amount = 0
      let base_price = original_price

      // Jika harga sudah termasuk pajak, hitung pajak dan kurangi dari harga
      if (tax_calculation === 1) {
        const total_tax_rate = itemTaxes.reduce(
          (sum: number, tax) => sum + (tax.rate || 0),
          0
        )
        if (total_tax_rate > 0) {
          // Hitung pajak dari harga yang sudah termasuk pajak
          total_tax_amount =
            (total_tax_rate * base_price) / (100 + total_tax_rate)
          // Harga dasar adalah harga dikurangi pajak
          base_price = base_price - total_tax_amount
        }
      }

      // Hitung gross amount dengan harga dasar
      const gross_amount = base_price * quantity

      // Hitung diskon dari gross amount
      const discount_amount = calculateDiscountAmount({
        price: gross_amount,
        discount_type: discountType,
        discount_amount: discountValue,
      })
      const final_discount = Math.min(discount_amount, gross_amount)

      // Net amount setelah diskon
      const net_amount = gross_amount - final_discount

      // Reset total_tax_amount untuk perhitungan ulang
      total_tax_amount = 0

      const taxesWithAmount: TaxItem[] = itemTaxes.map((tax) => {
        let tax_amount = 0
        const taxRate = tax.rate || 0

        // Perhitungan pajak berdasarkan pengaturan pajak
        if (tax_calculation === 1) {
          // Harga Retail Termasuk Pajak
          // Pajak = (Tarif Pajak * net_amount) / 100 (karena net_amount sudah harga tanpa pajak)
          tax_amount = (taxRate * net_amount) / 100
        } else {
          // Harga Retail Tidak Termasuk Pajak (tax_calculation === 0)
          // Pajak = Tarif Pajak * net_amount / 100
          tax_amount = (taxRate * net_amount) / 100
        }

        total_tax_amount += tax_amount

        const taxAmountRounded = parseFloat(tax_amount.toFixed(2))
        return {
          id: tax.id || 0,
          type: tax.type || "",
          name: tax.name || "",
          rate: taxRate,
          tax_amount: taxAmountRounded,
          ftax_amount: currencyFormat(taxAmountRounded || 0),
        }
      })

      // ===== BAGIAN 3: PERHITUNGAN TOTAL AMOUNT =====
      // 3.1 Original total amount (total amount sebelum pajak)
      // Karena ini adalah harga sebelum pajak, maka original_total_amount = original_net_amount
      const original_total_amount = original_net_amount

      // 3.2 Perhitungan total amount berdasarkan tax_calculation
      let total_amount
      if (tax_calculation === 1) {
        // Price include tax - total amount adalah net amount ditambah pajak (kembali ke harga asli)
        total_amount = net_amount + total_tax_amount
      } else {
        // Price exclude tax (tax_calculation === 0) - total amount adalah net amount ditambah pajak
        total_amount = net_amount + total_tax_amount
      }

      // ===== BAGIAN 4: PEMBULATAN NILAI =====
      // 4.1 Pembulatan nilai original (sebelum pajak)
      const originalPriceRounded = parseFloat(original_price.toFixed(2))
      const originalGrossAmountRounded = parseFloat(
        original_gross_amount.toFixed(2)
      )
      const originalDiscountRounded = parseFloat(
        final_original_discount.toFixed(2)
      )
      const originalNetAmountRounded = parseFloat(
        original_net_amount.toFixed(2)
      )
      const originalTotalAmountRounded = parseFloat(
        original_total_amount.toFixed(2)
      )

      // 4.2 Pembulatan nilai dengan pajak
      const priceRounded = parseFloat(base_price.toFixed(2))
      const grossAmountRounded = parseFloat(gross_amount.toFixed(2))
      const discountRounded = parseFloat(final_discount.toFixed(2))
      const netAmountRounded = parseFloat(net_amount.toFixed(2))
      const totalTaxRounded = parseFloat(total_tax_amount.toFixed(2))
      const totalAmountRounded = parseFloat(total_amount.toFixed(2))
      // ===== BAGIAN 5: RETURN ITEM =====
      return {
        ...item,
        // 5.1 Informasi item dasar
        item_type: item.item_type,
        package_id: item.package_id as any,
        product_id: item.product_id as any,
        quantity: item.quantity,
        discount_type: item.discount_type || "nominal",
        discount: item.discount || 0,
        extra_session: item.extra_session || 0,
        extra_day: item.extra_day || 0,
        name: item.name,
        is_promo: item.is_promo || 0,
        loyalty_point: item.loyalty_point || 0,
        duration: item.duration || 0,
        duration_type: item.duration_type || undefined,
        session_duration: item.session_duration || 0,
        taxes: taxesWithAmount,

        // 5.2 Nilai dengan perhitungan pajak
        price: priceRounded,
        gross_amount: grossAmountRounded,
        discount_amount: discountRounded,
        net_amount: netAmountRounded,
        total_tax_amount: totalTaxRounded,
        total_amount: totalAmountRounded,

        // 5.3 Original values (sebelum pajak)
        original_price: originalPriceRounded,
        original_gross_amount: originalGrossAmountRounded,
        original_discount_amount: originalDiscountRounded,
        original_net_amount: originalNetAmountRounded,
        original_total_amount: originalTotalAmountRounded,

        // 5.4 Formatted fields untuk nilai dengan pajak
        fprice: currencyFormat(priceRounded || 0),
        fgross_amount: currencyFormat(grossAmountRounded || 0),
        fdiscount_amount: currencyFormat(discountRounded || 0),
        fnet_amount: currencyFormat(netAmountRounded || 0),
        ftotal_tax_amount: currencyFormat(totalTaxRounded || 0),
        ftotal_amount: currencyFormat(totalAmountRounded || 0),

        // 5.5 Formatted fields untuk original values
        foriginal_price: currencyFormat(originalPriceRounded || 0),
        foriginal_gross_amount: currencyFormat(originalGrossAmountRounded || 0),
        foriginal_discount_amount: currencyFormat(originalDiscountRounded || 0),
        foriginal_net_amount: currencyFormat(originalNetAmountRounded || 0),
        foriginal_total_amount: currencyFormat(originalTotalAmountRounded || 0),
      }
    })
    .filter((item): item is ProcessedItem => item !== null) as ProcessedItem[]

  // ===== BAGIAN 1: PERHITUNGAN TOTAL DENGAN PAJAK =====
  // Hitung total keseluruhan dari semua item (dengan pajak)
  const grandTotal = parseFloat(
    processedItems
      .reduce((total, item) => total + item.total_amount, 0)
      .toFixed(2)
  )
  const totalTax = parseFloat(
    processedItems
      .reduce((total, item) => total + item.total_tax_amount, 0)
      .toFixed(2)
  )
  const totalItemDiscount = parseFloat(
    processedItems
      .reduce((total, item) => total + item.discount_amount, 0)
      .toFixed(2)
  )

  // ===== BAGIAN 2: PERHITUNGAN TOTAL ORIGINAL (SEBELUM PAJAK) =====
  // Hitung total keseluruhan dari semua item (original sebelum pajak)
  const originalGrandTotal = parseFloat(
    processedItems
      .reduce((total, item) => total + item.original_total_amount, 0)
      .toFixed(2)
  )
  const originalTotalItemDiscount = parseFloat(
    processedItems
      .reduce((total, item) => total + item.original_discount_amount, 0)
      .toFixed(2)
  )

  // ===== BAGIAN 3: PERHITUNGAN DISKON TRANSAKSI =====
  // 3.1 Diskon transaksi dengan pajak
  let transactionDiscount = 0
  if (discount_type && discount && discount > 0) {
    transactionDiscount = calculateDiscountAmount({
      price: grandTotal,
      discount_type: discount_type,
      discount_amount: discount,
    })
    transactionDiscount = Math.min(transactionDiscount, grandTotal)
  }

  // 3.2 Diskon transaksi original (sebelum pajak)
  let originalTransactionDiscount = 0
  if (discount_type && discount && discount > 0) {
    originalTransactionDiscount = calculateDiscountAmount({
      price: originalGrandTotal,
      discount_type: discount_type,
      discount_amount: discount,
    })
    originalTransactionDiscount = Math.min(
      originalTransactionDiscount,
      originalGrandTotal
    )
  }

  // 3.3 Total diskon dan grand total akhir
  const totalDiscount = transactionDiscount
  const finalGrandTotal = grandTotal - transactionDiscount

  // 3.4 Total diskon dan grand total akhir original
  const originalTotalDiscount = originalTransactionDiscount
  const originalFinalGrandTotal =
    originalGrandTotal - originalTransactionDiscount

  // Hitung total pembayaran dari payments
  const totalPayments = payments.reduce(
    (total, payment) => total + (payment.amount || 0),
    0
  )

  // Hitung balance_amount jika total pembayaran kurang dari total_amount
  const balance_amount =
    totalPayments < finalGrandTotal
      ? parseFloat((finalGrandTotal - totalPayments).toFixed(2))
      : 0

  // Hitung kembalian jika ada
  const return_amount =
    totalPayments > finalGrandTotal
      ? parseFloat((totalPayments - finalGrandTotal).toFixed(2))
      : 0

  // ===== BAGIAN 4: PERHITUNGAN SUBTOTAL =====
  // 4.1 Subtotal dengan pajak (dari net_amount)
  const subtotal = processedItems.reduce(
    (total, item) => total + item.net_amount,
    0
  )

  // 4.2 Subtotal original sebelum pajak (dari original_net_amount)
  const originalSubtotal = processedItems.reduce(
    (total, item) => total + item.original_net_amount,
    0
  )

  // ===== BAGIAN 5: RETURN HASIL AKHIR =====
  return {
    // 5.1 Informasi dasar transaksi
    club_id: 1, // Default atau dari context
    member_id: member?.id || undefined,
    employee_id: employee?.id || undefined,
    discount_type,
    discount,
    is_paid: balance_amount <= 0 ? 1 : 0,
    due_date: new Date().toISOString().split("T")[0], // Default hari ini
    notes,
    billing_address: "",
    shipping_address: "",
    items: processedItems,
    payments,
    refund_from,
    item_include_tax: tax_calculation,

    // 5.2 Nilai dengan pajak
    subtotal: parseFloat(subtotal.toFixed(2)),
    gross_amount: parseFloat(grandTotal.toFixed(2)),
    total_tax: parseFloat(totalTax.toFixed(2)),
    total_discount: parseFloat(totalDiscount.toFixed(2)),
    total_amount: parseFloat(finalGrandTotal.toFixed(2)),
    balance_amount,
    return_amount,

    // 5.3 Nilai original (sebelum pajak)
    original_subtotal: parseFloat(originalSubtotal.toFixed(2)),
    original_gross_amount: parseFloat(originalGrandTotal.toFixed(2)),
    original_total_discount: parseFloat(originalTotalDiscount.toFixed(2)),
    original_total_amount: parseFloat(originalFinalGrandTotal.toFixed(2)),

    // 5.4 Formatted fields untuk nilai dengan pajak
    fsubtotal: currencyFormat(subtotal || 0),
    fgross_amount: currencyFormat(grandTotal || 0),
    ftotal_tax: currencyFormat(totalTax || 0),
    ftotal_discount: currencyFormat(totalDiscount || 0),
    ftotal_amount: currencyFormat(finalGrandTotal || 0),
    fbalance_amount: currencyFormat(balance_amount || 0),
    freturn_amount: currencyFormat(return_amount || 0),

    // 5.5 Formatted fields untuk nilai original
    foriginal_subtotal: currencyFormat(originalSubtotal || 0),
    foriginal_gross_amount: currencyFormat(originalGrandTotal || 0),
    foriginal_total_discount: currencyFormat(originalTotalDiscount || 0),
    foriginal_total_amount: currencyFormat(originalFinalGrandTotal || 0),
  }
}
