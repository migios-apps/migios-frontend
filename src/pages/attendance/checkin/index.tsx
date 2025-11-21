import React, { useMemo, useState } from "react"
import { SubmitHandler } from "react-hook-form"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import {
  CheckCode,
  CheckInPayload,
  CheckMemberCodePayload,
} from "@/services/api/@types/attendance"
import {
  apiCheckIn,
  apiCheckMemberCode,
  apiGetMemberAttendanceList,
} from "@/services/api/Attendance"
import handleApiError from "@/services/handleApiError"
import dayjs from "dayjs"
import { Camera, Scan } from "iconsax-reactjs"
import { Link } from "react-router-dom"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import CameraScanner from "@/components/ui/camera-scanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormFieldItem } from "@/components/ui/form"
import InputDebounce from "@/components/ui/input-debounce"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DialogMultiSelectPackage from "./DialogMultiSelectPackage"
import {
  CheckInFormSchema,
  resetCheckInValidation,
  useCheckInValidation,
} from "./validation"

const CheckIn = () => {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState("")
  const [scanValue, setScanValue] = useState<string>("")
  const [tabName, setTabName] = React.useState<"code" | "qr">("code")
  const [member, setMember] = useState<CheckCode | null>(null)
  const [openMultiSelectPackage, setOpenMultiSelectPackage] = useState(false)
  const [tableDataNotCheckIn, setTableDataNotCheckIn] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 8,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [tableDataCheckIn, setTableDataCheckIn] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const formPorps = useCheckInValidation()
  const {
    control,
    clearErrors,
    handleSubmit: handleSubmitCheckMemberCode,
  } = formPorps

  const {
    data: memberNotCheckIn,
    isFetchingNextPage: isFetchingMemberNotCheckIn,
    isLoading: isLoadingMemberNotCheckIn,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberAttendance, tableDataNotCheckIn],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberAttendanceList({
        page: tableDataNotCheckIn.pageIndex,
        per_page: tableDataNotCheckIn.pageSize,
        date: dayjs().startOf("day").format("YYYY-MM-DD"),
        ...(tableDataNotCheckIn.sort?.key !== ""
          ? {
              sort_column: tableDataNotCheckIn.sort?.key as string,
              sort_type: tableDataNotCheckIn.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        search: [
          {
            search_column: "need_checkin",
            search_condition: "=",
            search_text: "1",
          },
          ...(tableDataNotCheckIn.query === ""
            ? ([
                {
                  search_operator: "and",
                  search_column: "total_active_package",
                  search_condition: ">",
                  search_text: "0",
                },
                {
                  search_operator: "and",
                  search_column: "membership_status_code",
                  search_condition: "=",
                  search_text: "1",
                },
              ] as Filter[])
            : ([
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableDataNotCheckIn.query,
                },
                {
                  search_operator: "or",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableDataNotCheckIn.query,
                },
              ] as Filter[])),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listDataNotCheckIn = useMemo(
    () =>
      memberNotCheckIn
        ? memberNotCheckIn.pages.flatMap((page) => page.data.data)
        : [],
    [memberNotCheckIn]
  )
  const totalMemberNotCheckIn = memberNotCheckIn?.pages[0]?.data.meta.total ?? 0

  const {
    data: memberCheckIn,
    isFetchingNextPage: isFetchingMemberCheckIn,
    isLoading: isLoadingMemberCheckIn,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberAttendance, tableDataCheckIn],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberAttendanceList({
        page: tableDataCheckIn.pageIndex,
        per_page: tableDataCheckIn.pageSize,
        date: dayjs().startOf("day").format("YYYY-MM-DD"),
        ...(tableDataCheckIn.sort?.key !== ""
          ? {
              sort_column: tableDataCheckIn.sort?.key as string,
              sort_type: tableDataCheckIn.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "attendance_date",
              sort_type: "desc",
            }),
        search: [
          {
            search_column: "need_checkin",
            search_condition: "=",
            search_text: "0",
          },
          ...(tableDataCheckIn.query === ""
            ? [{}]
            : ([
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableDataCheckIn.query,
                },
                {
                  search_operator: "or",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableDataCheckIn.query,
                },
              ] as Filter[])),
        ],
      })
      return res
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.meta.page !== lastPage.data.meta.total_page
        ? lastPage.data.meta.page + 1
        : undefined,
  })

  const listDataCheckIn = useMemo(
    () =>
      memberCheckIn
        ? memberCheckIn.pages.flatMap((page) => page.data.data)
        : [],
    [memberCheckIn]
  )
  const totalMemberCheckIn = memberCheckIn?.pages[0]?.data.meta.total ?? 0

  const chekMemberCode = useMutation({
    mutationFn: (data: CheckMemberCodePayload) => apiCheckMemberCode(data),
    onError: (error) => {
      const resError = handleApiError(error)
      setErrorMessage(resError.message as any)
    },
    onSuccess: (data) => {
      setErrorMessage("")
      const { member_packages, total_active_package, ...res } = data.data
      setMember(data.data)
      if (total_active_package > 1) {
        setOpenMultiSelectPackage(true)
      } else if (total_active_package === 1) {
        handleCheckIn({
          code: res.code,
          date: dayjs().format("YYYY-MM-DD HH:mm"),
          location_type: "in",
          package: member_packages.map((pkg) => ({
            member_package_id: pkg.id,
            member_class_id: pkg.class_id,
          })),
        })
      }
    },
  })

  const handleCheckMemberCode = (code: string) => {
    chekMemberCode.mutate({
      code: code,
      date: dayjs().format("YYYY-MM-DD HH:mm"),
    })
  }

  const onSubmitCheckCode: SubmitHandler<CheckInFormSchema> = (data) => {
    setErrorMessage("")
    if (data.code.length) {
      handleCheckMemberCode(data.code)
    }
  }

  const checkIn = useMutation({
    mutationFn: (data: CheckInPayload) => apiCheckIn(data),
    onError: (error) => {
      const resError = handleApiError(error)
      setErrorMessage(resError.message as any)
    },
    onSuccess: () => {
      setErrorMessage("")
      resetCheckInValidation(formPorps)
      clearErrors()
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.memberAttendance] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.memberAttendance] })
    },
  })

  const handleCheckIn = (data: CheckInPayload) => {
    checkIn.mutate(data)
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[calc(100vh-15rem)] w-full flex-col gap-6 lg:flex-row">
          <Card className="w-full max-w-2xl p-0 shadow-none">
            <CardContent className="p-4">
              <Tabs
                className="w-full"
                value={tabName}
                onValueChange={(value) => setTabName(value as "code" | "qr")}
              >
                <div className="flex w-full items-center justify-center">
                  <TabsList>
                    <TabsTrigger value="code">
                      <Scan color="currentColor" size={20} variant="Bulk" />
                      Member code
                    </TabsTrigger>
                    <TabsTrigger value="qr">
                      <Camera color="currentColor" size={20} variant="Bulk" />
                      Camera QR
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="relative pt-2">
                  <TabsContent value="code">
                    <div className="flex flex-col gap-4">
                      <Form {...formPorps}>
                        <form
                          onSubmit={handleSubmitCheckMemberCode(
                            onSubmitCheckCode
                          )}
                        >
                          <FormFieldItem
                            control={control}
                            name="code"
                            render={({ field }) => (
                              <InputGroup className="border-primary h-12 border-2">
                                <InputGroupAddon align="inline-start">
                                  <Scan variant="Bulk" size={20} />
                                </InputGroupAddon>
                                <InputGroupInput
                                  {...field}
                                  autoFocus
                                  placeholder="Enter member code..."
                                  className="text-base"
                                />
                              </InputGroup>
                            )}
                          />
                        </form>
                      </Form>
                      {errorMessage.length > 0 ? (
                        <Alert variant="destructive">
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      ) : null}
                      <div className="border-border bg-border mb-2 h-px" />
                      <div className="flex items-center justify-between">
                        <h6 className="text-foreground w-full">{`Members hasn't check in (${totalMemberNotCheckIn})`}</h6>
                        <InputDebounce
                          placeholder="Search (name,code)..."
                          handleOnchange={(value) => {
                            setTableDataNotCheckIn({
                              ...tableDataNotCheckIn,
                              query: value,
                              pageIndex: 1,
                            })
                          }}
                        />
                      </div>
                      <ScrollArea className="h-[calc(100vh-31rem)]">
                        <div className="space-y-4 pr-3">
                          {listDataNotCheckIn.map((member, index) => (
                            <div
                              key={index}
                              className="border-border flex items-center justify-between gap-3 border-b pb-3"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="size-10">
                                  <AvatarImage
                                    src={member?.photo || ""}
                                    alt={member?.name}
                                  />
                                  <AvatarFallback>
                                    {member?.name?.charAt(0)?.toUpperCase() ||
                                      "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-foreground font-semibold">
                                    {member?.name}
                                  </span>
                                  <span className="text-muted-foreground text-sm">
                                    {member?.code}
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                className="h-8 px-2 py-0"
                                onClick={() =>
                                  handleCheckMemberCode(member.code)
                                }
                              >
                                Check In
                              </Button>
                            </div>
                          ))}

                          {isFetchingMemberNotCheckIn ||
                          isLoadingMemberNotCheckIn
                            ? Array.from({ length: 3 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="border-border flex items-center justify-between gap-3 border-b pb-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                      <Skeleton className="h-6 w-32" />
                                      <Skeleton className="h-4 w-48" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-7 w-16 rounded-md" />
                                </div>
                              ))
                            : null}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  <TabsContent value="qr">
                    <div className="flex w-full items-center justify-center">
                      <div className="w-full max-w-xl">
                        {errorMessage && (
                          <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{errorMessage}</AlertDescription>
                          </Alert>
                        )}
                        <CameraScanner
                          allowMultiple={false}
                          paused={tabName !== "qr"}
                          tracker="boundingBox"
                          onScan={(result) => {
                            const value = result[result.length - 1].rawValue
                            if (scanValue !== value) {
                              setScanValue(value)
                              setTimeout(() => {
                                handleCheckMemberCode(value)
                              }, 1000)
                            }
                          }}
                          onError={(error) => console.log("error", error)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl p-4 shadow-none">
            <CardHeader className="p-0">
              <div className="flex flex-col gap-2">
                <CardTitle>{`Members Check-ins (${totalMemberCheckIn})`}</CardTitle>
                <InputDebounce
                  placeholder="Search (name,code)..."
                  handleOnchange={(value) => {
                    setTableDataCheckIn({
                      ...tableDataCheckIn,
                      query: value,
                      pageIndex: 1,
                    })
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-27rem)]">
                <div className="space-y-4">
                  {listDataCheckIn.map((member, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center justify-between gap-3 border-b pb-3"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={member?.photo || ""}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="text-foreground font-medium">
                            {member.name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {member.code}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {member.attendance_packages
                              .map((item) => item.name)
                              .join(", ")}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {member.attendance_date
                              ? dayjs(member.attendance_date).format(
                                  "DD MMMM YYYY HH:mm"
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isFetchingMemberCheckIn || isLoadingMemberCheckIn
                    ? Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="border-border flex items-center justify-between gap-3 border-b pb-3"
                        >
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-32" />
                              <Skeleton className="h-3 w-48" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                        </div>
                      ))
                    : null}
                </div>
              </ScrollArea>
              <Link
                to={"/attendance/history"}
                className="bg-muted hover:bg-muted/80 text-foreground mt-4 flex w-full items-center justify-center rounded-md p-2 transition-colors"
              >
                ALL CHECK-INS
              </Link>
            </CardContent>
          </Card>
        </div>
        <DialogMultiSelectPackage
          data={member}
          open={openMultiSelectPackage}
          onClose={() => setOpenMultiSelectPackage(false)}
          onSubmit={(value) => {
            handleCheckIn({
              code: member!.code,
              date: dayjs().format("YYYY-MM-DD HH:mm"),
              location_type: "in",
              package: value,
            })
          }}
        />
      </CardContent>
    </Card>
  )
}

export default CheckIn
