import { useState } from "react"
import { useForm } from "react-hook-form"
import { useAuth } from "@/auth"
import { yupResolver } from "@hookform/resolvers/yup"
import { Loader2, LogIn } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
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
})

export type SignInSchema = yup.InferType<typeof formSchema>

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const form = useForm<SignInSchema>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      email: "john@example.com",
      password: "password",
    },
  })

  async function onSubmit(data: SignInSchema) {
    setIsLoading(true)

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
      })

      if (result.status === "success") {
        toast.success(`Welcome back, ${data.email}!`)
        navigate(redirectTo ?? "/", { replace: true })
      } else {
        toast.error(result.message || "Sign in failed")
      }
    } catch (error) {
      toast.error("An error occurred during sign in")
    } finally {
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
          label={
            <div className="flex items-center justify-between">
              <span>Password</span>
              <Link
                to="/forgot-password"
                className="text-muted-foreground text-sm font-medium hover:opacity-75"
              >
                Forgot password?
              </Link>
            </div>
          }
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="current-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
        {/* forgot password? */}
        <Link
          to="/forgot-password"
          className="text-muted-foreground text-sm font-medium hover:opacity-75"
        >
          Forgot password?
        </Link>
        <Button disabled={isLoading} type="submit">
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>
        {/* don't have an account? */}
        <div className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>

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
          <Button variant="outline" type="button" disabled={isLoading}>
            <Github className="h-4 w-4" /> GitHub
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <Facebook className="h-4 w-4" /> Facebook
          </Button>
        </div> */}
      </form>
    </Form>
  )
}
