import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeStatusCuttingSession } from "@/services/api/@types/cutting-session"
import { apiChangeStatusCuttingSession } from "@/services/api/CuttingSessionService"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { SheetDescription } from "@/components/animate-ui/components/radix/sheet"
import {
  ChangeStatusFormSchema,
  ReturnChangeStatusFormSchema,
} from "./changeStatusValidation"

type FormChangeStatusProps = {
  open: boolean
  formProps: ReturnChangeStatusFormSchema
  onClose: () => void
}

const FormChangeStatus: React.FC<FormChangeStatusProps> = ({
  open,
  formProps,
  onClose,
}) => {
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = formProps
  console.log("formProps", { formProps: formProps.watch(), errors })

  const changeStatus = useMutation({
    mutationFn: (data: ChangeStatusCuttingSession) =>
      apiChangeStatusCuttingSession(data.id as number, {
        status: data.status,
        notes: data.notes || null,
      }),
    onError: (error) => {
      console.log("error change status", error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.cuttingSessions] })
      handleClose()
    },
  })

  const handleClose = () => {
    reset({
      id: 0,
      status: 0,
      notes: null,
    })
    onClose()
  }

  const onSubmit: SubmitHandler<ChangeStatusFormSchema> = (data) => {
    changeStatus.mutate({
      id: data.id,
      status: data.status,
      notes: data.notes || null,
    })
  }

  const statusOptions = [
    { label: "Approved", value: 1 },
    { label: "Rejected", value: 2 },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <SheetDescription />
        </DialogHeader>
        <Form {...formProps}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-4">
              <FormFieldItem
                control={control}
                name="status"
                label={
                  <FormLabel>
                    Status <span className="text-destructive">*</span>
                  </FormLabel>
                }
                render={({ field }) => (
                  <ButtonGroup className="w-full">
                    {statusOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={
                          field.value === option.value ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                )}
              />
              <FormFieldItem
                control={control}
                name="notes"
                label="Notes"
                render={({ field }) => (
                  <Textarea
                    placeholder="Notes"
                    {...field}
                    value={field.value || ""}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={changeStatus.isPending}>
                {changeStatus.isPending ? "Changing..." : "Change Status"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default FormChangeStatus
