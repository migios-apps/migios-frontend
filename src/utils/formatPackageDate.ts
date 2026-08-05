import { dayjs } from "@/utils/dayjs"

export const PENDING_ACTIVATION_LABEL = "Belum aktif"

export const PENDING_ACTIVATION_HINT =
  "Masa berlaku mulai saat check-in pertama"

export const EMPTY_DATE = "—"

export function formatPackageDate(
  value?: string | Date | null,
  format = "DD MMMM YYYY"
) {
  if (!value) {
    return EMPTY_DATE
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed.format(format) : EMPTY_DATE
}

export function isPendingActivation(pkg: {
  start_date?: string | Date | null
  status?: string | null
}) {
  return pkg.status === "active" && !pkg.start_date
}
