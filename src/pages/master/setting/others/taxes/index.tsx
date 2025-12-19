import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { TaxDefaultSaleItemType } from "@/services/api/@types/settings/taxes"
import {
  apiGetDefaultTaxSaleItem,
  apiGetTaxList,
} from "@/services/api/settings/TaxesService"
import { apiGetSettings } from "@/services/api/settings/settings"
import { SearchStatus1 } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "@/components/ui/loading"
import LayoutOtherSetting from "../Layout"
import DialogFormTax from "./DialogFormTax"
import DialogTaxCalculation from "./DialogTaxCalculation"
import DialogTaxesDefault from "./DialogTaxesDefault"
import { useStandardRateForm, useTaxForm } from "./validation"

// Tipe data
type TaxRate = {
  id: number
  name: string
  rate: number
  enabled: boolean
}

type TaxType = {
  key: string
  label: string
}

// // Konstanta
// const TAX_RATES: TaxRate[] = [
//   { id: 1, name: "PPn", rate: 11, enabled: true },
//   { id: 2, name: "PPn 2", rate: 10, enabled: true },
//   { id: 3, name: "Ppn2", rate: 10, enabled: true },
// ]

const TAX_TYPES: TaxType[] = [
  { key: "membership", label: "Membership" },
  { key: "pt_program", label: "PT Program" },
  { key: "class", label: "Kelas" },
  { key: "product", label: "Produk" },
  { key: "service", label: "Jasa" },
]

// Data standar pajak
const DEFAULT_STANDARD_RATES: TaxDefaultSaleItemType[] = [
  { type: "membership", tax_id: 2 },
  { type: "pt_program", tax_id: 2 },
  { type: "class", tax_id: 2 },
  { type: "product", tax_id: 2 },
  { type: "membership", tax_id: 1 },
  // { type: 'pt_program', tax_id: 1 },
]

// Fungsi untuk mendapatkan label pajak berdasarkan tipe
const getStandardTaxLabel = (
  type: string,
  taxData: TaxRate[],
  standardRates: TaxDefaultSaleItemType[]
): string | React.ReactElement => {
  const relatedRates = standardRates.filter((s) => s.type === type)

  if (relatedRates.length === 0) {
    return <Badge variant="secondary">No Taxes</Badge>
  }

  const taxDetails = relatedRates
    .map((rate) => {
      const tax = taxData.find((t) => t.id === rate.tax_id)
      return tax ? `${tax.name} (${tax.rate}%)` : null
    })
    .filter(Boolean)

  return taxDetails.length > 0 ? (
    taxDetails.join(", ")
  ) : (
    <Badge variant="secondary">No Taxes</Badge>
  )
}

const TaxSetting = () => {
  const [openDialog, setOpenDialog] = useState(false)
  const [openTaxDialog, setOpenTaxDialog] = useState(false)
  const [taxDialogType, setTaxDialogType] = useState<"create" | "update">(
    "create"
  )
  const [openCalcDialog, setOpenCalcDialog] = useState(false)

  const taxFormProps = useTaxForm()

  const standardRateFormProps = useStandardRateForm()

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: () => apiGetSettings(),
    select: (res) => res.data,
  })

  const { data: taxData, isLoading: taxLoading } = useQuery({
    queryKey: [QUERY_KEY.taxList],
    queryFn: () => apiGetTaxList(),
    select: (res) => res.data,
  })

  const { data: defaultTaxData, isLoading: defaultTaxLoading } = useQuery({
    queryKey: [QUERY_KEY.taxDefaultSaleItem],
    queryFn: () => apiGetDefaultTaxSaleItem(),
    select: (res) => res.data,
  })

  return (
    <LayoutOtherSetting>
      <Loading loading={settingsLoading || taxLoading || defaultTaxLoading}>
        <div className="relative mx-auto max-w-3xl space-y-6">
          <Card className="gap-0 p-4">
            <CardContent className="flex w-full flex-col items-center justify-between p-0 md:flex-row">
              <div>
                <h6 className="text-xl font-bold">Penghitungan Pajak</h6>
                <span className="text-foreground mt-1 text-sm">
                  {settingsData?.tax_calculation === 1
                    ? "Harga retail anda sudah termasuk pajak"
                    : "Harga retail anda belum termasuk pajak"}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="font-semibold"
                onClick={() => setOpenCalcDialog(true)}
              >
                Ganti
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-0 p-4">
            <CardHeader className="p-0">
              <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
                <CardTitle>Tarif Pajak</CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setOpenTaxDialog(true)
                    setTaxDialogType("create")
                  }}
                >
                  Tambah
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {taxData && taxData.length > 0 ? (
                  taxData.map((tax, index) => (
                    <div
                      key={tax.id}
                      className={cn(
                        "hover:bg-muted flex cursor-pointer flex-wrap items-center justify-between gap-2 px-2 py-4 transition-colors",
                        index !== taxData.length - 1 && "border-border border-b"
                      )}
                      onClick={() => {
                        taxFormProps.setValue("id", tax.id)
                        taxFormProps.setValue("name", tax.name)
                        taxFormProps.setValue("rate", tax.rate)
                        setTaxDialogType("update")
                        setOpenTaxDialog(true)
                      }}
                    >
                      <span className="text-foreground mr-2 font-bold">
                        {tax.name}
                      </span>
                      <span className="text-foreground flex-shrink-0 font-medium md:text-right">
                        {tax.rate} %
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="bg-muted flex flex-col items-center justify-center rounded-lg py-10 text-center">
                    <div className="text-muted-foreground mb-4 text-5xl">
                      <SearchStatus1
                        color="currentColor"
                        size="64"
                        variant="Outline"
                      />
                    </div>
                    <p className="text-foreground text-lg font-medium">
                      Tidak ada tarif pajak
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Klik tombol Tambah untuk menambahkan tarif pajak baru
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 p-4">
            <CardHeader className="p-0">
              <div className="flex w-full flex-col justify-between gap-2 md:flex-row md:items-center">
                <div className="flex flex-col">
                  <CardTitle>Tarif Pajak Standar</CardTitle>
                  <div className="text-muted-foreground mt-1 text-sm md:mt-0">
                    Satu item dapat menerapkan beberapa tarif pajak sekaligus.
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    standardRateFormProps.setValue(
                      "standardRates",
                      defaultTaxData || []
                    )
                    setOpenDialog(true)
                  }}
                >
                  Atur Standar Pajak
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col">
                {TAX_TYPES.map((type, index) => (
                  <div
                    key={type.key}
                    className={cn(
                      "hover:bg-muted flex flex-wrap items-center justify-between gap-2 px-2 py-4 transition-colors",
                      index !== TAX_TYPES.length - 1 && "border-border border-b"
                    )}
                  >
                    <span className="text-foreground mr-2 font-bold">
                      {type.label}
                    </span>
                    <span className="text-foreground flex-shrink-0 md:text-right">
                      {getStandardTaxLabel(
                        type.key,
                        taxData || [],
                        defaultTaxData || []
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DialogTaxCalculation
            settingsData={settingsData}
            open={openCalcDialog}
            onClose={() => setOpenCalcDialog(false)}
          />

          <DialogTaxesDefault
            taxTypes={TAX_TYPES}
            taxRates={taxData || []}
            formProps={standardRateFormProps}
            open={openDialog}
            onClose={() => setOpenDialog(false)}
          />

          <DialogFormTax
            type={taxDialogType}
            formProps={taxFormProps}
            open={openTaxDialog}
            onClose={() => setOpenTaxDialog(false)}
          />
        </div>
      </Loading>
    </LayoutOtherSetting>
  )
}

export default TaxSetting
