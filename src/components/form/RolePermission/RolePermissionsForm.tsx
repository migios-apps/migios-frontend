import React from "react"
import { SubmitHandler } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Permission } from "@/services/api/@types/settings/permission"
import { CreateRole } from "@/services/api/@types/settings/role"
import {
  apiCreateRole,
  apiDeleteRole,
  apiUpdateRole,
} from "@/services/api/settings/Role"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import AlertConfirm from "@/components/ui/alert-confirm"
import BottomStickyBar from "@/components/ui/bottom-sticky-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormFieldItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import Container from "@/components/container"
import {
  CreateRolePermissionFormSchema,
  ReturnRolePermissionFormSchema,
  resetRolePermissionForm,
} from "./validation"

interface Props {
  type: "create" | "update"
  formProps: ReturnRolePermissionFormSchema
  allPermissions: Permission[]
  onSuccess?: () => void
}

const RolePermissionsForm: React.FC<Props> = ({
  type,
  formProps,
  allPermissions,
  onSuccess,
}) => {
  const navigate = useNavigate()
  const {
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = formProps
  const watchData = watch()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const groupedPermissions = allPermissions.reduce<
    Record<string, Permission[]>
  >((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {})

  const togglePermission = (id: number) => {
    const current = watchData.permissions || []
    if (current.includes(id)) {
      setValue(
        "permissions",
        current.filter((pid) => pid !== id)
      )
    } else {
      setValue("permissions", [...current, id])
    }
  }

  const clearPermissions = () => {
    setValue("permissions", [])
  }

  const selectAllPermissions = () => {
    const allPermissionIds = allPermissions.map((perm) => perm.id)
    setValue("permissions", allPermissionIds)
  }

  const toggleAllPermissions = () => {
    const currentPermissions = watchData.permissions || []
    const allPermissionIds = allPermissions.map((perm) => perm.id)

    // Check if all permissions are already selected
    const allSelected = allPermissionIds.every((id) =>
      currentPermissions.includes(id)
    )

    if (allSelected) {
      clearPermissions()
    } else {
      selectAllPermissions()
    }
  }

  const areAllPermissionsSelected = () => {
    const currentPermissions = watchData.permissions || []
    const allPermissionIds = allPermissions.map((perm) => perm.id)
    return allPermissionIds.every((id) => currentPermissions.includes(id))
  }

  const handleClose = () => {
    onSuccess?.()
    resetRolePermissionForm(formProps)
  }

  // Mutations
  const create = useMutation({
    mutationFn: (data: CreateRole) => apiCreateRole(data),
    onError: (error) => {
      console.log("error create", error)
    },
    onSuccess: handleClose,
  })

  const update = useMutation({
    mutationFn: (data: CreateRole) =>
      apiUpdateRole(watchData.id as number, data),
    onError: (error) => {
      console.log("error update", error)
    },
    onSuccess: handleClose,
  })

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiDeleteRole(id),
    onError: (error) => {
      console.log("error delete", error)
    },
    onSuccess: handleClose,
  })

  const internalSubmit: SubmitHandler<CreateRolePermissionFormSchema> = (
    data
  ) => {
    const selectedPermissions = allPermissions.filter((p) =>
      data.permissions?.includes(p.id)
    )
    // onSubmit({
    //   display_name: data.display_name,
    //   description: data?.description,
    //   permissions: selectedPermissions,
    // })
    if (type === "create") {
      create.mutate({
        display_name: data.display_name,
        description: data?.description,
        permissions: selectedPermissions,
      })
    } else {
      update.mutate({
        display_name: data.display_name,
        description: data?.description,
        permissions: selectedPermissions,
      })
    }
  }

  const handleDelete = () => {
    deleteItem.mutate(watchData.id as number)
    setConfirmDelete(false)
    handleClose()
  }

  return (
    <>
      <Form {...formProps}>
        <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <FormFieldItem
                control={control}
                name="display_name"
                label={
                  <FormLabel>
                    Role Name <span className="text-destructive">*</span>
                  </FormLabel>
                }
                invalid={Boolean(errors.display_name)}
                errorMessage={errors.display_name?.message}
                render={({ field }) => (
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Name"
                    {...field}
                  />
                )}
              />
              <FormFieldItem
                control={control}
                name="description"
                label={<FormLabel>Description</FormLabel>}
                invalid={Boolean(errors.description)}
                errorMessage={errors.description?.message}
                render={({ field }) => (
                  <Textarea
                    placeholder="Description"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">Assign Permission</h3>
                  <button
                    type="button"
                    className="text-destructive text-sm hover:underline"
                    onClick={clearPermissions}
                  >
                    Clear Permission
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Select All
                  </span>
                  <Switch
                    checked={areAllPermissionsSelected()}
                    onCheckedChange={toggleAllPermissions}
                  />
                </div>
              </div>

              {errors.permissions && (
                <p className="text-destructive mb-2 text-sm">
                  {errors.permissions.message}
                </p>
              )}

              {Object.entries(groupedPermissions).map(
                ([category, perms], index) => (
                  <div
                    key={category}
                    className={cn(
                      "border-border bg-muted mb-6 rounded-md border p-4",
                      index === Object.entries(groupedPermissions).length - 1 &&
                        "mb-0"
                    )}
                  >
                    <h4 className="text-foreground mb-3 font-semibold">
                      {category}
                    </h4>
                    <div className="space-y-4">
                      {perms.map((perm) => {
                        const selected = watchData.permissions || []
                        return (
                          <div
                            key={perm.id}
                            className="border-border flex items-start justify-between border-b pb-3"
                          >
                            <div>
                              <p className="text-foreground font-medium">
                                {perm.display_name}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {perm.description}
                              </p>
                            </div>
                            <Switch
                              checked={selected.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
          <BottomStickyBar>
            <Container>
              <div className="flex items-center justify-between px-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="mr-2 size-4" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {type === "update" ? (
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={create.isPending || update.isPending}
                  >
                    {create.isPending || update.isPending
                      ? "Saving..."
                      : "Save"}
                  </Button>
                </div>
              </div>
            </Container>
          </BottomStickyBar>
        </form>
      </Form>

      <AlertConfirm
        open={confirmDelete}
        title="Delete Role"
        description="Are you sure want to delete this role?"
        type="delete"
        loading={deleteItem.isPending}
        onClose={() => setConfirmDelete(false)}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={handleDelete}
      />
    </>
  )
}

export default RolePermissionsForm
