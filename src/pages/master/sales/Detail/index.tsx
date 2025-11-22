import React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetSales } from "@/services/api/SalesService"
import {
  CloseCircle,
  DocumentDownload,
  Printer,
  ReceiptText,
} from "iconsax-reactjs"
import { useNavigate, useParams } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusPaymentColor } from "@/constants/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ThemeSwitch } from "@/components/theme-switch"
import BottomStickyPayment from "./BottomStickyPayment"
import InvoiceA5 from "./InvoiceA5"
import InvoiceReceipt from "./InvoiceReceipt"

const SaleDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = React.useState("a5")

  const {
    data: detail,
    isLoading,
    // error,
  } = useQuery({
    queryKey: [QUERY_KEY.sales, id],
    queryFn: () => apiGetSales(id as string),
    select: (res) => res.data,
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Skeleton className="mb-4 h-10 w-[200px]" />
          <Skeleton className="h-5 w-[150px]" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-4 border-b border-gray-300 p-4 shadow-sm dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h5>FAKTUR #{detail?.code}</h5>
          <Badge
            variant="outline"
            className={
              statusPaymentColor[detail?.status || "unpaid"] ||
              statusPaymentColor.unpaid
            }
          >
            <span className="capitalize">{detail?.fstatus}</span>
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => window.print()}>
            <DocumentDownload color="currentColor" size={16} />
            Download PDF
          </Button>

          <ThemeSwitch />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/sales")}
          >
            <CloseCircle size={20} />
          </Button>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px] items-start h-full"> */}
      <div className="flex w-full flex-col">
        <Tabs value={tab} onValueChange={(value) => setTab(value)}>
          <TabsList>
            <TabsTrigger value="a5">
              <Printer color="currentColor" size={24} variant="Bulk" />
            </TabsTrigger>
            <TabsTrigger value="receipt">
              <ReceiptText color="currentColor" size={24} variant="Bulk" />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a5">
            {detail ? (
              <ScrollArea className="h-[calc(100vh-130px)]">
                <InvoiceA5 detail={detail} />
              </ScrollArea>
            ) : null}
          </TabsContent>
          <TabsContent value="receipt">
            {detail ? (
              <ScrollArea className="h-[calc(100vh-130px)]">
                <InvoiceReceipt detail={detail} />
              </ScrollArea>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
      {/* Komponen Payment Section */}
      {/* <PaymentSection
          detail={detail}
          isPending={updateSales.isPending}
          onSubmit={onSubmit}
        /> */}
      {/* </div> */}
      {detail?.status !== "void" && (
        <BottomStickyPayment detail={detail || null} />
      )}
    </>
  )
}

export default SaleDetail
