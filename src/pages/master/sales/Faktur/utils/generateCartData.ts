import { SettingsType } from "@/services/api/@types/settings/settings"
import dayjs from "dayjs"
import parseToDecimal from "@/utils/parseToDecimal"
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
  discounts: ValidationTransactionSchema["discounts"]
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

  // Rounding
  rounding_amount?: number
  frounding_amount?: string
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
 * Round amount to nearest multiple berdasarkan mode
 * Untuk nilai negatif:
 * - "up" berarti lebih negatif (ke arah -infinity)
 * - "down" berarti kurang negatif (ke arah 0)
 */
function roundToNearestMultiple(
  amount: number,
  roundingValue: number,
  mode: "up" | "down"
): number {
  if (roundingValue <= 0) {
    return amount
  }
  if (amount >= 0) {
    // Untuk nilai positif: up = ceil, down = floor
    if (mode === "up") {
      return Math.ceil(amount / roundingValue) * roundingValue
    } else {
      return Math.floor(amount / roundingValue) * roundingValue
    }
  } else {
    // Untuk nilai negatif: up = lebih negatif (floor), down = kurang negatif (ceil)
    if (mode === "up") {
      return Math.floor(amount / roundingValue) * roundingValue
    } else {
      return Math.ceil(amount / roundingValue) * roundingValue
    }
  }
}

/**
 * Generate cart data dari watchTransaction dengan tax calculation sesuai backend logic
 * @param watchTransaction - Data dari transactionSchema.watch()
 * @param settings - Settings data untuk rounding configuration (optional)
 * @returns CartDataGenratedType yang siap untuk API
 */
export function generateCartData(
  watchTransaction: ValidationTransactionSchema,
  settings?: SettingsType | null
): CartDataGenratedType {
  // Validasi input
  if (!watchTransaction) {
    throw new Error("watchTransaction is required")
  }

  const {
    items = [],
    taxes = [],
    tax_calculation = 0,
    discounts = [],
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

  // Semua items (termasuk redeem_item yang sudah ditambahkan) tetap dikirim ke backend
  const allItems = [...items]

  // Process setiap item dengan logic yang sama seperti backend
  const processedItems = allItems
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
      // Izinkan qty negatif untuk refund/edit mode
      const quantity = item.quantity || 0
      const original_gross_amount = original_price * quantity

      // Hitung original discount amount (diskon dari harga asli sebelum pajak)
      const discountType = item.discount_type || "nominal"
      const discountValue = item.discount || 0
      const original_discount_amount = calculateDiscountAmount({
        price: Math.abs(original_gross_amount),
        discount_type: discountType,
        discount_amount: discountValue,
      })
      // Jika qty negatif, discount juga harus negatif
      const final_original_discount =
        quantity < 0
          ? -Math.min(original_discount_amount, Math.abs(original_gross_amount))
          : Math.min(original_discount_amount, original_gross_amount)

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
      // Untuk qty negatif, diskon tetap mengurangi (diskon positif mengurangi gross negatif)
      const discount_amount = calculateDiscountAmount({
        price: Math.abs(gross_amount),
        discount_type: discountType,
        discount_amount: discountValue,
      })
      // Jika qty negatif, diskon juga harus negatif untuk mengurangi gross_amount negatif
      const final_discount =
        quantity < 0
          ? -Math.min(discount_amount, Math.abs(gross_amount))
          : Math.min(discount_amount, gross_amount)

      // Net amount setelah diskon
      const net_amount = gross_amount - final_discount

      // Reset total_tax_amount untuk perhitungan ulang
      total_tax_amount = 0

      const taxesWithAmount: TaxItem[] = itemTaxes.map((tax) => {
        let tax_amount = 0
        const taxRate = tax.rate || 0

        // Perhitungan pajak berdasarkan pengaturan pajak
        // Jika qty negatif, pajak juga akan negatif karena net_amount sudah negatif
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
        loyalty_reward_id: item.loyalty_reward_id || null,
        loyalty_point: item.loyalty_point || null,
        source_from: item.source_from || "item",
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

  // ===== BAGIAN 1: PERHITUNGAN SUBTOTAL (DPP AWAL) =====
  // 1.1 Subtotal dengan pajak (dari net_amount setelah diskon item)
  const subtotal = parseFloat(
    processedItems
      .reduce((total, item) => total + item.net_amount, 0)
      .toFixed(2)
  )

  // 1.2 Subtotal original sebelum pajak (dari original_net_amount setelah diskon item)
  const originalSubtotal = parseFloat(
    processedItems
      .reduce((total, item) => total + item.original_net_amount, 0)
      .toFixed(2)
  )

  // ===== BAGIAN 2: PERHITUNGAN PAJAK (PPN) =====
  // Total tax adalah sum dari total_tax_amount di setiap item
  // Pajak sudah dihitung di level item sesuai setting item masing-masing
  const totalTax = parseFloat(
    processedItems
      .reduce((total, item) => total + item.total_tax_amount, 0)
      .toFixed(2)
  )

  // ===== BAGIAN 3: PERHITUNGAN DISKON TRANSAKSI (MULTI DISCOUNT) =====
  // 3.1 Gabungkan semua discount (dari form + dari loyalty redeem)
  const allDiscounts: Array<{
    discount_type: "percent" | "nominal"
    discount_amount: number
    loyalty_reward_id?: number
  }> = []

  // Tambahkan discount dari form (sudah termasuk discount dari loyalty redeem yang di-append saat redeem)
  if (discounts && Array.isArray(discounts)) {
    discounts.forEach((discount) => {
      if (
        discount.discount_type &&
        discount.discount_amount &&
        discount.discount_amount > 0
      ) {
        const discountItem: {
          discount_type: "percent" | "nominal"
          discount_amount: number
          loyalty_reward_id?: number
        } = {
          discount_type: discount.discount_type as "percent" | "nominal",
          discount_amount: discount.discount_amount,
        }
        if (discount.loyalty_reward_id) {
          discountItem.loyalty_reward_id = discount.loyalty_reward_id
        }
        allDiscounts.push(discountItem)
      }
    })
  }

  // 3.2 Hitung diskon transaksi dengan pajak (diterapkan berurutan ke subtotal)
  // LOGIKA: Diskon diterapkan berurutan, setiap diskon dihitung dari nilai setelah diskon sebelumnya
  // Contoh: Subtotal 975.000, Diskon 10% lalu 35%
  //   DPP1 = 975.000 - (10% × 975.000) = 877.500
  //   DPP2 = 877.500 - (35% × 877.500) = 570.375
  // Untuk refund (subtotal negatif), diskon tetap mengurangi (menambah nilai negatif)
  let transactionDiscount = 0
  let currentAmount = subtotal
  allDiscounts.forEach((discount) => {
    const discountAmount = calculateDiscountAmount({
      price: Math.abs(currentAmount),
      discount_type: discount.discount_type,
      discount_amount: discount.discount_amount,
    })
    // Pastikan diskon tidak melebihi sisa amount
    // Untuk nilai negatif, diskon juga harus negatif
    const finalDiscount =
      currentAmount < 0
        ? -Math.min(discountAmount, Math.abs(currentAmount))
        : Math.min(discountAmount, Math.abs(currentAmount))
    transactionDiscount += finalDiscount
    currentAmount -= finalDiscount // Update currentAmount untuk diskon berikutnya
  })

  // 3.3 Hitung total diskon transaksi original (sebelum pajak)
  // Untuk refund (originalSubtotal negatif), diskon tetap mengurangi (menambah nilai negatif)
  let originalTransactionDiscount = 0
  let originalCurrentAmount = originalSubtotal
  allDiscounts.forEach((discount) => {
    const discountAmount = calculateDiscountAmount({
      price: Math.abs(originalCurrentAmount),
      discount_type: discount.discount_type,
      discount_amount: discount.discount_amount,
    })
    // Pastikan diskon tidak melebihi sisa amount
    // Untuk nilai negatif, diskon juga harus negatif
    const finalDiscount =
      originalCurrentAmount < 0
        ? -Math.min(discountAmount, Math.abs(originalCurrentAmount))
        : Math.min(discountAmount, Math.abs(originalCurrentAmount))
    originalTransactionDiscount += finalDiscount
    originalCurrentAmount -= finalDiscount // Update originalCurrentAmount untuk diskon berikutnya
  })

  // ===== BAGIAN 4: PERHITUNGAN DPP AKHIR =====
  // 4.1 DPP akhir dengan pajak (Subtotal setelah semua diskon transaksi)
  const dppAkhir = parseFloat((subtotal - transactionDiscount).toFixed(2))

  // 4.2 DPP akhir original (sebelum pajak)
  const originalDppAkhir = parseFloat(
    (originalSubtotal - originalTransactionDiscount).toFixed(2)
  )

  // ===== BAGIAN 5: PERHITUNGAN PAJAK SETELAH DISKON TRANSAKSI =====
  // 5.1 Pajak harus proporsional dengan DPP akhir setelah diskon transaksi
  // Jika subtotal dikurangi diskon, pajak juga harus dikurangi proporsional
  // Formula: totalTax = totalTax * (dppAkhir / subtotal)
  // Berlaku untuk normal transaction (subtotal > 0) dan refund (subtotal < 0)
  let adjustedTotalTax = totalTax
  if (subtotal !== 0) {
    // Hitung proporsi DPP akhir terhadap subtotal
    // Untuk refund (subtotal negatif), proporsi tetap sama dan pajak juga akan negatif
    const taxRatio = dppAkhir / subtotal
    adjustedTotalTax = parseFloat((totalTax * taxRatio).toFixed(2))
  }

  // ===== BAGIAN 6: PERHITUNGAN TOTAL BAYAR =====
  // 6.1 Total bayar = DPP akhir + PPN (pajak yang sudah disesuaikan dengan diskon transaksi)
  let totalAmount = parseFloat((dppAkhir + adjustedTotalTax).toFixed(2))
  let rounding_amount = 0

  // ===== BAGIAN 6.2: PEMBULATAN TOTAL AMOUNT (jika diaktifkan) =====
  // Pembulatan hanya diterapkan pada total_amount jika sales_is_rounding = 1
  // rounding_amount menyimpan selisih pembulatan dengan tanda yang benar
  // Negative jika rounding down (pengurangan), positive jika rounding up (tambahan)
  if (settings?.sales_is_rounding === 1 && settings?.sales_rounding_value) {
    const roundingValue = Number(settings.sales_rounding_value) || 0
    const roundingMode = settings.sales_rounding_mode || "up"

    if (roundingValue > 0) {
      const originalTotalAmount = totalAmount
      totalAmount = roundToNearestMultiple(
        totalAmount,
        roundingValue,
        roundingMode as "up" | "down"
      )
      // rounding_amount menyimpan selisih dengan tanda yang benar (bukan absolute)
      const roundingDifference = totalAmount - originalTotalAmount
      rounding_amount = parseFloat(roundingDifference.toFixed(2))
    }
  }

  // 6.3 Total bayar original (sebelum pajak)
  const originalTotalAmount = parseFloat(originalDppAkhir.toFixed(2))

  // 6.4 Total discount (untuk display)
  const totalDiscount = transactionDiscount
  const originalTotalDiscount = originalTransactionDiscount

  // ===== BAGIAN 6: PERHITUNGAN PEMBAYARAN =====
  // Hitung total pembayaran dari payments
  const totalPayments = payments.reduce(
    (total, payment) => total + parseToDecimal(payment.amount),
    0
  )

  // Deteksi apakah ini refund mode (total_amount negatif)
  const isRefundMode = totalAmount < 0

  // Hitung balance_amount
  let balance_amount = 0
  if (isRefundMode) {
    // Untuk refund mode: balance_amount = total_amount - totalPayments
    // total_amount negatif, totalPayments juga negatif, hasil tetap negatif
    balance_amount = parseFloat((totalAmount - totalPayments).toFixed(2))
  } else {
    // Untuk normal mode: balance_amount jika total pembayaran kurang dari total_amount
    balance_amount =
      totalPayments < totalAmount
        ? parseFloat((totalAmount - totalPayments).toFixed(2))
        : 0
  }

  // Hitung kembalian jika ada (hanya untuk normal mode)
  const return_amount =
    !isRefundMode && totalPayments > totalAmount
      ? parseFloat((totalPayments - totalAmount).toFixed(2))
      : 0

  // Gross amount untuk display (total sebelum diskon transaksi)
  const gross_amount = parseFloat(
    processedItems
      .reduce((total, item) => total + item.total_amount, 0)
      .toFixed(2)
  )
  const original_gross_amount = parseFloat(
    processedItems
      .reduce((total, item) => total + item.original_total_amount, 0)
      .toFixed(2)
  )

  // ===== BAGIAN 7: RETURN HASIL AKHIR =====
  return {
    // 7.1 Informasi dasar transaksi
    club_id: 1, // Default atau dari context
    member_id: member?.id || undefined,
    employee_id: employee?.id || undefined,
    discounts: discounts || [],
    is_paid: balance_amount <= 0 ? 1 : 0,
    due_date: dayjs(watchTransaction.due_date).format("YYYY-MM-DD"), // Default hari ini
    notes,
    billing_address: "",
    shipping_address: "",
    items: processedItems,
    payments,
    refund_from,
    item_include_tax: tax_calculation,

    // 7.2 Nilai dengan pajak
    subtotal: subtotal,
    gross_amount: gross_amount,
    total_tax: adjustedTotalTax,
    total_discount: totalDiscount,
    total_amount: totalAmount,
    balance_amount,
    return_amount,

    // 7.3 Nilai original (sebelum pajak)
    original_subtotal: originalSubtotal,
    original_gross_amount: original_gross_amount,
    original_total_discount: originalTotalDiscount,
    original_total_amount: originalTotalAmount,

    // 7.4 Formatted fields untuk nilai dengan pajak
    fsubtotal: currencyFormat(subtotal || 0),
    fgross_amount: currencyFormat(gross_amount || 0),
    ftotal_tax: currencyFormat(adjustedTotalTax || 0),
    ftotal_discount: currencyFormat(totalDiscount || 0),
    ftotal_amount: currencyFormat(totalAmount || 0),
    fbalance_amount: currencyFormat(balance_amount || 0),
    freturn_amount: currencyFormat(return_amount || 0),

    // 7.5 Formatted fields untuk nilai original
    foriginal_subtotal: currencyFormat(originalSubtotal || 0),
    foriginal_gross_amount: currencyFormat(original_gross_amount || 0),
    foriginal_total_discount: currencyFormat(originalTotalDiscount || 0),
    foriginal_total_amount: currencyFormat(originalTotalAmount || 0),

    // 7.6 Rounding
    rounding_amount: rounding_amount !== 0 ? rounding_amount : undefined,
    frounding_amount:
      rounding_amount !== 0 ? currencyFormat(rounding_amount || 0) : undefined,
  }
}

// const discount = [
//   {
//     discount_type: "percent",
//     discount_amount: 10,
//   },
//   {
//     discount_type: "nominal",
//     discount_amount: 10000,
//   },
//   {
//     discount_type: "percent",
//     discount_amount: 15,
//   },
//   {
//     discount_type: "nominal",
//     discount_amount: 15000,
//   },
// ]
