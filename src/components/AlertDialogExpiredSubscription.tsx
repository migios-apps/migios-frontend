import React from "react"
import { useMutation } from "@tanstack/react-query"
import { apiCreateNewSubscription } from "@/services/api/ClubService"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

type AlertDialogExpiredSubscriptionProps = {
  clubId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  showCloseButton?: boolean
}

const AlertDialogExpiredSubscription: React.FC<
  AlertDialogExpiredSubscriptionProps
> = ({ open, onOpenChange, clubId, showCloseButton = false }) => {
  const newSubscription = useMutation({
    mutationFn: apiCreateNewSubscription,
    onSuccess: () => {
      window.location.reload()
    },
    onError: () => {
      onOpenChange(false)
    },
  })

  const handleCreateNewSubscription = () => {
    if (!clubId) return

    newSubscription.mutate({
      club_id: clubId,
      duration: 7,
      duration_type: "day",
      plan_type: "free",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center" showCloseButton={showCloseButton}>
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center">
            Langganan Tidak Aktif
          </DialogTitle>
          <div className="text-muted-foreground space-y-2 text-sm">
            <p className="mx-auto max-w-sm space-y-1 text-left">
              Maaf, langganan Anda saat ini tidak aktif dan tidak dapat
              mengakses fitur ini. Hal ini dapat terjadi karena:
            </p>
            <ul className="mx-auto max-w-sm space-y-1 text-left">
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                Masa langganan telah berakhir (expired)
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                Pembayaran tertunda atau gagal
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                Akun sedang dalam peninjauan
              </li>
            </ul>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            disabled={newSubscription.isPending}
            onClick={handleCreateNewSubscription}
            className="w-full"
          >
            {newSubscription.isPending && <Spinner />}
            Perpanjang Langganan 7 Hari
          </Button>

          {/* Contact Support */}
          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Butuh bantuan?
              <button className="ml-1 text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Hubungi Support
              </button>
            </p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AlertDialogExpiredSubscription
