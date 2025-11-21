import { useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { showSubmittedData } from "@/lib/show-submitted-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormItem } from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const formSchema = z.object({
  otp: z
    .string()
    .min(6, "Please enter the 6-digit code.")
    .max(6, "Please enter the 6-digit code."),
})

type OtpFormProps = React.HTMLAttributes<HTMLFormElement>

export function OtpForm({ className, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: "" },
  })

  const otp = watch("otp")

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    showSubmittedData(data)

    setTimeout(() => {
      setIsLoading(false)
      navigate("/")
    }, 1000)
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      containerClassName={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <FormItem
        label="One-Time Password"
        labelClass="sr-only"
        invalid={Boolean(errors.otp)}
        errorMessage={errors.otp?.message}
      >
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <InputOTP
              maxLength={6}
              {...field}
              containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        />
      </FormItem>
      <Button disabled={otp.length < 6 || isLoading} type="submit">
        Verify
      </Button>
    </Form>
  )
}
