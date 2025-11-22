import React from "react"
import { SalesDetailType } from "@/services/api/@types/sales"
import { ArrowDown2 } from "iconsax-reactjs"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePaymentForm } from "./validation"

interface BottomStickyPaymentProps {
  detail: SalesDetailType | null
}

const BottomStickyPayment: React.FC<BottomStickyPaymentProps> = ({
  detail,
}) => {
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = React.useState(false)

  // Menggunakan form validasi payment
  const { setValue } = usePaymentForm()

  // Inisialisasi form dengan data dari API saat detail berubah
  React.useEffect(() => {
    if (detail) {
      setValue("balance_amount", detail.ballance_amount || 0)
      // Konversi payments ke format yang sesuai dengan skema validasi
      const formattedPayments = detail.payments
        ? detail.payments.map((payment: any) => ({
            id: payment.id,
            name: payment.rekening_name || "",
            amount: payment.amount || 0,
          }))
        : []
      setValue("payments", formattedPayments)
      setValue("isPaid", detail.is_paid || 0)
    }
  }, [detail, setValue])

  return (
    <>
      <div className="fixed right-0 bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between px-8">
          <div></div>
          <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between">
            {detail ? (
              <>
                {[1].includes(detail?.is_paid) ? (
                  <DropdownMenu
                    open={openDropdown}
                    onOpenChange={setOpenDropdown}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        className={cn("w-full rounded-full", {
                          "text-primary border-primary": openDropdown,
                        })}
                        variant="default"
                      >
                        Lainnya
                        <ArrowDown2
                          color="currentColor"
                          size={16}
                          className={cn(
                            "ml-1 transition-transform duration-300",
                            {
                              "rotate-180": openDropdown,
                            }
                          )}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => navigate(`/sales/${detail?.id}/refund`)}
                      >
                        Pengembalian
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
                {[0, 2, 3].includes(detail?.is_paid) ? (
                  <Button
                    className="rounded-full"
                    variant="default"
                    onClick={() => {
                      navigate(`/sales/${detail?.code}/edit`)
                    }}
                  >
                    Bayar sekarang
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default BottomStickyPayment
