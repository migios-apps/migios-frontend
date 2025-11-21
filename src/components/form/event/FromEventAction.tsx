import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import {
  CreateEventSchemaType,
  initialEventValues,
  validationEventSchema,
} from "@/components/form/event/events"
import FormEvent from "./FormEvent"

const FromEventAction = () => {
  const defaultValue = {
    ...initialEventValues,
    club_id: 1,
    // class_id: null,
    // history_id: null,
    type: "update", // 'update', 'delete'
    event_type: "other", // 'package', 'other'
  }
  const formProps = useForm({
    resolver: yupResolver(validationEventSchema),
    defaultValues: {
      ...defaultValue,
    },
  })

  const {
    watch,
    formState: { errors },
  } = formProps

  // console.log("formProps", { watch: watch(), errors })

  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
  ]

  const onSubmit: SubmitHandler<CreateEventSchemaType> = (data) => {
    console.log("data", data)
  }

  return (
    <Form {...formProps}>
      <form onSubmit={formProps.handleSubmit(onSubmit)} className="space-y-4">
        <FormEvent
          formProps={formProps as any}
          frequencyOptions={frequencyOptions}
        />
        <Button type="submit" disabled={formProps.formState.isSubmitting}>
          {formProps.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  )
}

export default FromEventAction
