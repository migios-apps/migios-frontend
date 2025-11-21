import React, { useMemo, useState } from "react"
import { SubmitHandler } from "react-hook-form"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { TableQueries } from "@/@types/common"
import { Filter } from "@/services/api/@types/api"
import { CheckOutPayload } from "@/services/api/@types/attendance"
import {
  apiCheckOut,
  apiGetMemberAttendanceList,
  apiGetMemberAttendanceLogList,
} from "@/services/api/Attendance"
import handleApiError from "@/services/handleApiError"
import dayjs, { Dayjs } from "dayjs"
import { Camera, Scan } from "iconsax-reactjs"
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
import { CheckInFormSchema } from "../checkin/validation"
import { resetCheckOutValidation, useCheckOutValidation } from "./validation"

const Checkout = () => {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState("")
  const [scanValue, setScanValue] = useState<string>("")
  const [tabName, setTabName] = React.useState<"code" | "qr">("code")
  const [dateRange, setDateRange] = React.useState<{
    start: Dayjs
    end: Dayjs
  }>({
    start: dayjs(),
    end: dayjs(),
  })
  const [tableDataCheckIn, setTableDataCheckIn] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 8,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })
  const [tableDataCheckOut, setTableDataCheckOut] = useState<TableQueries>({
    pageIndex: 1,
    pageSize: 10,
    query: "",
    sort: {
      order: "",
      key: "",
    },
  })

  const formPorps = useCheckOutValidation()
  const {
    control,
    clearErrors,
    handleSubmit: handleSubmitCheckMemberCode,
  } = formPorps

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

  const {
    data: memberCheckOut,
    isFetchingNextPage: isFetchingMemberCheckOut,
    isLoading: isLoadingMemberCheckOut,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.memberAttendanceLog, tableDataCheckOut],
    initialPageParam: 1,
    queryFn: async () => {
      const res = await apiGetMemberAttendanceLogList({
        page: tableDataCheckOut.pageIndex,
        per_page: tableDataCheckOut.pageSize,
        date: dayjs().startOf("day").format("YYYY-MM-DD"),
        ...(tableDataCheckOut.sort?.key !== ""
          ? {
              sort_column: tableDataCheckOut.sort?.key as string,
              sort_type: tableDataCheckOut.sort?.order as "asc" | "desc",
            }
          : {
              sort_column: "id",
              sort_type: "desc",
            }),
        search: [
          {
            search_column: "date",
            search_condition: ">=",
            search_text: dateRange.start.format("YYYY-MM-DD"),
          },
          {
            search_operator: "and",
            search_column: "date",
            search_condition: "<=",
            search_text: dateRange.end.format("YYYY-MM-DD"),
          },
          ...(tableDataCheckOut.query === ""
            ? [{}]
            : ([
                {
                  search_operator: "and",
                  search_column: "name",
                  search_condition: "like",
                  search_text: tableDataCheckOut.query,
                },
                {
                  search_operator: "or",
                  search_column: "code",
                  search_condition: "like",
                  search_text: tableDataCheckOut.query,
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

  const listDataCheckOut = useMemo(
    () =>
      memberCheckOut
        ? memberCheckOut.pages.flatMap((page) => page.data.data)
        : [],
    [memberCheckOut]
  )
  const totalMemberCheckOut = memberCheckOut?.pages[0]?.data.meta.total ?? 0

  const checkOut = useMutation({
    mutationFn: (data: CheckOutPayload) => apiCheckOut(data),
    onError: (error) => {
      const resError = handleApiError(error)
      setErrorMessage(resError.message as any)
    },
    onSuccess: () => {
      resetCheckOutValidation(formPorps)
      clearErrors()
      setErrorMessage("")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.memberAttendance] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.memberAttendanceLog],
      })
    },
  })

  const handleCheckOut = (code: string) => {
    if (code.length) {
      checkOut.mutate({
        code: code,
        date: dayjs().format("YYYY-MM-DD HH:mm"),
      })
    } else {
      setErrorMessage("Please enter member code")
    }
  }

  const onSubmitCheckOut: SubmitHandler<CheckInFormSchema> = (data) => {
    setErrorMessage("")
    if (data.code.length) {
      handleCheckOut(data.code)
    }
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle>Check-Out</CardTitle>
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
                <div className="pt-2">
                  <TabsContent value="code">
                    <div className="flex flex-col gap-4">
                      <Form {...formPorps}>
                        <form
                          onSubmit={handleSubmitCheckMemberCode(
                            onSubmitCheckOut
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
                        <h6 className="text-foreground w-full">{`Members check-in (${totalMemberCheckIn})`}</h6>
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
                      <ScrollArea className="h-[calc(100vh-31rem)]">
                        <div className="space-y-4 pr-3">
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
                                    {member.name?.charAt(0)?.toUpperCase() ||
                                      "?"}
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
                              <Button
                                type="button"
                                className="h-8 px-2 py-0"
                                onClick={() => {
                                  handleCheckOut(member.code)
                                }}
                              >
                                Check Out
                              </Button>
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
                                handleCheckOut(value)
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

          <Card className="w-full">
            <CardHeader>
              <CardTitle>{`Members Check-out (${totalMemberCheckOut})`}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-21rem)]">
                <div className="space-y-4">
                  {listDataCheckOut.map((member, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center justify-between gap-3 border-b pb-3"
                    >
                      <div className="flex w-full items-center gap-2">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={member?.photo || ""}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex w-full items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <div className="text-foreground font-medium">
                              {member.name}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {member.code}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-muted-foreground text-sm">
                              {member.attendance_packages
                                .map((item) => item.name)
                                .join(", ")}
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {member.date
                                ? dayjs(member.date).format(
                                    "DD MMMM YYYY HH:mm"
                                  )
                                : "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isFetchingMemberCheckOut || isLoadingMemberCheckOut
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
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default Checkout
