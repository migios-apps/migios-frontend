import React from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UpdateUserDto } from "@/services/api/@types/user"
import { apiUpdateUserProfile } from "@/services/api/UserService"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "sonner"
import * as yup from "yup"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const userProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, "Nama minimal 2 karakter")
    .required("Nama harus diisi"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email harus diisi"),
  photo: yup.string().url("Format URL tidak valid").optional(),
})

type UserProfileValues = yup.InferType<typeof userProfileSchema>

const FormUserAccount = () => {
  const { user } = useSessionUser()
  const queryClient = useQueryClient()

  const userForm = useForm<UserProfileValues>({
    resolver: yupResolver(userProfileSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      photo: "",
    },
  })

  // Set form values when profile data is loaded
  React.useEffect(() => {
    if (user) {
      userForm.reset({
        name: user.name || "",
        email: user.email || "",
        photo: user.photo || "",
      })
    }
  }, [user, userForm])

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => apiUpdateUserProfile(data),
    onSuccess: () => {
      toast.success("Profile user berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.userProfile] })
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ||
          "Gagal memperbarui profile user"
      )
    },
  })

  const onSubmitUserProfile = (data: UserProfileValues) => {
    // Filter out empty photo URL
    const updateData: UpdateUserDto = {
      name: data.name,
      email: data.email,
      ...(data.photo && data.photo.trim() !== "" && { photo: data.photo }),
    }

    updateUserMutation.mutate(updateData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h3 className="text-lg font-medium">Profile User</h3>
        <p className="text-muted-foreground text-sm">
          Update informasi dasar akun Anda. Perubahan email dan photo akan
          mempengaruhi semua employee di semua club.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="mb-6 flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.photo || ""} alt={user?.name || ""} />
            <AvatarFallback className="text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-medium">{user?.name}</h4>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <Form {...userForm}>
          <form
            onSubmit={userForm.handleSubmit(onSubmitUserProfile)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormFieldItem
                control={userForm.control}
                name="name"
                label="Nama"
                description="Nama yang akan ditampilkan di akun Anda."
                render={({ field }) => (
                  <Input placeholder="Masukkan nama" {...field} />
                )}
              />

              <FormFieldItem
                control={userForm.control}
                name="email"
                label="Email"
                description="Email untuk login dan akan diupdate di semua employee."
                render={({ field }) => (
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    {...field}
                  />
                )}
              />
            </div>

            <FormFieldItem
              control={userForm.control}
              name="photo"
              label="URL Foto Profile"
              description="URL foto profile yang akan ditampilkan di semua employee."
              render={({ field }) => (
                <Input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  {...field}
                />
              )}
            />

            <Button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="w-full md:w-auto"
            >
              {updateUserMutation.isPending ? "Menyimpan..." : "Update Profile"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default FormUserAccount
