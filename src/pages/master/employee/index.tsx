import { useMemo, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { EmployeeDetail } from "@/services/api/@types/employee"
import { apiGetEmployeeList } from "@/services/api/EmployeeService"
import { Eye, Filter, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import InputDebounce from "@/components/ui/input-debounce"
import { FullPagination } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

const EmployeeCard = ({ data }: { data: EmployeeDetail }) => {
  const navigate = useNavigate()
  const handleViewDetails = (member: EmployeeDetail) => {
    navigate(`/employee/detail/${member.code}`)
  }
  return (
    <Card
      className="cursor-pointer py-0"
      onClick={() => handleViewDetails(data)}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <Avatar className="size-16">
            <AvatarImage src={data.photo || ""} alt={data.name} />
            <AvatarFallback>
              {data.name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <Button variant="ghost" size="icon" className="size-8">
            <Eye className="size-4" />
            <span className="sr-only">View details</span>
          </Button>
        </div>
        <div className="mb-3 flex flex-col gap-0.5">
          <span className="text-foreground line-clamp-1 leading-none font-medium">
            {data.name}
          </span>
          <span className="text-muted-foreground line-clamp-1 text-xs leading-none capitalize">
            {data.roles?.map((role) => role.name).join(", ") || "-"}
          </span>
        </div>
        <div className="bg-muted flex flex-col gap-3 rounded-lg p-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Email</span>
            <span className="text-foreground truncate text-sm font-medium">
              {data.email ?? "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Phone</span>
            <span className="text-foreground text-sm font-medium">
              {data.phone ?? "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const EmployeeList = () => {
  const navigate = useNavigate()
  const [tableData, setTableData] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const { data, isLoading } = useInfiniteQuery({
    queryKey: [QUERY_KEY.employees, tableData],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetEmployeeList({
        page: tableData.pageIndex,
        per_page: tableData.pageSize,
        ...(tableData.sort?.key !== ""
          ? {
              sort_column: tableData.sort?.key as string,
              sort_type: tableData.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        ...(tableData.query === ""
          ? {}
          : {
              search: [
                {
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableData.query,
                },
              ],
            }),
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const employeeList = useMemo(
    () => (data ? data.pages.flatMap((page) => page.data.data) : []),
    [data]
  )
  const total = data?.pages[0]?.data.meta.total || 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-foreground">
          <span className="text-primary mr-2">{total}</span>
          Employees
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 size-4" />
            Filter
          </Button>

          <Button
            onClick={() => {
              navigate("/employee/create")
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Tambah
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <InputDebounce
          placeholder="Search name..."
          handleOnchange={(value) => {
            setTableData({ ...tableData, query: value, pageIndex: 1 })
          }}
        />
      </div>

      {isLoading ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="py-0">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <Skeleton className="size-16 rounded-full" />
                  <Skeleton className="size-8 rounded-md" />
                </div>
                <div className="mb-3 flex flex-col gap-0.5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="bg-muted flex flex-col gap-3 rounded-lg p-4">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {employeeList.map((employee) => (
            <EmployeeCard key={employee.id} data={employee} />
          ))}
        </div>
      )}

      {!isLoading && (
        <FullPagination
          displayTotal
          total={total}
          pageSize={tableData.pageSize}
          currentPage={tableData.pageIndex}
          onChange={(value) => {
            setTableData({
              ...tableData,
              pageIndex: value,
            })
          }}
          onPageSizeChange={(value) => {
            setTableData({
              ...tableData,
              pageSize: value,
              pageIndex: 1,
            })
          }}
        />
      )}
    </div>
  )
}

export default EmployeeList
