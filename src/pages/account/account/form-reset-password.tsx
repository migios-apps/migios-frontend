import React from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import { ResetPasswordDto } from "@/services/api/@types/user"
import { apiResetPassword } from "@/services/api/UserService"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import * as yup from "yup"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const resetPasswordSchema = yup
  .object({
    old_password: yup.string().min(1, "Password lama wajib diisi").required(),
    new_password: yup
      .string()
      .min(6, "Password baru minimal 6 karakter")
      .required(),
    confirm_password: yup
      .string()
      .min(1, "Konfirmasi password wajib diisi")
      .required(),
  })
  .test(
    "passwords-match",
    "Password baru dan konfirmasi password tidak cocok",
    function (values) {
      return values.new_password === values.confirm_password
    }
  )

type ResetPasswordValues = yup.InferType<typeof resetPasswordSchema>

const FormResetPassword: React.FC = () => {
  const { signOut } = useAuth()
  const passwordForm = useForm<ResetPasswordValues>({
    resolver: yupResolver(resetPasswordSchema) as any,
    defaultValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordDto) => apiResetPassword(data),
    onSuccess: () => {
      toast.success("Password berhasil diubah")
      passwordForm.reset()
      signOut()
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Gagal mengubah password"
      )
    },
  })

  const onSubmitResetPassword = (data: ResetPasswordValues) => {
    const resetData: ResetPasswordDto = {
      old_password: data.old_password,
      new_password: data.new_password,
    }

    resetPasswordMutation.mutate(resetData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="text-lg font-medium">Ubah Password</h3>
        <p className="text-muted-foreground text-sm">
          Pastikan akun Anda menggunakan password yang kuat untuk keamanan.
        </p>
      </div>

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onSubmitResetPassword)}
          className="space-y-6"
        >
          <FormFieldItem
            control={passwordForm.control}
            name="old_password"
            label="Password Lama"
            render={({ field }) => (
              <Input
                type="password"
                placeholder="Masukkan password lama"
                {...field}
              />
            )}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormFieldItem
              control={passwordForm.control}
              name="new_password"
              label="Password Baru"
              description="Password minimal 6 karakter."
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="Masukkan password baru"
                  {...field}
                />
              )}
            />

            <FormFieldItem
              control={passwordForm.control}
              name="confirm_password"
              label="Konfirmasi Password Baru"
              description="Ulangi password baru untuk konfirmasi."
              render={({ field }) => (
                <Input
                  type="password"
                  placeholder="Konfirmasi password baru"
                  {...field}
                />
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full md:w-auto"
            variant="destructive"
          >
            {resetPasswordMutation.isPending ? "Mengubah..." : "Ubah Password"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default FormResetPassword
