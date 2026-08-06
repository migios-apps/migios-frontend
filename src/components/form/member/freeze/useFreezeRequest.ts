import { useMemo } from "react"
import { dayjs } from "@/utils/dayjs"
import { useFreezeQuota } from "./FreezeQuotaInfo"

export const rupiah = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`

type Args = {
  memberCode?: string
  startDate?: string | Date | null
  endDate?: string | Date | null
}

export function useFreezeRequest({ memberCode, startDate, endDate }: Args) {
  const startKey = startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined
  const { quota, isLoadingQuota } = useFreezeQuota(memberCode, startKey)

  const requestedDays = useMemo(() => {
    if (!startDate || !endDate) return undefined
    return dayjs(endDate).diff(dayjs(startDate), "day") + 1
  }, [startDate, endDate])

  const earliestStartDate = useMemo(
    () =>
      quota?.earliest_start_date
        ? dayjs(quota.earliest_start_date).toDate()
        : undefined,
    [quota?.earliest_start_date]
  )

  const latestEndDate = useMemo(() => {
    if (!startKey || quota?.remaining_days == null) return undefined
    if (quota.remaining_days < 1) return dayjs(startKey).toDate()
    return dayjs(startKey)
      .add(quota.remaining_days - 1, "day")
      .toDate()
  }, [startKey, quota?.remaining_days])

  const packageEndDate = useMemo(
    () =>
      quota?.package_end_date
        ? dayjs(quota.package_end_date).toDate()
        : undefined,
    [quota?.package_end_date]
  )

  const capByPackage = Boolean(
    quota && !quota.extend_end_date && packageEndDate
  )

  const durationError = useMemo(() => {
    if (!quota || !quota.enabled) return null

    if (startDate && quota.earliest_start_date) {
      const start = dayjs(startDate).format("YYYY-MM-DD")
      if (start < quota.earliest_start_date) {
        return quota.min_advance_days > 0
          ? `Pengajuan harus H-${quota.min_advance_days}. Tanggal mulai paling cepat ${quota.earliest_start_date}.`
          : `Tanggal mulai tidak boleh sebelum ${quota.earliest_start_date}.`
      }
    }

    if (typeof requestedDays === "number" && requestedDays < 1) {
      return "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."
    }

    return null
  }, [quota, requestedDays, startDate])

  const freezeFee = useMemo(() => {
    if (!quota || quota.fee_type === "none" || quota.fee_amount <= 0) return 0
    if (quota.fee_type === "per_day") {
      return typeof requestedDays === "number" && requestedDays > 0
        ? quota.fee_amount * requestedDays
        : 0
    }
    return quota.fee_amount
  }, [quota, requestedDays])

  const periodHint = useMemo(() => {
    if (!quota) return undefined
    const bagian: string[] = []
    if (quota.min_advance_days > 0) {
      bagian.push(
        `paling cepat ${quota.earliest_start_date} (H-${quota.min_advance_days})`
      )
    }
    if (quota.remaining_days != null) {
      bagian.push(`sisa jatah ${quota.remaining_days} hari`)
    }
    if (quota.package_end_date) {
      bagian.push(
        capByPackage
          ? `paket berakhir ${quota.package_end_date} dan tidak diperpanjang`
          : `paket berakhir ${quota.package_end_date}`
      )
    }
    const cara =
      "Pilih tanggal mulai dulu, kalender lalu membatasi tanggal selesai sesuai sisa jatah. Klik tanggal yang sama dua kali untuk freeze satu hari."
    if (!bagian.length) return cara
    const kalimat = bagian.join(", ")
    return `${kalimat.charAt(0).toUpperCase()}${kalimat.slice(1)}. ${cara}`
  }, [quota, capByPackage])

  const feeExplanation = useMemo(() => {
    if (!quota || quota.fee_type === "none" || quota.fee_amount <= 0) {
      return "Freeze gratis di klub ini. Transaksinya tetap dicatat supaya ada jejaknya."
    }
    if (quota.fee_type === "per_day") {
      return typeof requestedDays === "number" && requestedDays > 0
        ? `${rupiah(quota.fee_amount)} × ${requestedDays} hari. Dihitung server, tidak bisa diubah di sini.`
        : "Pilih tanggal mulai dan selesai untuk menghitung biayanya."
    }
    return "Biaya tetap dari pengaturan klub. Dihitung server, tidak bisa diubah di sini."
  }, [quota, requestedDays])

  const blockSubmit =
    Boolean(durationError) ||
    quota?.enabled === false ||
    (quota?.remaining_requests !== null &&
      quota?.remaining_requests !== undefined &&
      quota.remaining_requests < 1) ||
    (quota?.remaining_days !== null &&
      quota?.remaining_days !== undefined &&
      typeof requestedDays === "number" &&
      requestedDays > quota.remaining_days)

  return {
    quota,
    isLoadingQuota,
    requestedDays,
    earliestStartDate,
    latestEndDate,
    periodHint,
    packageEndDate,
    capByPackage,
    startKey,
    durationError,
    freezeFee,
    feeExplanation,
    blockSubmit,
  }
}
