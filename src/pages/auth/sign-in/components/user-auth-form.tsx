import { useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/auth"
import { Loader2, LogIn } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { IconFacebook, IconGithub } from "@/assets/brand-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormItem } from "@/components/ui/rh-form"
import { PasswordInput } from "@/components/password-input"

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
  }),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(7, "Password must be at least 7 characters long"),
})

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "john@example.com",
      password: "password",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
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
      <FormItem
        label="Password"
        asterisk
        invalid={Boolean(errors.password)}
        errorMessage={errors.password?.message}
        endLabel={
          <Link
            to="/forgot-password"
            className="text-muted-foreground text-sm font-medium hover:opacity-75"
          >
            Forgot password?
          </Link>
        }
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="current-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
      </FormItem>
      <Button disabled={isLoading} type="submit">
        {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
        Sign in
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
        <Button variant="outline" type="button" disabled={isLoading}>
          <IconGithub className="h-4 w-4" /> GitHub
        </Button>
        <Button variant="outline" type="button" disabled={isLoading}>
          <IconFacebook className="h-4 w-4" /> Facebook
        </Button>
      </div>
    </Form>
  )
}
