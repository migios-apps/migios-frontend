// Helper function untuk parse string dengan koma sebagai separator desimal
// Support format: "Rp. 1.000.000,55", "1000000,55", "1.000.000,55", dll
const parseToDecimal = (value: number | string): number => {
  if (typeof value === "number") return value
  if (!value) return 0
  // Hapus semua non-digit kecuali koma/titik, normalisasi separator, lalu parse
  const num = parseFloat(
    String(value)
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".")
  )
  return isNaN(num) ? 0 : num
}

export default parseToDecimal
