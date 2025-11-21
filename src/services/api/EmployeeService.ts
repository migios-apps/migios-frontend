import ApiService from "@/services/ApiService"
import { ParamsFilter } from "./@types/api"
import {
  CreateEmployee,
  EmployeeCommissionListTypeResponse,
  EmployeeDetailPage,
  EmployeeHeadType,
  EmployeeListTypeResponse,
} from "./@types/employee"
import {
  PackageTypeListResponse,
  TrainerMembersListResponse,
} from "./@types/package"

export async function apiGetEmployeeList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<EmployeeListTypeResponse>({
    url: `/employee/list`,
    method: "get",
    params,
  })
}

export async function apiGetEmployeeDetailPage(employee_code: string) {
  return ApiService.fetchDataWithAxios<{ data: EmployeeDetailPage }>({
    url: `/employee/detail/${employee_code}`,
    method: "get",
  })
}

export async function apiGetEmployeeCommissionList(params?: ParamsFilter) {
  return ApiService.fetchDataWithAxios<EmployeeCommissionListTypeResponse>({
    url: `/employee/commission`,
    method: "get",
    params,
  })
}

export async function apiGetEmployeeHead(
  employee_code: string,
  start_date: string,
  end_date: string
) {
  return ApiService.fetchDataWithAxios<{ data: EmployeeHeadType }>({
    url: `/employee/detail-head/${employee_code}`,
    method: "get",
    params: {
      start_date,
      end_date,
    },
  })
}

export async function apiCreateEmployee(data: CreateEmployee) {
  return ApiService.fetchDataWithAxios<{ data: EmployeeDetailPage }>({
    url: `/employee/create`,
    method: "post",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiUpdateEmployee(code: string, data: CreateEmployee) {
  return ApiService.fetchDataWithAxios<{ data: EmployeeDetailPage }>({
    url: `/employee/${code}/update`,
    method: "patch",
    data: data as unknown as Record<string, unknown>,
  })
}

export async function apiDeleteEmployee<T>(code: string) {
  return ApiService.fetchDataWithAxios<T>({
    url: `/employee/${code}/delete`,
    method: "delete",
  })
}

export async function apiGetPackagesEmployee(
  code: string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<PackageTypeListResponse>({
    url: `/employee/${code}/packages`,
    method: "get",
    params,
  })
}

export async function apiGetMembersEmployee(
  code: string,
  params?: ParamsFilter
) {
  return ApiService.fetchDataWithAxios<TrainerMembersListResponse>({
    url: `/employee/${code}/members`,
    method: "get",
    params,
  })
}
