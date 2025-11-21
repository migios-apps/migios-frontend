import { useEffect, useState } from "react"
import { dayjs } from "@/utils/dayjs"

/**
 * Hook untuk menghitung selisih antara dua tanggal dalam format (tahun, bulan, minggu, atau hari).
 * @param {string | Date} startDate - Tanggal awal (bisa dalam format string atau Date object).
 * @param {string | Date} endDate - Tanggal akhir (bisa dalam format string atau Date object).
 * @returns {string} - Selisih dalam format terbesar (misalnya: "1 tahun +", "8 bulan +", "3 minggu +", "12 hari +").
 */
const useDateDifference = (
  startDate: string | Date,
  endDate: string | Date
) => {
  const [difference, setDifference] = useState("")

  useEffect(() => {
    if (!startDate || !endDate) return

    const start = dayjs(startDate)
    const end = dayjs(endDate)

    // Hitung selisih tahun
    const yearsDiff = end.diff(start, "year")
    const adjustedDate = start.add(yearsDiff, "year")

    // Hitung selisih bulan setelah mengurangi tahun
    const monthsDiff = end.diff(adjustedDate, "month")
    const adjustedDate2 = adjustedDate.add(monthsDiff, "month")

    // Hitung selisih minggu setelah mengurangi bulan
    const weeksDiff = end.diff(adjustedDate2, "week")
    const adjustedDate3 = adjustedDate2.add(weeksDiff, "week")

    // Hitung selisih hari setelah mengurangi minggu
    const daysDiff = end.diff(adjustedDate3, "day")

    // Tentukan output yang paling signifikan
    let result = ""
    if (yearsDiff > 0) {
      result = `${yearsDiff} Tahun+`
    } else if (monthsDiff > 0) {
      result = `${monthsDiff} Bulan+`
    } else if (weeksDiff > 0) {
      result = `${weeksDiff} Minggu+`
    } else {
      result = `${daysDiff} Hari+`
    }

    setDifference(result)
  }, [startDate, endDate])

  return difference
}

export default useDateDifference
