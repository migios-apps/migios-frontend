import { useQuery } from "@tanstack/react-query"
import { apiGetPermissionList } from "@/services/api/settings/Permission"
import { apiGetRoleById } from "@/services/api/settings/Role"
import { useNavigate, useParams } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import RolePermissionsForm from "@/components/form/RolePermission/RolePermissionsForm"
import { useRolePermissionForm } from "@/components/form/RolePermission/validation"

const EditRole = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const formProps = useRolePermissionForm()

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.permissions],
    queryFn: () => apiGetPermissionList(),
    select: (res) => res.data,
  })

  const { isLoading: roleLoading } = useQuery({
    queryKey: [QUERY_KEY.roleUsersList, id],
    queryFn: async () => {
      const res = await apiGetRoleById(Number(id))
      const roleData = res.data
      formProps.setValue("id", roleData.id)
      formProps.setValue("display_name", roleData.display_name)
      formProps.setValue("description", roleData.description)
      formProps.setValue(
        "permissions",
        roleData.permissions.map((p) => p.id)
      )
      return res
    },
    select: (res) => res.data,
    enabled: !!id,
  })

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
