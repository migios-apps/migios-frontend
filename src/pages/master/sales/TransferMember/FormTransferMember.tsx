import { MemberDetail } from "@/services/api/@types/member"
import {
  TransferCandidate,
  TransferPolicy,
  TransferPreview,
} from "@/services/api/@types/transfer"
import { ArrowRight2, Profile2User } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import MemberSearchPicker from "./MemberSearchPicker"
import PackagePicker from "./PackagePicker"
import StepSection from "./StepSection"
import TransferSummary from "./TransferSummary"

type Rekening = { id: number; name: string }

type FormTransferMemberProps = {
  open: boolean
  onClose: () => void
  from: MemberDetail | null
  to: MemberDetail | null
  selected: number[]
  reason: string
  notes: string
  rekeningId: number | null
  packages: TransferCandidate[]
  rekeningList: Rekening[]
  preview: TransferPreview | undefined
  policy: TransferPolicy | undefined
  runningFee: number
  allEligibleSelected: boolean
  isFetchingPackages: boolean
  isFetchingPreview: boolean
  isPending: boolean
  onChangeFrom: (member: MemberDetail | null) => void
  onChangeTo: (member: MemberDetail | null) => void
  onChangeSelected: (ids: number[]) => void
  onChangeReason: (value: string) => void
  onChangeNotes: (value: string) => void
  onChangeRekening: (id: number) => void
  onOpenRegister: () => void
  onSubmit: () => void
}

const FormTransferMember = ({
  open,
  onClose,
  from,
  to,
  selected,
  reason,
  notes,
  rekeningId,
  packages,
  rekeningList,
  preview,
  runningFee,
  allEligibleSelected,
  isFetchingPackages,
  isFetchingPreview,
  isPending,
  onChangeFrom,
  onChangeTo,
  onChangeSelected,
  onChangeReason,
  onChangeNotes,
  onChangeRekening,
  onOpenRegister,
  onSubmit,
}: FormTransferMemberProps) => {
  const hint = !from
    ? "Mulai dengan mencari member pemberi."
    : selected.length === 0
      ? "Centang minimal satu paket."
      : !to
        ? "Pilih member penerima."
        : reason.trim().length === 0
          ? "Isi alasan transfer."
          : (preview?.fee_amount ?? 0) > 0 && !rekeningId
            ? "Pilih rekening penerimaan biaya."
            : "Siap diproses."

  const blocked =
    isPending ||
    isFetchingPreview ||
    !preview ||
    !from ||
    !to ||
    selected.length === 0 ||
    reason.trim().length === 0 ||
    ((preview?.fee_amount ?? 0) > 0 && !rekeningId)

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent floating className="gap-0 sm:max-w-2xl">
        <div className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Transfer Kepemilikan Paket</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden px-2 pr-1">
            <ScrollArea className="h-full px-2 pr-3">
              <div className="space-y-4 px-1 pb-4">
                <StepSection
                  step={1}
                  title="Member Pemberi & Paket"
                  hint="Cari member yang menyerahkan paketnya, lalu centang paket mana yang dipindahkan."
                  state={selected.length > 0 ? "done" : "active"}
                >
                  <MemberSearchPicker
                    inputName="from_member"
                    label=""
                    value={from}
                    onChange={(member) => {
                      onChangeFrom(member)
                      onChangeSelected([])
                    }}
                    excludeMemberId={to?.id}
                  />
                  {from ? (
                    <PackagePicker
                      packages={packages}
                      selected={selected}
                      onChange={onChangeSelected}
                      isLoading={isFetchingPackages}
                      feeAmount={runningFee}
                    />
                  ) : null}
                </StepSection>

                <StepSection
                  step={2}
                  title="Member Penerima"
                  hint="Cari member tujuan, atau daftarkan member baru langsung dari sini."
                  state={
                    selected.length === 0 ? "locked" : to ? "done" : "active"
                  }
                  lockedMessage="Pilih paket dulu di langkah 1."
                >
                  <MemberSearchPicker
                    inputName="to_member"
                    label=""
                    value={to}
                    onChange={onChangeTo}
                    excludeMemberId={from?.id}
                    emptyAction={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onOpenRegister}
                      >
                        <Profile2User size={16} variant="Bulk" />
                        Daftarkan Member Baru
                      </Button>
                    }
                  />
                </StepSection>

                <StepSection
                  step={3}
                  title="Ringkasan & Konfirmasi"
                  hint="Periksa angkanya sebelum memproses — transfer hanya bisa dibatalkan selama penerima belum memakai paketnya."
                  state={
                    from && to && selected.length > 0 ? "active" : "locked"
                  }
                  lockedMessage="Lengkapi langkah 1 dan 2 dulu."
                >
                  {from && to && selected.length > 0 ? (
                    <div className="space-y-4">
                      <TransferSummary
                        preview={preview}
                        isLoading={isFetchingPreview}
                        from={from}
                        to={to}
                      />

                      {allEligibleSelected ? (
                        <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-xs">
                          Seluruh paket {from.name} yang bisa dipindahkan sudah
                          dipilih. Setelah transfer, keanggotaannya menjadi{" "}
                          <span className="text-foreground font-medium">
                            tidak aktif
                          </span>{" "}
                          — tapi datanya tetap ada: riwayat kehadiran,
                          pengukuran, dan poin loyalti tidak berpindah, dan dia
                          bisa membeli paket baru kapan saja.
                        </p>
                      ) : null}

                      {(preview?.fee_amount ?? 0) > 0 ? (
                        <div className="space-y-2">
                          <Label>
                            Rekening Penerimaan Biaya{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {(rekeningList ?? []).map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => onChangeRekening(item.id)}
                                className={cn(
                                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                                  rekeningId === item.id
                                    ? "border-primary bg-primary/5 font-medium"
                                    : "hover:bg-accent/40"
                                )}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            Transfer wajib lunas — tidak bisa dibayar sebagian.
                          </p>
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="transfer-reason">
                            Alasan <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="transfer-reason"
                            name="reason"
                            placeholder="Contoh: pemberi sakit dan tidak bisa melanjutkan"
                            value={reason}
                            onChange={(event) =>
                              onChangeReason(event.target.value)
                            }
                            maxLength={255}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transfer-notes">
                            Catatan untuk trainer (opsional)
                          </Label>
                          <Input
                            id="transfer-notes"
                            name="notes"
                            placeholder="Contoh: penerima pemula, ada cedera lutut"
                            value={notes}
                            onChange={(event) =>
                              onChangeNotes(event.target.value)
                            }
                            maxLength={255}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </StepSection>
              </div>
            </ScrollArea>
          </div>

          <SheetFooter>
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-xs">{hint}</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="button" disabled={blocked} onClick={onSubmit}>
                  {isPending ? "Memproses..." : "Proses Transfer"}
                  <ArrowRight2 size={16} variant="Bulk" />
                </Button>
              </div>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default FormTransferMember
