import React from "react"
import { Button } from "@/components/ui/button"
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
import {
  LoyaltyPointFormSchema,
  ReturnLoyaltyPointFormSchema,
  expiredTypeOptions,
  resetLoyaltyPointForm,
} from "./loyaltyPointValidation"

type DialogFormLoyaltyPointProps = {
  formProps: ReturnLoyaltyPointFormSchema
  open: boolean
  onClose: () => void
  onSave: (data: LoyaltyPointFormSchema) => void
  title?: string
}

const DialogFormLoyaltyPoint: React.FC<DialogFormLoyaltyPointProps> = ({
  formProps,
  open,
  onClose,
  onSave,
  title = "Loyalty Point",
}) => {
  const { control, handleSubmit, watch, formState } = formProps
  const watchData = watch()

  const handleClose = () => {
    resetLoyaltyPointForm(formProps)
    onClose()
  }

  const onSubmit = (data: LoyaltyPointFormSchema) => {
    onSave({
      ...data,
      expired_value: data.expired_type === "forever" ? 0 : data.expired_value,
    })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Atur loyalty point untuk package/product ini
          </DialogDescription>
        </DialogHeader>

        <Form {...formProps}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormFieldItem
                control={control}
                name="points"
                label={
                  <FormLabel>
                    Points <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(formState.errors.points)}
                errorMessage={formState.errors.points?.message}
                render={({ field }) => (
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      autoComplete="off"
                      placeholder="1000"
                      {...field}
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === "" ? 0 : Number(e.target.value)
                        field.onChange(value)
                      }}
                    />
                    <InputGroupAddon align="inline-end">Pts</InputGroupAddon>
                  </InputGroup>
                )}
              />

              <FormFieldItem
                control={control}
                name="expired_type"
                label={
                  <FormLabel>
                    Expired Type <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(formState.errors.expired_type)}
                errorMessage={formState.errors.expired_type?.message}
                render={({ field, fieldState }) => (
                  <Select
                    isSearchable={false}
                    placeholder="Pilih tipe expired"
                    value={expiredTypeOptions.find(
                      (opt) => opt.value === field.value
                    )}
                    options={expiredTypeOptions}
                    error={!!fieldState.error}
                    onChange={(option) => {
                      field.onChange(option?.value)
                      // Reset expired_value jika forever
                      if (option?.value === "forever") {
                        formProps.setValue("expired_value", 0)
                      }
                    }}
                  />
                )}
              />

              {watchData.expired_type !== "forever" && (
                <FormFieldItem
                  control={control}
                  name="expired_value"
                  label={
                    <FormLabel>
                      Expired Value <span className="text-destructive">*</span>
                    </FormLabel>
                  }
                  invalid={Boolean(formState.errors.expired_value)}
                  errorMessage={formState.errors.expired_value?.message}
                  render={({ field }) => (
                    <InputGroup>
                      <InputGroupInput
                        type="number"
                        autoComplete="off"
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value =
                            e.target.value === "" ? 0 : Number(e.target.value)
                          field.onChange(value)
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        {watchData.expired_type === "day"
                          ? "Hari"
                          : watchData.expired_type === "week"
                            ? "Minggu"
                            : watchData.expired_type === "month"
                              ? "Bulan"
                              : "Tahun"}
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                />
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DialogFormLoyaltyPoint
