import { useQuery } from "@tanstack/react-query"
import { apiGetPermissionList } from "@/services/api/settings/Permission"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import Loading from "@/components/ui/loading"
import RolePermissionsForm from "@/components/form/RolePermission/RolePermissionsForm"
import { useRolePermissionForm } from "@/components/form/RolePermission/validation"

const CreateRole = () => {
  const navigate = useNavigate()
  const formProps = useRolePermissionForm()

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.permissions],
    queryFn: () => apiGetPermissionList(),
    select: (res) => res.data,
  })

  return (
    <Loading loading={isLoading}>
      <RolePermissionsForm
        type="create"
        formProps={formProps}
        allPermissions={data ?? []}
        onSuccess={() => navigate("/settings/roles-permissions")}
      />
    </Loading>
  )
}

export default CreateRole
