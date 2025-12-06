import { useForm } from "react-hook-form"
import dayjs from "dayjs"
import * as yup from "yup"

export const EventType = {
  package: "package",
  class: "class",
  other: "other",
}

export const EventFrequency = {
  hourly: "hourly",
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
  yearly: "yearly",
}

export const frequencyOptions = [
  { label: EventFrequency.hourly, value: "hourly" },
  { label: EventFrequency.daily, value: "daily" },
  { label: EventFrequency.weekly, value: "weekly" },
  { label: EventFrequency.monthly, value: "monthly" },
  { label: EventFrequency.yearly, value: "yearly" },
]

export const endTypeOptions = [
  { label: "On", value: "on" },
  { label: "Forever", value: "forever" },
]

export const dayOfWeekOptions = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
]

export const initialEventValues = {
  club_id: null,
  class_id: null,
  history_id: null,
  title: "",
  description: "",
  start: undefined,
  end: undefined,
  background_color: "#f6fa00",
  color: "#000",
  frequency: undefined,
  repeat: 0,
  selected_months: [],
  selected_weekdays: [],
  week_number: [],
  end_type: "on",
  type: null,
  event_type: null,
}

export const validationEventSchema = yup.object().shape({
  id: yup.number().optional().nullable(),
  club_id: yup.number().nullable().typeError("Club ID must be a number"),
  class_id: yup.number().nullable().typeError("Package ID must be a number"),
  history_id: yup.number().nullable().typeError("History ID must be a number"),
  title: yup.string().required("Title is required"),
  description: yup
    .string()
    .max(255, "Description must be at most 255 characters")
    .nullable(),
  frequency: yup
    .string()
    .required("Frequency is required")
    .oneOf(
      ["hourly", "daily", "weekly", "monthly", "yearly"],
      "Invalid frequency value"
    ),
  background_color: yup
    .string()
    .nullable()
    .matches(
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      "Background color must be a valid hex code"
    ),
  color: yup
    .string()
    .nullable()
    .matches(
      /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
      "Color must be a valid hex code"
    ),
  start: yup
    .string()
    .required("Start date is required")
    .when("frequency", {
      is: "weekly",
      then: (schema) =>
        schema.test(
          "is-valid-date",
          "Start date must be a valid date in format YYYY-MM-DD",
          (value) => {
            return dayjs(value, "YYYY-MM-DD", true).isValid()
          }
        ),
      otherwise: (schema) =>
        schema.test(
          "is-valid-date",
          "Start date must be a valid date in format YYYY-MM-DD HH:mm",
          (value) => {
            return dayjs(value, "YYYY-MM-DD HH:mm", true).isValid()
          }
        ),
    }),
  end: yup
    .string()
    .required("End date is required")
    .when("frequency", {
      is: "weekly",
      then: (schema) =>
        schema.test(
          "is-valid-date",
          "End date must be a valid date in format YYYY-MM-DD",
          (value) => {
            return dayjs(value, "YYYY-MM-DD", true).isValid()
          }
        ),
      otherwise: (schema) =>
        schema.test(
          "is-valid-date",
          "End date must be a valid date in format YYYY-MM-DD HH:mm",
          (value) => {
            return dayjs(value, "YYYY-MM-DD HH:mm", true).isValid()
          }
        ),
    })
    .test(
      "is-after-start",
      "End date must be after the start date",
      function (value) {
        const { start, frequency } = this.parent
        if (!start || !value) return true // Skip if one of the values is missing
        const format =
          frequency === "weekly" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"
        return dayjs(value, format).isAfter(dayjs(start, format))
      }
    ),
  // start_time: yup
  //   .string()
  //   .nullable()
  //   .when('frequency', {
  //     is: (frequency: string) =>
  //       frequency === 'hourly' || frequency === 'daily',
  //     then: (schema) =>
  //       schema
  //         .required('Start time is required')
  //         .matches(
  //           /^([01]\d|2[0-3]):([0-5]\d)$/,
  //           'Start time must be in HH:mm format'
  //         ),
  //     otherwise: (schema) => schema.nullable(),
  //   }),
  // end_time: yup
  //   .string()
  //   .nullable()
  //   .when('frequency', {
  //     is: (frequency: string) =>
  //       frequency === 'hourly' || frequency === 'daily',
  //     then: (schema) =>
  //       schema
  //         .required('End time is required')
  //         .matches(
  //           /^([01]\d|2[0-3]):([0-5]\d)$/,
  //           'End time must be in HH:mm format'
  //         ),
  //     otherwise: (schema) => schema.nullable(),
  //   }),
  end_type: yup
    .string()
    .required("End type is required")
    .oneOf(["on", "forever"], "Invalid end type value"),
  repeat: yup
    .number()
    .required("Repeat is required")
    .min(0, "Repeat must be at least 0"),
  week_number: yup
    .array()
    .of(yup.number())
    .when("frequency", {
      is: "monthly",
      then: (schema) =>
        schema
          .required("Week numbers are required")
          .min(1, "At least one week number must be selected"),
      otherwise: (schema) => schema.nullable(),
    }),
  selected_months: yup
    .array()
    .of(
      yup
        .number()
        .min(1, "Month value must be at least 1")
        .max(12, "Month value must be at most 12")
    )
    .when("frequency", {
      is: "yearly",
      then: (schema) =>
        schema
          .required("Selected months are required")
          .min(1, "At least one month must be selected"),
      otherwise: (schema) => schema.nullable(),
    }),
  selected_weekdays: yup
    .array()
    .of(
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
          .typeError("Event ID must be a number"),
      })
    )
    .when("frequency", {
      is: (val: string) => ["weekly", "monthly", "yearly"].includes(val),
      then: (schema) =>
        schema
          .required("Selected weekdays are required")
          .min(1, "At least one weekday must be selected"),
      otherwise: (schema) => schema.nullable(),
    }),
  type: yup
    .string()
    .nullable()
    .oneOf(["update", "delete", null], "Invalid type value"),
  event_type: yup
    .string()
    .required("Event type is required")
    .oneOf(["package", "other", "class"], "Invalid event type value"),
})

export type CreateEventSchemaType = yup.InferType<typeof validationEventSchema>
export type ReturnEventSchemaType = ReturnType<
  typeof useForm<CreateEventSchemaType>
>

export const resetFormByFrequency = (
  form_props: ReturnEventSchemaType,
  frequency: string | undefined
) => {
  const watch_data = form_props.watch()
  const default_weekday = [
    {
      day_of_week: undefined as unknown as string,
      start_time: undefined as unknown as string,
      end_time: undefined as unknown as string,
    },
  ]

  if (frequency === "daily") {
    form_props.setValue("title", watch_data.title)
    form_props.setValue("description", watch_data.description)
    form_props.setValue("frequency", frequency)
    form_props.setValue("background_color", watch_data.background_color)
    form_props.setValue("color", watch_data.color)
    form_props.setValue(
      "start",
      watch_data.start ? dayjs(watch_data.start).format("YYYY-MM-DD HH:mm") : ""
    )
    form_props.setValue(
      "end",
      watch_data.end ? dayjs(watch_data.end).format("YYYY-MM-DD HH:mm") : ""
    )
    // form_props.setValue(
    //   'start_time',
    //   watch_data.start_time
    //     ? watch_data.start_time
    //     : watch_data.start
    //       ? dayjs(watch_data.start).format('HH:mm')
    //       : undefined
    // )
    // form_props.setValue(
    //   'end_time',
    //   watch_data.end_time
    //     ? watch_data.end_time
    //     : watch_data.end
    //       ? dayjs(watch_data.end).format('HH:mm')
    //       : undefined
    // )
    form_props.setValue("end_type", watch_data.end_type)
    // form_props.setValue('interval', watch_data.interval)
    form_props.setValue("repeat", 0)
    form_props.setValue("week_number", undefined)
    form_props.setValue("selected_months", undefined)
    form_props.setValue("selected_weekdays", [])
  }

  if (frequency === "weekly") {
    form_props.setValue("title", watch_data.title)
    form_props.setValue("description", watch_data.description)
    form_props.setValue("frequency", frequency)
    form_props.setValue("background_color", watch_data.background_color)
    form_props.setValue("color", watch_data.color)
    form_props.setValue(
      "start",
      watch_data.start ? dayjs(watch_data.start).format("YYYY-MM-DD") : ""
    )
    form_props.setValue(
      "end",
      watch_data.end ? dayjs(watch_data.end).format("YYYY-MM-DD") : ""
    )
    // form_props.setValue('start_time', undefined)
    // form_props.setValue('end_time', undefined)
    form_props.setValue("end_type", watch_data.end_type)
    form_props.setValue("repeat", 0)
    form_props.setValue("week_number", undefined)
    form_props.setValue("selected_months", undefined)
    form_props.setValue(
      "selected_weekdays",
      watch_data.selected_weekdays?.length
        ? watch_data.selected_weekdays
        : default_weekday
    )
  }

  if (frequency === "monthly") {
    form_props.setValue("title", watch_data.title)
    form_props.setValue("description", watch_data.description)
    form_props.setValue("frequency", frequency)
    form_props.setValue("background_color", watch_data.background_color)
    form_props.setValue("color", watch_data.color)
    form_props.setValue(
      "start",
      watch_data.start ? dayjs(watch_data.start).format("YYYY-MM-DD HH:mm") : ""
    )
    form_props.setValue(
      "end",
      watch_data.end ? dayjs(watch_data.end).format("YYYY-MM-DD HH:mm") : ""
    )
    // form_props.setValue('start_time', undefined)
    // form_props.setValue('end_time', undefined)
    form_props.setValue("end_type", watch_data.end_type)
    form_props.setValue("repeat", 0)
    form_props.setValue("week_number", watch_data.week_number)
    form_props.setValue("selected_months", undefined)
    form_props.setValue(
      "selected_weekdays",
      watch_data.selected_weekdays?.length
        ? watch_data.selected_weekdays
        : default_weekday
    )
  }

  if (frequency === "yearly") {
    form_props.setValue("title", watch_data.title)
    form_props.setValue("description", watch_data.description)
    form_props.setValue("frequency", frequency)
    form_props.setValue("background_color", watch_data.background_color)
    form_props.setValue("color", watch_data.color)
    form_props.setValue(
      "start",
      watch_data.start ? dayjs(watch_data.start).format("YYYY-MM-DD HH:mm") : ""
    )
    form_props.setValue(
      "end",
      watch_data.end ? dayjs(watch_data.end).format("YYYY-MM-DD HH:mm") : ""
    )
    // form_props.setValue('start_time', undefined)
    // form_props.setValue('end_time', undefined)
    form_props.setValue("end_type", watch_data.end_type)
    form_props.setValue("repeat", 0)
    form_props.setValue("week_number", undefined)
    form_props.setValue("selected_months", watch_data.selected_months)
    form_props.setValue(
      "selected_weekdays",
      watch_data.selected_weekdays?.length
        ? watch_data.selected_weekdays
        : default_weekday
    )
  }
}

// const compleate_key_value = {
//   clubId: 1,
//   classId: 1,
//   title: 'Annual Review',
//   description: 'Annual review meeting for performance evaluation.',
//   start: '2024-01-01T00:00:00.000Z',
//   end: '2026-12-31T23:59:59.000Z',
//   startTime: '10:00',
//   endTime: '10:15',
//   backgroundColor: '#ffd000',
//   color: '#f5f5f5',
//   frequency: 'yearly',
//   interval: 1,
//   endType: 'on', // on, forever
//   selectedMonths: [1, 7],
//   weekNumber: [1, 3, 2, 4],
//   selected_weekdays: [
//     {
//       dayOfWeek: 'wednesday',
//       startTime: '15:00',
//       endTime: '16:00',
//     },
//     {
//       dayOfWeek: 'friday',
//       startTime: '15:00',
//       endTime: '16:00',
//     },
//   ],
// }
