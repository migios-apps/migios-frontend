import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { ArrowRight, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as yup from "yup"
import { cn, sleep } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = yup.object({
  email: yup
    .string()
    .email("Email tidak valid")
    .required("Please enter your email"),
})

export type ForgotPasswordSchema = yup.InferType<typeof formSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordSchema>({
    resolver: yupResolver(formSchema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: ForgotPasswordSchema) {
    setIsLoading(true)

    console.log(data)

    toast.promise(sleep(2000), {
      loading: "Sending email...",
      success: () => {
        setIsLoading(false)
        form.reset()
        navigate("/otp")
        return `Email sent to ${data.email}`
      },
      error: "Error",
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      >
        <FormFieldItem
          control={form.control}
          name="email"
          label="Email"
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
        <Button disabled={isLoading} type="submit">
          Continue
          {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        </Button>
      </form>
    </Form>
  )
}
