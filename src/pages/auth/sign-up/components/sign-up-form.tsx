import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Facebook, Github } from "lucide-react"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"

const formSchema = yup.object({
  email: yup
    .string()
    .email("Email tidak valid")
    .required("Please enter your email"),
  password: yup
    .string()
    .required("Please enter your password")
    .min(7, "Password must be at least 7 characters long"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords don't match."),
})

export type SignUpSchema = yup.InferType<typeof formSchema>

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignUpSchema>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: SignUpSchema) {
    setIsLoading(true)

    console.log(data)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
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
        <FormFieldItem
          control={form.control}
          name="password"
          label="Password"
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="new-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
        <FormFieldItem
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="new-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
        <Button disabled={isLoading} type="submit">
          Create Account
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isLoading}
          >
            <Github className="h-4 w-4" /> GitHub
          </Button>
          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isLoading}
          >
            <Facebook className="h-4 w-4" /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
