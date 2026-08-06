import {
  TransferCandidate,
  TransferRejection,
} from "@/services/api/@types/transfer"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

export const REJECTION_MESSAGE: Record<TransferRejection, string> = {
  TRANSFER_DISABLED: "Transfer paket sedang dimatikan untuk cabang ini",
  PACKAGE_NOT_TRANSFERABLE:
    "Hanya paket aktif atau belum aktif yang bisa dipindahkan",
  PACKAGE_TYPE_NOT_ALLOWED: "Jenis paket ini tidak diizinkan ditransfer",
  PACKAGE_FROZEN: "Keanggotaan sedang dalam masa freeze",
  PENDING_SESSION_APPROVAL: "Ada sesi menunggu persetujuan — selesaikan dulu",
  TRANSACTION_UNPAID: "Transaksi pembelian belum lunas",
  REMAINING_TOO_SHORT: "Sisa masa berlaku tidak mencukupi",
  TRANSFER_LIMIT_REACHED: "Paket ini sudah pernah ditransfer",
  NOT_OWNED: "Paket bukan milik member ini",
}

const PACKAGE_TYPE_LABEL: Record<string, string> = {
  membership: "Membership",
  pt_program: "PT Program",
  class: "Kelas",
}

type PackagePickerProps = {
  packages: TransferCandidate[]
  selected: number[]
  onChange: (ids: number[]) => void
  isLoading: boolean
  feeAmount: number
}

const ACTIONABLE_REASONS: TransferRejection[] = [
  "PACKAGE_FROZEN",
  "PENDING_SESSION_APPROVAL",
  "TRANSACTION_UNPAID",
]

const PackagePicker = ({
  packages,
  selected,
  onChange,
  isLoading,
  feeAmount,
}: PackagePickerProps) => {
  const eligible = packages.filter((item) => item.eligible)
  const blocked = packages.filter(
    (item) =>
      !item.eligible && item.reason && ACTIONABLE_REASONS.includes(item.reason)
  )
  const visible = [...eligible, ...blocked]
  const allEligibleSelected =
    eligible.length > 0 &&
    eligible.every((item) => selected.includes(item.member_package_id))

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (!visible.length) {
    return (
      <div className="space-y-1 rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm font-medium">
          Tidak ada paket yang bisa dipindahkan
        </p>
        <p className="text-muted-foreground text-xs">
          {packages.length === 0
            ? "Member ini belum punya paket apa pun."
            : `Dari ${packages.length} paket miliknya, tidak ada yang memenuhi syarat transfer — masa berlakunya sudah habis, jenisnya tidak diizinkan, atau sudah pernah ditransfer.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          {eligible.length} paket bisa dipindahkan
          {packages.length > visible.length
            ? ` · ${packages.length - visible.length} disembunyikan`
            : ""}
        </p>
        {eligible.length > 1 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange(
                allEligibleSelected
                  ? []
                  : eligible.map((item) => item.member_package_id)
              )
            }
          >
            {allEligibleSelected
              ? "Batalkan Semua"
              : "Pilih Semua yang Bisa Ditransfer"}
          </Button>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <p className="bg-primary/5 border-primary/20 rounded-lg border px-3 py-2 text-sm">
          <span className="font-medium">{selected.length} paket dipilih</span>
          {feeAmount > 0 ? (
            <span className="text-muted-foreground">
              {" · "}biaya Rp {feeAmount.toLocaleString("id-ID")}
            </span>
          ) : (
            <span className="text-muted-foreground">{" · "}tanpa biaya</span>
          )}
        </p>
      ) : null}

      <div className="space-y-2">
        {visible.map((item) => {
          const checked = selected.includes(item.member_package_id)
          const disabled = !item.eligible
          return (
            <label
              key={item.member_package_id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                disabled
                  ? "bg-muted/40 cursor-not-allowed opacity-70"
                  : "hover:bg-accent/40 cursor-pointer",
                checked && !disabled && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) =>
                  onChange(
                    value
                      ? [...selected, item.member_package_id]
                      : selected.filter((id) => id !== item.member_package_id)
                  )
                }
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">
                    {item.package_name}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {PACKAGE_TYPE_LABEL[item.package_type] ?? item.package_type}
                  </Badge>
                  {item.status === "pending" ? (
                    <Badge variant="secondary" className="text-[10px]">
                      Belum aktif
                    </Badge>
                  ) : null}
                </div>

                {item.eligible ? (
                  <p className="text-muted-foreground text-xs">
                    {item.status === "pending"
                      ? "Masa berlaku mulai saat penerima check-in pertama"
                      : `Sisa ${item.remaining_days} hari`}
                    {item.remaining_sessions > 0
                      ? ` · ${item.remaining_sessions} sesi tersisa`
                      : ""}
                  </p>
                ) : (
                  <p className="text-destructive text-xs">
                    {item.reason
                      ? REJECTION_MESSAGE[item.reason]
                      : "Tidak bisa ditransfer"}
                    {item.reason === "PENDING_SESSION_APPROVAL" &&
                    item.pending_sessions > 0
                      ? ` (${item.pending_sessions} sesi)`
                      : ""}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default PackagePicker
