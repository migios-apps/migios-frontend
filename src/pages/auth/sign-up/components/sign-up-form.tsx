import { useState } from "react"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconFacebook, IconGithub } from "@/assets/brand-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormItem } from "@/components/ui/rh-form"
import { PasswordInput } from "@/components/password-input"

const formSchema = z
  .object({
    email: z.email({
      error: (iss) =>
        iss.input === "" ? "Please enter your email" : undefined,
    }),
    password: z
      .string()
      .min(1, "Please enter your password")
      .min(7, "Password must be at least 7 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    console.log(data)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
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
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="new-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
      </FormItem>
      <FormItem
        label="Confirm Password"
        asterisk
        invalid={Boolean(errors.confirmPassword)}
        errorMessage={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <PasswordInput
              placeholder="********"
              autoComplete="new-password"
              disabled={isLoading}
              {...field}
            />
          )}
        />
      </FormItem>
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
          <IconGithub className="h-4 w-4" /> GitHub
        </Button>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isLoading}
        >
          <IconFacebook className="h-4 w-4" /> Facebook
        </Button>
      </div>
    </Form>
  )
}
