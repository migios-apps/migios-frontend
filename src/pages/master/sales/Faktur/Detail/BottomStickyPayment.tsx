import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SalesDetailType } from "@/services/api/@types/sales"
import { apiVoidSales } from "@/services/api/SalesService"
import { ArrowDown2, Warning2 } from "iconsax-reactjs"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import { usePaymentForm } from "./validation"

interface BottomStickyPaymentProps {
  detail: SalesDetailType | null
}

const BottomStickyPayment: React.FC<BottomStickyPaymentProps> = ({
  detail,
}) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = React.useState(false)
  const [confirmVoid, setConfirmVoid] = React.useState(false)

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

  const handlePrefecth = (res?: any) => {
    const data = res?.data?.data
    console.log("refetch", data)
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.sales] })
    navigate("/sales")
  }

  const voidSales = useMutation({
    mutationFn: (id: number | string) => apiVoidSales(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  return (
    <>
      <div className="border-border bg-card fixed right-0 bottom-0 left-0 w-full border-t p-4">
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
                        onClick={() =>
                          navigate(`/sales/${detail?.code}/refund`)
                        }
                      >
                        Pengembalian
                      </DropdownMenuItem>
                      {[0, 1, 2, 3].includes(detail?.is_paid) ||
                      detail?.is_refunded ? (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setConfirmVoid(true)}
                        >
                          Dibatalkan
                        </DropdownMenuItem>
                      ) : null}
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

      <AlertConfirm
        open={confirmVoid}
        title="Batalkan Pesanan"
        description="Apakah Anda yakin ingin membatalkan pesanan ini?"
        rightTitle="Batalkan"
        type="delete"
        className="w-auto"
        icon={
          <div className="mb-2 rounded-full bg-red-100 p-2">
            <Warning2 size="70" color="#FF8A65" variant="Bulk" />
          </div>
        }
        loading={voidSales.isPending}
        onClose={() => setConfirmVoid(false)}
        onLeftClick={() => setConfirmVoid(false)}
        onRightClick={() => {
          if (detail) {
            voidSales.mutate(detail.id)
          }
        }}
      />
    </>
  )
}

export default BottomStickyPayment
