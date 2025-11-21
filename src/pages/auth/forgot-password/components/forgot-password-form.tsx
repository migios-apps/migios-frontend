import { useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { cn, sleep } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormItem } from "@/components/ui/rh-form"

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
  }),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    console.log(data)

    toast.promise(sleep(2000), {
      loading: "Sending email...",
      success: () => {
        setIsLoading(false)
        reset()
        navigate("/otp")
        return `Email sent to ${data.email}`
      },
      error: "Error",
    })
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      containerClassName={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <FormItem
        label="Email"
        asterisk
        invalid={Boolean(errors.email)}
        errorMessage={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...field}
            />
          )}
        />
      </FormItem>
      <Button disabled={isLoading} type="submit">
        Continue
        {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
      </Button>
    </Form>
  )
}
