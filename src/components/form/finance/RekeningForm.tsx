import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateRekening } from "@/services/api/@types/finance"
import {
  apiCreateRekening,
  apiDeleteRekening,
  apiUpdateRekening,
} from "@/services/api/FinancialService"
import { Trash2 } from "lucide-react"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import AlertConfirm from "@/components/ui/alert-confirm"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormFieldItem,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import InputCurrency from "@/components/ui/input-currency"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import {
  CreateRekeningSchema,
  ReturnRekeningFormSchema,
} from "./financeValidation"

type FormProps = {
  open: boolean
  type: "create" | "update"
  formProps: ReturnRekeningFormSchema
  onClose: () => void
}

const RekeningForm: React.FC<FormProps> = ({
  open,
  type,
  formProps,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const club = useSessionUser((state) => state.club)
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const handleClose = () => {
    formProps.reset({})
    onClose()
  }

  const handlePrefecth = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.financialRekening] })
    handleClose()
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateRekening) => apiCreateRekening(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handlePrefecth,
  })

  const update = useMutation({
    mutationFn: (data: CreateRekening) =>
      apiUpdateRekening(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteRekening(id),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handlePrefecth,
  })

  const onSubmit: SubmitHandler<CreateRekeningSchema> = (data) => {
    if (type === "update") {
      update.mutate({
        name: data.name,
        number: data.number,
        balance: data.balance,
        enabled: data.enabled,
        club_id: club?.id as number,
        show_in_payment: data.show_in_payment,
      })
      return
    }
    if (type === "create") {
      create.mutate({
        club_id: club?.id as number,
        name: data.name,
        number: data.number,
        balance: data.balance,
        enabled: data.enabled,
        show_in_payment: data.show_in_payment,
      })
      return
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }
  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {type === "create" ? "Create Rekening" : "Update Rekening"}
            </DialogTitle>
          </DialogHeader>
          <Form {...formProps}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormFieldItem
                control={control}
                name="name"
                label={
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Name"
                    {...field}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="balance"
                label={
                  <FormLabel>
                    Balance <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.balance)}
                errorMessage={errors.balance?.message}
                render={({ field }) => (
                  <InputCurrency
                    placeholder="Rp. 0"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="show_in_payment"
                label={<FormLabel>Show in Payment</FormLabel>}
                invalid={Boolean(errors.show_in_payment)}
                errorMessage={errors.show_in_payment?.message}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Show in Payment
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value === 1)}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? 1 : 0)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormFieldItem
                control={control}
                name="enabled"
                label={<FormLabel></FormLabel>}
                invalid={Boolean(errors.enabled)}
                errorMessage={errors.enabled?.message}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {field.value ? "Enabled" : "Disabled"}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter className="flex items-center justify-between">
            {type === "update" ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <div></div>
            )}
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {create.isPending || update.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Rekening"
        description="Are you sure want to delete this rekening?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default RekeningForm
