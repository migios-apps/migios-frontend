import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CreateVoucher,
  VoucherPackageType,
} from "@/services/api/@types/voucher"
import {
  apiCreateVoucher,
  apiDeleteVoucher,
  apiUpdateVoucher,
} from "@/services/api/VoucherService"
import { Trash2 } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-picker"
import {
  Form,
  FormControl,
  FormDescription,
  FormFieldItem,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import VoucherScopePicker from "./VoucherScopePicker"
import { VoucherFormSchema, useVoucherForm } from "./voucherValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnType<typeof useVoucherForm>
  onClose: () => void
}

const PACKAGE_TYPES: Array<{ value: VoucherPackageType; label: string }> = [
  { value: "membership", label: "Membership" },
  { value: "pt_program", label: "Personal Trainer" },
  { value: "class", label: "Class" },
]

const FormVoucher: React.FC<FormProps> = ({
  open,
  type,
  formProps,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = formProps

  const discountType = watch("discount_type")
  const target = watch("target")
  const packageTypes = (watch("package_types") ?? []) as VoucherPackageType[]
  const scope = watch("scope")
  const scopePackageIds = (watch("scope_package_ids") ?? []) as number[]
  const scopeProductIds = (watch("scope_product_ids") ?? []) as number[]
  const voucherId = watch("id")

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.vouchers] })
    onClose()
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: async (values: VoucherFormSchema) => {
      const payload: CreateVoucher = {
        name: values.name,
        description: values.description ?? null,
        code: values.code.toUpperCase(),
        discount_type: values.discount_type as CreateVoucher["discount_type"],
        discount_value: Number(values.discount_value ?? 0),
        min_purchase: Number(values.min_purchase ?? 0),
        max_discount:
          values.max_discount === null || values.max_discount === undefined
            ? null
            : Number(values.max_discount),
        max_usage: Number(values.max_usage ?? 0),
        max_usage_per_member: Number(values.max_usage_per_member ?? 0),
        target: values.target as CreateVoucher["target"],
        package_types:
          values.target === "package_type"
            ? ((values.package_types ?? []) as VoucherPackageType[])
            : [],
        scope: values.scope as CreateVoucher["scope"],
        items:
          values.scope === "specific_items"
            ? [
                ...((values.scope_package_ids ?? []) as number[]).map((id) => ({
                  package_id: id,
                  product_id: null,
                })),
                ...((values.scope_product_ids ?? []) as number[]).map((id) => ({
                  package_id: null,
                  product_id: id,
                })),
              ]
            : [],
        enabled: values.enabled ?? true,
        start_date: values.start_date,
        expire_date: values.expire_date,
      }

      return values.id
        ? apiUpdateVoucher(values.id, payload)
        : apiCreateVoucher(payload)
    },
    onSuccess: invalidate,
  })

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => apiDeleteVoucher(id),
    onSuccess: invalidate,
  })

  const onSubmit: SubmitHandler<VoucherFormSchema> = (values) => save(values)

  const togglePackageType = (value: VoucherPackageType, checked: boolean) => {
    const next = checked
      ? [...packageTypes, value]
      : packageTypes.filter((item) => item !== value)
    setValue("package_types", next, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Tambah Voucher" : "Ubah Voucher"}
          </DialogTitle>
          <DialogDescription>
            Voucher memotong total transaksi. Nilai diskon selalu dihitung ulang
            oleh server saat dipakai.
          </DialogDescription>
        </DialogHeader>

        <Form {...formProps}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldItem
                control={control}
                name="name"
                label={<FormLabel>Nama Voucher</FormLabel>}
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
                render={({ field }) => (
                  <Input {...field} placeholder="Diskon Awal Tahun" />
                )}
              />

              <FormFieldItem
                control={control}
                name="code"
                label={<FormLabel>Kode Voucher</FormLabel>}
                invalid={Boolean(errors.code)}
                errorMessage={errors.code?.message}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="WELCOME10"
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                )}
              />
            </div>

            <FormFieldItem
              control={control}
              name="description"
              label={<FormLabel>Deskripsi</FormLabel>}
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Keterangan voucher"
                />
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldItem
                control={control}
                name="discount_type"
                label={<FormLabel>Tipe Diskon</FormLabel>}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Persen (%)</SelectItem>
                      <SelectItem value="nominal">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <FormFieldItem
                control={control}
                name="discount_value"
                label={
                  <FormLabel>
                    {discountType === "percent"
                      ? "Nilai Diskon (%)"
                      : "Nilai Diskon (Rp)"}
                  </FormLabel>
                }
                invalid={Boolean(errors.discount_value)}
                errorMessage={errors.discount_value?.message}
                render={({ field }) =>
                  discountType === "percent" ? (
                    <Input
                      type="number"
                      max={100}
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value)
                        )
                      }
                    />
                  ) : (
                    <InputCurrency
                      placeholder="Rp. 0"
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    />
                  )
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldItem
                control={control}
                name="min_purchase"
                label={<FormLabel>Minimal Pembelian</FormLabel>}
                render={({ field }) => (
                  <InputCurrency
                    placeholder="Rp. 0"
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="max_discount"
                label={<FormLabel>Maksimal Diskon</FormLabel>}
                description={
                  <FormDescription>
                    Plafon diskon untuk voucher persen. Kosongkan bila tanpa
                    batas.
                  </FormDescription>
                }
                render={({ field }) => (
                  <InputCurrency
                    placeholder="Rp. 0"
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldItem
                control={control}
                name="max_usage"
                label={<FormLabel>Kuota Total</FormLabel>}
                description={
                  <FormDescription>
                    Kosongkan atau isi 0 untuk tidak terbatas
                  </FormDescription>
                }
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="max_usage_per_member"
                label={<FormLabel>Kuota per Member</FormLabel>}
                description={
                  <FormDescription>
                    Kosongkan atau isi 0 untuk tidak terbatas
                  </FormDescription>
                }
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldItem
                control={control}
                name="start_date"
                label={<FormLabel>Tanggal Mulai</FormLabel>}
                invalid={Boolean(errors.start_date)}
                errorMessage={errors.start_date?.message}
                render={({ field }) => (
                  <DateTimePicker
                    value={
                      field.value ? (field.value as unknown as Date) : undefined
                    }
                    onChange={(date) =>
                      field.onChange(
                        date ? dayjs(date).format("YYYY-MM-DD") : null
                      )
                    }
                    hideTime={true}
                    clearable
                  />
                )}
              />

              <FormFieldItem
                control={control}
                name="expire_date"
                label={<FormLabel>Tanggal Berakhir</FormLabel>}
                invalid={Boolean(errors.expire_date)}
                errorMessage={errors.expire_date?.message}
                render={({ field }) => (
                  <DateTimePicker
                    value={
                      field.value ? (field.value as unknown as Date) : undefined
                    }
                    onChange={(date) =>
                      field.onChange(
                        date ? dayjs(date).format("YYYY-MM-DD") : null
                      )
                    }
                    hideTime={true}
                    clearable
                  />
                )}
              />
            </div>

            <FormFieldItem
              control={control}
              name="target"
              label={<FormLabel>Siapa yang Berhak</FormLabel>}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih siapa yang berhak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Semua pembeli</SelectItem>
                    <SelectItem value="package_type">
                      Member dengan paket tertentu
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {target === "package_type" ? (
              <FormItem>
                <FormLabel>Jenis Paket yang Berhak</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    {PACKAGE_TYPES.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={packageTypes.includes(item.value)}
                          onCheckedChange={(checked) =>
                            togglePackageType(item.value, Boolean(checked))
                          }
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  Voucher hanya bisa dipakai member yang punya paket aktif
                  berjenis di atas.
                </FormDescription>
              </FormItem>
            ) : null}

            <FormFieldItem
              control={control}
              name="scope"
              label={<FormLabel>Cakupan Diskon</FormLabel>}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih cakupan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Seluruh transaksi</SelectItem>
                    <SelectItem value="specific_items">
                      Paket atau produk tertentu
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            {scope === "specific_items" ? (
              <VoucherScopePicker
                enabled={open}
                packageIds={scopePackageIds}
                productIds={scopeProductIds}
                onChangePackageIds={(ids) =>
                  setValue("scope_package_ids", ids, { shouldValidate: true })
                }
                onChangeProductIds={(ids) =>
                  setValue("scope_product_ids", ids, { shouldValidate: true })
                }
                errorMessage={errors.scope_package_ids?.message}
              />
            ) : null}

            <FormFieldItem
              control={control}
              name="enabled"
              label={<FormLabel>Aktif</FormLabel>}
              render={({ field }) => (
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />

            <div className="flex items-center justify-between gap-2 pt-2">
              {type === "update" && voucherId ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Hapus
                </Button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  Simpan
                </Button>
              </div>
            </div>
          </form>
        </Form>

        <AlertConfirm
          open={confirmDelete}
          title="Hapus Voucher"
          description="Voucher yang sudah dipakai pada transaksi tidak dapat dihapus. Yakin ingin menghapus?"
          rightTitle="Hapus"
          type="delete"
          onClose={() => setConfirmDelete(false)}
          onRightClick={() => {
            if (voucherId) remove(voucherId)
            setConfirmDelete(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export default FormVoucher
