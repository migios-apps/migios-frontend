import React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CreateTaxDefaultSaleItemType,
  TaxesType,
} from "@/services/api/@types/settings/taxes"
import { apiCreateOrUpdateDefaultTaxSaleItem } from "@/services/api/settings/TaxesService"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { TaxType } from "./types"
import {
  CreateStandardRateSchema,
  ReturnStandardRateFormSchema,
  resetStandardRateForm,
} from "./validation"

type DialogTaxesDefaultProps = {
  taxTypes: TaxType[]
  taxRates: TaxesType[]
  formProps: ReturnStandardRateFormSchema
  open: boolean
  onClose: () => void
}

const DialogTaxesDefault: React.FC<DialogTaxesDefaultProps> = ({
  taxTypes,
  taxRates,
  formProps,
  open,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const { handleSubmit, setValue } = formProps
  const watchStandardRates = formProps.watch("standardRates")

  // Fungsi untuk mengubah tax_id pada draftRates (tidak mengubah data asli)
  const handleCheck = (taxId: number, type: string, checked: boolean) => {
    if (checked) {
      const existingIndex = watchStandardRates.findIndex(
        (rate) => rate.type === type && rate.tax_id === taxId
      )

      if (existingIndex === -1) {
        const newDraftRates = [...watchStandardRates, { type, tax_id: taxId }]
        setValue("standardRates", newDraftRates)
      }
    } else {
      const newDraftRates = watchStandardRates.filter(
        (rate) => !(rate.type === type && rate.tax_id === taxId)
      )
      setValue("standardRates", newDraftRates)
    }
  }

  // Fungsi untuk select all tipe pajak untuk tax tertentu
  const handleSelectAllForTax = (taxId: number, checked: boolean) => {
    if (checked) {
      // Tambahkan semua tipe untuk tax_id ini
      const newRates = taxTypes.map((type) => ({
        type: type.key,
        tax_id: taxId,
      }))
      const existingRates = watchStandardRates.filter(
        (rate) => rate.tax_id !== taxId
      )
      setValue("standardRates", [...existingRates, ...newRates])
    } else {
      // Hapus semua tipe untuk tax_id ini
      const newRates = watchStandardRates.filter(
        (rate) => rate.tax_id !== taxId
      )
      setValue("standardRates", newRates)
    }
  }

  // Check apakah semua tipe sudah dipilih untuk tax tertentu
  const isAllSelectedForTax = (taxId: number) => {
    return taxTypes.every((type) =>
      watchStandardRates.some(
        (rate) => rate.tax_id === taxId && rate.type === type.key
      )
    )
  }

  const handleClose = () => {
    resetStandardRateForm(formProps)
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.taxDefaultSaleItem] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateTaxDefaultSaleItemType) =>
      apiCreateOrUpdateDefaultTaxSaleItem(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit = (data: CreateStandardRateSchema) => {
    create.mutate({
      items: data.standardRates,
    })
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Standar Pajak</DialogTitle>
          <DialogDescription>
            Pajak default untuk membership, pt program, dan class
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">All</TableHead>
                <TableHead>Pajak</TableHead>
                {taxTypes.map((t) => (
                  <TableHead key={t.key} className="text-center">
                    {t.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((tax, idx) => (
                <TableRow key={idx} className="hover:bg-muted/50">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isAllSelectedForTax(tax.id)}
                      onCheckedChange={(checked) =>
                        handleSelectAllForTax(tax.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {tax.name}
                  </TableCell>
                  {taxTypes.map((t) => (
                    <TableCell key={t.key} className="text-center">
                      <Checkbox
                        checked={
                          !!watchStandardRates.find(
                            (rate) =>
                              rate.tax_id === tax.id && rate.type === t.key
                          )
                        }
                        onCheckedChange={(checked) =>
                          handleCheck(tax.id, t.key, checked === true)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={create.isPending} onClick={handleSubmit(onSubmit)}>
            {create.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogTaxesDefault
