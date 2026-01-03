import { dayjs } from "@/utils/dayjs"

// get start and end date of month
export function getStartAndEndOfMonth(number: number = 1): {
  startDate: string
  endDate: string
} {
  // Mendapatkan tanggal pertama bulan ini
  const startDate = dayjs().startOf("month").format("YYYY-MM-DD")

  // Mendapatkan tanggal pertama bulan setelah rentang yang diinginkan
  const endDate = dayjs()
    .add(number, "month")
    .startOf("month")
    .format("YYYY-MM-DD")

  // Mengembalikan objek dengan startDate dan endDate
  return {
    startDate,
    endDate,
  }
}
