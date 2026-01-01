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

// // Contoh penggunaan
// const dates = getStartAndEndOfMonth(1);
// console.log(`Start Date: ${dates.startDate}`);
// console.log(`End Date: ${dates.endDate}`);

// get start and end date of week
export function getStartAndEndOfWeek(): { startDate: string; endDate: string } {
  const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD")
  const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD")
  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
  }
}

// // Contoh penggunaan
// const dates = getStartAndEndOfWeek();
// console.log(`Start Date: ${dates.startDate}`);
// console.log(`End Date: ${dates.endDate}`);

// get start and end date of day
export function getStartAndEndOfDay(): { startDate: string; endDate: string } {
  const startOfDay = dayjs().startOf("day").format("YYYY-MM-DD")
  const endOfDay = dayjs().endOf("day").format("YYYY-MM-DD")
  return {
    startDate: startOfDay,
    endDate: endOfDay,
  }
}

// // Contoh penggunaan
// const dates = getStartAndEndOfDay();
// console.log(`Start Date: ${dates.startDate}`);
// console.log(`End Date: ${dates.endDate}`);

// get start and end date of year
export function getStartAndEndOfYear(): { startDate: string; endDate: string } {
  const startOfYear = dayjs().startOf("year").format("YYYY-MM-DD")
  const endOfYear = dayjs().endOf("year").format("YYYY-MM-DD")
  return {
    startDate: startOfYear,
    endDate: endOfYear,
  }
}

// // Contoh penggunaan
// const dates = getStartAndEndOfYear();
// console.log(`Start Date: ${dates.startDate}`);
// console.log(`End Date: ${dates.endDate}`);
