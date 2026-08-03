import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetPermissionList } from "@/services/api/settings/Permission"
import { apiGetRoleById } from "@/services/api/settings/Role"
import { useNavigate, useParams } from "react-router"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import RolePermissionsForm from "@/components/form/RolePermission/RolePermissionsForm"
import { useRolePermissionForm } from "@/components/form/RolePermission/validation"

const EditRole = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const formProps = useRolePermissionForm()
  const { setValue } = formProps

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.permissions],
    queryFn: () => apiGetPermissionList(),
    select: (res) => res.data,
  })

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: [QUERY_KEY.roleUsersList, id],
    queryFn: () => apiGetRoleById(Number(id)),
    select: (res) => res.data,
    enabled: !!id,
  })

  useEffect(() => {
    if (!roleData) return
    setValue("id", roleData.id)
    setValue("display_name", roleData.display_name)
    setValue("description", roleData.description)
    setValue(
      "permissions",
      roleData.permissions.map((p) => p.id)
    )
  }, [roleData, setValue])

  return (
    <Loading loading={isLoading && roleLoading}>
      <RolePermissionsForm
        type="update"
        formProps={formProps}
        allPermissions={data ?? []}
        onSuccess={() => navigate("/settings/roles-permissions")}
      />
    </Loading>
  )
}

export default EditRole
