import React from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiAdjustMemberLoyaltyPoint } from "@/services/api/MembeService"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import * as yup from "yup"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Select } from "@/components/ui/react-select"
import { Textarea } from "@/components/ui/textarea"

const adjustTypeOptions = [
  { label: "Tambah Poin", value: "increase" },
  { label: "Kurangi Poin", value: "decrease" },
]

const validationSchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(["increase", "decrease"], "Tipe harus increase atau decrease")
    .required("Tipe harus diisi"),
  point: yup
    .number()
    .required("Jumlah poin harus diisi")
    .min(1, "Minimal 1 poin"),
  is_forever: yup.boolean().when("type", {
    is: "increase",
    then: (schema) => schema.default(true),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  expired_at: yup.date().when(["type", "is_forever"], {
    is: (type: string, isForever: boolean) =>
      type === "increase" && isForever === false,
    then: (schema) => schema.required("Tanggal kadaluarsa harus diisi"),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  description: yup.string().optional().nullable(),
})

type AdjustLoyaltyPointSchema = yup.InferType<typeof validationSchema>

interface DialogAdjustLoyaltyPointProps {
  open: boolean
  onClose: () => void
  memberCode: string
}

const DialogAdjustLoyaltyPoint: React.FC<DialogAdjustLoyaltyPointProps> = ({
  open,
  onClose,
  memberCode,
}) => {
  const queryClient = useQueryClient()
  const formProps = useForm<AdjustLoyaltyPointSchema>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      type: "increase",
      point: 0,
      is_forever: true,
      expired_at: undefined,
      description: "",
    },
  })

  const { control, handleSubmit, watch, setValue, reset, formState } = formProps
  const watchData = watch()

  const handleClose = () => {
    reset()
    onClose()
  }

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustLoyaltyPointSchema) => {
      // Untuk decrease, tidak perlu is_forever dan expired_at
      if (data.type === "decrease") {
        return apiAdjustMemberLoyaltyPoint(memberCode, {
          type: "decrease",
          point: data.point,
          description: data.description || undefined,
        })
      }

      // Untuk increase, kirim is_forever dan expired_at
      return apiAdjustMemberLoyaltyPoint(memberCode, {
        type: "increase",
        point: data.point,
        is_forever: data.is_forever,
        expired_at: data.is_forever
          ? undefined
          : data.expired_at?.toISOString().split("T")[0],
        description: data.description || undefined,
      })
    },
    onSuccess: () => {
      toast.success(
        `Berhasil ${watchData.type === "increase" ? "menambah" : "mengurangi"} ${watchData.point} poin`
      )
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.memberLoyaltyBalance],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.memberLoyaltyEarned],
      })
      handleClose()
    },
  })

  const handlePointsIncrement = () => {
    const currentValue = watchData.point || 0
    setValue("point", currentValue + 1)
  }

  const handlePointsDecrement = () => {
    const currentValue = watchData.point || 0
    if (currentValue > 0) {
      setValue("point", currentValue - 1)
    }
  }

  const onSubmit = (data: AdjustLoyaltyPointSchema) => {
    adjustMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Loyalty Point</DialogTitle>
          <DialogDescription>
            Tambah atau kurangi loyalty point member secara manual
          </DialogDescription>
        </DialogHeader>

        <Form {...formProps}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <FormFieldItem
              control={control}
              name="type"
              label={
                <FormLabel>
                  Tipe <span className="text-destructive">*</span>
                </FormLabel>
              }
              invalid={Boolean(formState.errors.type)}
              errorMessage={formState.errors.type?.message}
              render={({ field, fieldState }) => (
                <Select
                  isSearchable={false}
                  placeholder="Pilih tipe"
                  value={adjustTypeOptions.find(
                    (opt) => opt.value === field.value
                  )}
                  options={adjustTypeOptions}
                  error={!!fieldState.error}
                  onChange={(option) => field.onChange(option?.value)}
                  className="w-full"
                />
              )}
            />

            {/* Point */}
            <FormFieldItem
              control={control}
              name="point"
              label={
                <FormLabel>
                  Jumlah Poin <span className="text-destructive">*</span>
                </FormLabel>
              }
              invalid={Boolean(formState.errors.point)}
              errorMessage={formState.errors.point?.message}
              render={({ field }) => (
                <div className="flex w-full items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={handlePointsDecrement}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <InputGroup className="flex-1">
                    <InputGroupInput
                      type="number"
                      min="0"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value)
                        field.onChange(value)
                      }}
                      className="text-center"
                    />
                    <InputGroupAddon>Point</InputGroupAddon>
                  </InputGroup>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={handlePointsIncrement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />

            {/* Is Forever - hanya untuk increase */}
            {watchData.type === "increase" && (
              <>
                <FormFieldItem
                  control={control}
                  name="is_forever"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_forever"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (checked) {
                            setValue("expired_at", undefined)
                          }
                        }}
                      />
                      <FormLabel
                        htmlFor="is_forever"
                        className="cursor-pointer"
                      >
                        Poin berlaku selamanya
                      </FormLabel>
                    </div>
                  )}
                />

                {/* Date Range - hanya jika increase dan tidak forever */}
                {!watchData.is_forever && (
                  <FormFieldItem
                    control={control}
                    name="expired_at"
                    label={
                      <FormLabel>
                        Tanggal Kadaluarsa{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                    }
                    invalid={Boolean(formState.errors.expired_at)}
                    errorMessage={formState.errors.expired_at?.message}
                    render={({ field }) => (
                      <DatePicker
                        selected={
                          field.value ? dayjs(field.value).toDate() : undefined
                        }
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            field.onChange(date)
                          }
                        }}
                        placeholder="Pilih tanggal kadaluarsa"
                        error={!!formState.errors.expired_at}
                      />
                    )}
                  />
                )}
              </>
            )}

            {/* Description */}
            <FormFieldItem
              control={control}
              name="description"
              label={<FormLabel>Deskripsi</FormLabel>}
              invalid={Boolean(formState.errors.description)}
              errorMessage={formState.errors.description?.message}
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Masukkan deskripsi (opsional)"
                  rows={3}
                />
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={adjustMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={adjustMutation.isPending || formState.isSubmitting}
              >
                {adjustMutation.isPending || formState.isSubmitting
                  ? "Menyimpan..."
                  : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DialogAdjustLoyaltyPoint
