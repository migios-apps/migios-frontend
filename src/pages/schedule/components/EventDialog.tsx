import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import * as yup from "yup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker/date-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SelectedCell } from "../types"

type FormModel = {
  title: string
  startDate: Date
  endDate: Date
  color: string
}

export type EventParam = {
  id: string
  title: string
  start: string
  end?: string
  backgroundColor: string
  color: string
}

type EventDialogProps = {
  open: boolean
  selected: SelectedCell
  onDialogOpen: (open: boolean) => void
  submit: (eventData: EventParam, type: string) => void
}

const colorOptions = [
  {
    value: "red",
    label: "red",
    color: "bg-red-400",
  },
  {
    value: "orange",
    label: "orange",
    color: "bg-orange-400",
  },
  {
    value: "yellow",
    label: "yellow",
    color: "bg-yellow-400",
  },
  {
    value: "green",
    label: "green",
    color: "bg-green-400",
  },
  {
    value: "blue",
    label: "blue",
    color: "bg-blue-400",
  },
  {
    value: "purple",
    label: "purple",
    color: "bg-purple-400",
  },
]

const validationSchema = yup.object({
  title: yup.string().required("Event title required"),
  startDate: yup.date().required("Please select a date"),
  endDate: yup.date().required("Please select a date"),
  color: yup.string().required("Color required"),
})

const EventDialog = (props: EventDialogProps) => {
  const { submit, open, selected, onDialogOpen } = props

  const handleDialogClose = () => {
    onDialogOpen(false)
  }

  const form = useForm<FormModel>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      startDate: new Date(),
      endDate: new Date(),
      color: colorOptions[0].value,
    },
  })

  const onSubmit = (values: FormModel) => {
    const eventData: EventParam = {
      id: selected.id as string,
      title: values.title,
      start: dayjs(values.startDate).format(),
      color: values.color,
      backgroundColor: values.color,
    }
    if (values.endDate) {
      eventData.end = dayjs(values.endDate).format()
    }
    console.log("eventData", eventData)
    submit?.(eventData, selected.type)
    handleDialogClose()
  }

  useEffect(() => {
    if (selected) {
      form.reset({
        title: selected.title || "",
        startDate: (selected.start && dayjs(selected.start).toDate()) as Date,
        endDate: (selected.end && dayjs(selected.end).toDate()) as Date,
        color: colorOptions[0].value,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selected.type === "NEW" ? "Add New Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event title</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="Event title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Pick a date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End date</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholder="Pick a date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color} />
                            <span className="capitalize">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" className="w-full">
                {selected.type === "NEW" ? "Create" : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EventDialog
