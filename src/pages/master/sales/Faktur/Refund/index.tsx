import React, { useEffect } from "react"
import { useFieldArray } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { PaymentStatus } from "@/services/api/@types/sales"
import { apiGetSales } from "@/services/api/SalesService"
import { apiGetSettings } from "@/services/api/settings/settings"
import dayjs from "dayjs"
import { CloseCircle } from "iconsax-reactjs"
import { useNavigate, useParams } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/theme-switch"
import CartDetail from "../components/CartDetail"
import CartDetailSkeleton from "../components/CartDetailSkeleton"
import FormAddItemSale from "../components/FormAddItemSale"
import {
  ValidationTransactionSchema,
  useTransactionForm,
  useTransactionItemForm,
} from "../utils/validation"

const RefundSales = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [openAddItem, setOpenAddItem] = React.useState(false)
  const [formItemType, setFormItemType] = React.useState<"create" | "update">(
    "create"
  )
  const [indexItem, setIndexItem] = React.useState(0)

  const transactionSchema = useTransactionForm()
  const formPropsItem = useTransactionItemForm()

  // Load existing sales data
  const {
    data: salesData,
    isLoading: isLoadingSales,
    isPending: isPendingSales,
  } = useQuery({
    queryKey: [QUERY_KEY.sales, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null
      const res = await apiGetSales(id)
      const rawData = res.data

      return rawData
    },
  })

  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isPending: isPendingSettings,
  } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: async () => {
      const res = await apiGetSettings()
      return res.data
    },
  })

  // Set form values when data is loaded
  useEffect(() => {
    if (salesData && settingsData) {
      // Transform sales data to form format
      const transformedData = {
        tax_calculation: settingsData.tax_calculation,
        loyalty_enabled: settingsData.loyalty_enabled,
        taxes: settingsData.taxes,
        employee: salesData.employee,
        member: salesData.member,
        discount_type: salesData.discount_type,
        discount: salesData.discount,
        due_date: salesData.due_date
          ? dayjs(salesData.due_date).toDate()
          : new Date(),
        notes: salesData.notes,
        balance_amount: 0, // Akan dihitung otomatis oleh generateCartData dari items
        items:
          salesData.items
            ?.filter((item) => item.source_from === "item")
            .filter((item) => -Math.abs(item.quantity + item.qty_refund) !== 0)
            .map((item) => {
              // Untuk refund, quantity harus negatif
              const negativeQuantity = -Math.abs(
                item.quantity + item.qty_refund
              )
              const originalPrice =
                item.item_type === "package"
                  ? item.package?.price || 0
                  : item.price || 0
              // Gunakan sell_price yang sudah ada (untuk package) atau price (untuk product)
              const originalSellPrice =
                item.item_type === "package"
                  ? item.package?.sell_price || originalPrice
                  : item.price || 0

              return {
                item_type: item.item_type,
                package_id: item.package_id,
                product_id: item.product_id,
                name: item.name,
                product_qty: item.product?.quantity || null,
                quantity: negativeQuantity,
                price: originalPrice,
                sell_price: originalSellPrice * negativeQuantity,
                discount_type: item.discount_type,
                discount: item.discount,
                duration: item.duration,
                duration_type: item.duration_type,
                session_duration: item.session_duration,
                extra_session: item.extra_session,
                extra_day: item.extra_day,
                start_date: item.start_date ? new Date(item.start_date) : null,
                notes: item.notes,
                is_promo: 0,
                source_from: item.source_from || "item",
                loyalty_reward_id: item.loyalty_reward_id,
                loyalty_reward_name: item.loyalty_reward_name,
                loyalty_point:
                  item.item_type === "package"
                    ? item.package?.loyalty_point
                    : item.product?.loyalty_point,
                allow_all_trainer: item.package?.allow_all_trainer,
                package_type: item.package?.type,
                trainers: item.trainer,
                data: item,
              }
            }) || [],
        payments: [], // Untuk refund baru, payments kosong - akan diisi saat user klik payment method
        refund_from: [], // Untuk refund baru, refund_from kosong
      }

      // Set form values
      Object.keys(transformedData).forEach((key) => {
        transactionSchema.setValue(
          key as keyof ValidationTransactionSchema,
          transformedData[key as keyof typeof transformedData],
          {
            shouldValidate: true,
            shouldDirty: true,
          }
        )
      })
    }
  }, [salesData, settingsData, transactionSchema])

  const {
    append: appendTransactionItem,
    update: updateTransactionItem,
    remove: removeTransactionItem,
  } = useFieldArray({
    control: transactionSchema.control,
    name: "items",
  })

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/sales")
    }
  }

  return (
    <>
      <div className="flex w-full items-center justify-between gap-4 border-b border-gray-300 p-4 shadow-sm dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h5>Pengembalian Pesanan #{salesData?.code}</h5>
        </div>
        <div className="top-4.5 ltr:right-6 rtl:left-6">
          <div className="flex justify-start gap-4">
            <ThemeSwitch />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                window.localStorage.removeItem("item_edit_pos")
                handleBack()
              }}
            >
              <CloseCircle size={20} />
            </Button>
          </div>
        </div>
      </div>
      {isLoadingSales ||
      isLoadingSettings ||
      isPendingSales ||
      isPendingSettings ? (
        <CartDetailSkeleton />
      ) : (
        <>
          <CartDetail
            detailType="refund"
            detail={salesData}
            formPropsTransaction={transactionSchema}
            formPropsTransactionItem={formPropsItem}
            settings={settingsData}
            setIndexItem={setIndexItem}
            setOpenAddItem={setOpenAddItem}
            setFormItemType={setFormItemType}
            transactionId={salesData?.id}
            isPaid={salesData?.is_paid as PaymentStatus}
          />
        </>
      )}

      <FormAddItemSale
        open={openAddItem}
        type={formItemType}
        formProps={formPropsItem}
        index={indexItem}
        allowNegativeQuantity={true}
        onChange={(item, type) => {
          if (type === "create") {
            // Pastikan source_from sudah diset untuk item baru
            const newItem = {
              ...item,
              source_from: item.source_from || "item",
            }
            // Append selalu menambahkan item baru, tidak merge quantity
            // Item dengan source_from berbeda akan selalu menjadi item terpisah
            appendTransactionItem(newItem)
          } else if (type === "update") {
            updateTransactionItem(indexItem, item)
          }
        }}
        onDelete={(index) => {
          removeTransactionItem(index || indexItem)
        }}
        onClose={() => setOpenAddItem(false)}
      />
    </>
  )
}

export default RefundSales
