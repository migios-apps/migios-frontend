import React, { useEffect } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { useSessionUser } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CreateEventSchemaType,
  EventType,
  initialEventValues,
  validationEventSchema,
} from "@/components/form/event/events"
import FormEvent from "../event/FormEvent"
import { ReturnClassPageFormSchema } from "./validation"

type FormProps = {
  open: boolean
  formProps: ReturnClassPageFormSchema
  onClose: () => void
}

const FormClassEvent: React.FC<FormProps> = ({ open, formProps, onClose }) => {
  const club = useSessionUser((state) => state.club)
  const watchClass = formProps.watch()
  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    // { label: 'Yearly', value: 'yearly' },
  ]
  const defaultValue = {
    ...initialEventValues,
    history_id: null,
    // type: 'update', // 'update', 'delete'
    event_type: EventType.class, // 'package', 'other'
    club_id: club?.id,
    class_id: watchClass?.id,
    title: watchClass.name,
    description: watchClass.description,
  }
  const formEventProps = useForm({
    resolver: yupResolver(validationEventSchema),
    defaultValues: {
      ...defaultValue,
      title: watchClass.name ?? "Untitled",
      description: watchClass.description ?? "",
    },
  })

  // console.log('formEventProps', {
  //   watch: formEventProps.watch(),
  //   error: formEventProps.formState.errors,
  // })

  useEffect(() => {
    if (open) {
      if (watchClass.events && watchClass.events.length > 0) {
        const event = watchClass.events[0]
        formEventProps.reset(event)

        const format =
          event.frequency === "weekly" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"

        formEventProps.setValue("start", dayjs(event.start).format(format))
        formEventProps.setValue("end", dayjs(event.end).format(format))

        // if (watchClass.name) {
        //   formEventProps.setValue('title', `${watchClass.name}`)
        // }
        // if (watchClass.description) {
        //   formEventProps.setValue('description', watchClass.description)
        // }
      } else {
        formEventProps.reset(defaultValue)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit: SubmitHandler<CreateEventSchemaType> = (data) => {
    const format =
      data.frequency === "weekly" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"
    formProps.setValue("events", [
      {
        ...data,
        start: dayjs(data.start).format(format),
        end: dayjs(data.end).format(format),
      },
    ])
    formEventProps.reset(defaultValue)
    onClose()
  }
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-[620px]"
        floating
      >
        <SheetHeader>
          <SheetTitle>Event</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <Form {...formEventProps}>
          <form onSubmit={formEventProps.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[calc(100vh-10rem)] px-2">
              <div className="px-4">
                <FormEvent
                  shwoTitle={false}
                  showDescription={false}
                  formProps={formEventProps}
                  frequencyOptions={frequencyOptions}
                />
              </div>
            </ScrollArea>
            <SheetFooter>
              <div className="flex w-full items-center justify-end gap-2 px-4">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formEventProps.formState.isSubmitting}
                >
                  {formEventProps.formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

export default FormClassEvent
