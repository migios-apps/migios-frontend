import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useAuth } from "@/stores/auth-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"

const formSchema = yup.object({
  name: yup.string().required("Please enter your name"),
  email: yup
    .string()
    .email("Email tidak valid")
    .required("Please enter your email"),
  // phone: yup.string().required("Please enter your phone number"),
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

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  disableSubmit?: boolean
  setMessage?: (message: string) => void
}

export function SignUpForm({
  className,
  disableSubmit = false,
  setMessage,
  ...props
}: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const form = useForm<SignUpSchema>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      // phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: SignUpSchema) {
    const { name, password, email } = data

    if (!disableSubmit) {
      setIsLoading(true)
      const result = await signUp({
        name,
        password,
        email,
        // phone,
      })

      if (result?.status === "failed") {
        setMessage?.(result.message)
      }

      setIsLoading(false)
    }
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
          name="name"
          label="Full Name"
          render={({ field }) => (
            <Input
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              disabled={isLoading}
              {...field}
            />
          )}
        />
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
        {/* <FormFieldItem
          control={form.control}
          name="phone"
          label="Phone Number"
          render={({ field }) => (
            <PhoneInput
              placeholder="+62 *** *** ***"
              disabled={isLoading}
              {...field}
            />
          )}
        /> */}
        <FormFieldItem
          control={form.control}
          name="password"
          label="Password"
          render={({ field }) => (
            <PasswordInput
              placeholder="Password"
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
              placeholder="Confirm Password"
              autoComplete="new-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
        <Button disabled={isLoading} type="submit" variant="default">
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>

        {/* <div className="relative my-2">
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
        </div> */}
      </form>
    </Form>
  )
}
