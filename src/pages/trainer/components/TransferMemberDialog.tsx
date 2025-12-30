import { useState, useEffect } from "react"
import { TrainerDetail, TrainerMember } from "@/services/api/@types/trainer"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  UserPlus,
  MoveRight,
  MoveLeft,
  ArrowRight,
  XIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"

interface TransferMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TrainerMember
  trainer: TrainerDetail | null
  onSuccess?: () => void
}

const TransferMemberDialog = ({
  open,
  onOpenChange,
  member,
  trainer,
  onSuccess,
}: TransferMemberDialogProps) => {
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([])

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPackageIds([])
    }
  }, [open])

  const handleTransfer = () => {
    console.log("Transferring packages", {
      memberId: member.id,
      packageIds: selectedPackageIds,
      fromTrainerId: trainer?.id,
    })
    onSuccess?.()
    onOpenChange(false)
  }

  const togglePackage = (pkgId: number) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId)
        ? prev.filter((id) => id !== pkgId)
        : [...prev, pkgId]
    )
  }

  const moveAll = () => {
    if (selectedPackageIds.length === member.packages.length) {
      setSelectedPackageIds([])
    } else {
      setSelectedPackageIds(member.packages.map((pkg) => pkg.id))
    }
  }

  const availablePackages = member.packages.filter(
    (pkg) => !selectedPackageIds.includes(pkg.id)
  )
  const transferPackages = member.packages.filter((pkg) =>
    selectedPackageIds.includes(pkg.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        scrollBody={false}
        showCloseButton={false}
        className="fixed! inset-0! top-0! left-0! z-50! h-screen! w-screen! max-w-none! translate-x-0! translate-y-0! gap-0! rounded-none! border-0! p-0!"
      >
        <DialogHeader className="hidden">
          <DialogTitle>Ganti Trainer</DialogTitle>
          <DialogDescription>
            Pindahkan tanggung jawab bimbingan paket member ke trainer baru.
          </DialogDescription>
        </DialogHeader>

        <div className="relative z-10 flex h-full flex-col">
          {/* Header Actions */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 border-none p-0"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </Button>

          {/* Main Scrollable Content */}
          <div className="mx-auto w-full max-w-6xl p-6">
            {/* Title Section */}
            <div className="mb-10 flex flex-col items-center text-center">
              <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Ganti Trainer Member
              </h2>
              <p className="text-muted-foreground max-w-lg text-base">
                Pindahkan tanggung jawab bimbingan paket member secara aman dan
                tercatat otomatis dalam sistem.
              </p>
            </div>

            <div className="space-y-4">
              {/* Animated Transfer Illustration */}
              <div className="bg-muted/30 relative flex items-center justify-between rounded-2xl border border-dashed p-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 bg-white shadow-md">
                      <AvatarImage src={trainer?.photo || ""} />
                      <AvatarFallback className="text-muted-foreground text-xs font-bold">
                        {trainer?.name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow-sm">
                      -
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold">
                      {trainer?.name || "Trainer"}
                    </p>
                    <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      Sumber
                    </span>
                  </div>
                </div>

                <div className="relative flex flex-1 items-center justify-center px-6">
                  <div className="border-muted-foreground/20 w-full border-t-2 border-dashed" />

                  {/* Illustration Arrow Center */}
                  <div className="bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border p-1 shadow-xs">
                    <ArrowRight className="text-primary/40 h-3.5 w-3.5" />
                  </div>

                  <motion.div
                    className="absolute"
                    initial={{ x: -45 }}
                    animate={{ x: 45 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Avatar className="h-10 w-10 border-2 bg-white shadow-xl">
                      <AvatarImage src={member.photo || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="border-primary/20 bg-primary/5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed shadow-sm">
                      <UserPlus className="text-primary/40 h-7 w-7" />
                    </div>
                    <div className="bg-primary absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white shadow-sm">
                      +
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-primary text-xs font-bold tracking-wider uppercase">
                      Target
                    </p>
                    <span className="text-muted-foreground text-[10px]">
                      Penerima
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual Column Transfer UI */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-base font-bold tracking-tight">
                    Daftar Paket Member
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-bold"
                    onClick={moveAll}
                  >
                    {selectedPackageIds.length === member.packages.length
                      ? "Batal Semua"
                      : "Pilih Semua"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left Column: Available */}
                  <div className="flex flex-col">
                    <div className="bg-muted/50 flex items-center justify-between rounded-t-xl border-x border-t px-4 py-3">
                      <span className="text-xs font-bold tracking-widest uppercase">
                        Paket Tersedia ({availablePackages.length})
                      </span>
                    </div>
                    <ScrollArea className="h-72 rounded-b-xl border bg-white shadow-sm">
                      <div className="space-y-1.5 p-2">
                        {availablePackages.length > 0 ? (
                          availablePackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="hover:border-border group hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-3 transition-all"
                              onClick={() => togglePackage(pkg.id)}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {pkg.package_name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  Sisa {pkg.total_available_session} Sesi
                                </p>
                              </div>
                              <div className="group-hover:bg-primary/10 rounded-md p-1.5 transition-colors">
                                <MoveRight className="text-muted-foreground/30 group-hover:text-primary h-4 w-4" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                            <p className="text-sm font-medium">Kosong</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Right Column: To Transfer */}
                  <div className="flex flex-col">
                    <div className="border-primary/10 bg-primary/5 flex items-center justify-between rounded-t-xl border-x border-t px-4 py-3">
                      <span className="text-primary text-xs font-bold tracking-widest uppercase">
                        Siap Dipindah ({transferPackages.length})
                      </span>
                    </div>
                    <ScrollArea className="border-primary/20 bg-primary/5 h-72 rounded-b-xl border shadow-sm">
                      <div className="space-y-1.5 p-2">
                        {transferPackages.length > 0 ? (
                          transferPackages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className="border-primary/20 group hover:bg-primary/5 flex cursor-pointer items-center justify-between rounded-lg border bg-white p-3 shadow-xs transition-all"
                              onClick={() => togglePackage(pkg.id)}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {pkg.package_name}
                                </p>
                                <p className="text-primary/70 text-xs font-medium">
                                  Target Perpindahan
                                </p>
                              </div>
                              <div className="rounded-md p-1.5 transition-colors group-hover:bg-red-50">
                                <MoveLeft className="text-primary/40 h-4 w-4 group-hover:text-red-500" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                            <p className="text-center text-sm leading-relaxed font-medium">
                              Pilih paket di sisi kiri
                              <br />
                              untuk dipindahkan
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl border border-dashed p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Sistem akan mencatat riwayat perpindahan trainer ini secara
                    permanen untuk kebutuhan audit dan transparansi operasional.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="bg-background fixed right-0 bottom-0 left-0 z-20 border-t p-6">
            <div className="mx-auto flex max-w-6xl items-center justify-between">
              <div></div>
              <Button
                className="h-11 px-10 font-bold"
                onClick={handleTransfer}
                disabled={selectedPackageIds.length === 0}
              >
                Pindahkan{" "}
                {selectedPackageIds.length > 0 &&
                  `(${selectedPackageIds.length}) Paket`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransferMemberDialog
