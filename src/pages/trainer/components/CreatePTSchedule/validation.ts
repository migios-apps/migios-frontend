import { useForm, UseFormReturn } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { DEFAULT_PAIRS } from "@/components/ui/color-palette-picker"
import { validationEventSchema } from "@/components/form/event/events"

const extendEventSchema = validationEventSchema.shape({
  is_specific_time: yup.boolean().default(false),
  selected_weekdays: yup.array().of(
    yup.object().shape({
      day_of_week: yup
        .string()
        .required("Day of week is required")
        .oneOf(
          [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
          "Day of week is required"
        ),
      start_time: yup
        .string()
        .required("Start time is required")
        .matches(
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Start time must be in HH:mm format"
        ),
      end_time: yup
        .string()
        .required("End time is required")
        .matches(
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "End time must be in HH:mm format"
        ),
      event_id: yup
        .number()
        .nullable()
        .optional()
        .typeError("Event ID must be a number"),
    })
  ),
})

export const extendedSchema = yup.object().shape({
  events: yup
    .array()
    .of(extendEventSchema)
    .min(1, "Minimal satu jadwal harus ada"),
})

export type EventTrainerFormValues = yup.InferType<typeof extendedSchema>
export type ReturnEventTrainerSchemaType = UseFormReturn<EventTrainerFormValues>

export const initTrainerEventValue = {
  title: "",
  description: "",
  is_specific_time: false,
  frequency: "weekly",
  repeat: 0,
  end_type: "on",
  event_type: "pt_program",
  is_publish: 1,
  background_color: DEFAULT_PAIRS[0].background,
  color: DEFAULT_PAIRS[0].color,
  selected_weekdays: [],
}

export const useEventTrainerValidation = () => {
  return useForm<EventTrainerFormValues>({
    resolver: yupResolver(extendedSchema) as any,
    defaultValues: {
      events: [],
    },
  })
}
