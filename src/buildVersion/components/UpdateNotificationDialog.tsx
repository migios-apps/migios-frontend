import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UpdateNotificationDialogProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => Promise<void>
}

export function UpdateNotificationDialog({
  isOpen,
  onClose,
  onRefresh,
}: UpdateNotificationDialogProps) {
  const handleRefresh = async () => {
    await onRefresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <RefreshCw className="text-primary h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Update Tersedia</DialogTitle>
              <DialogDescription>
                Versi baru aplikasi telah tersedia
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            Aplikasi telah diperbarui dengan fitur dan perbaikan terbaru.
            Silakan refresh halaman untuk mendapatkan versi terbaru.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Nanti Saja
          </Button>
          <Button onClick={handleRefresh}>Refresh Sekarang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
