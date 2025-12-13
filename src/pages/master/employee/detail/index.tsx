import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  EmployeeDetailPage,
  EmployeeHeadType,
} from "@/services/api/@types/employee"
import {
  apiGetEmployeeDetailPage,
  apiGetEmployeeHead,
} from "@/services/api/EmployeeService"
import dayjs from "dayjs"
import {
  Calendar2,
  CalendarTick,
  Copy,
  Edit2,
  HomeHashtag,
  MessageText1,
  Notepad2,
  ScanBarcode,
  SecurityUser,
  TagUser,
  TickSquare,
  Whatsapp,
} from "iconsax-reactjs"
import isEmpty from "lodash/isEmpty"
import { useNavigate, useParams } from "react-router-dom"
import useCopyToClipboard from "@/utils/hooks/useCopyToClipboard"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Loading from "@/components/ui/loading"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs"
import InformasiDetail from "./InformasiDetail"
import Members from "./Members"
import PtPrograms from "./PtPrograms"

const EmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { copy } = useCopyToClipboard()

  const {
    data: employee,
    isLoading: isLoadingEmployee,
    error: errorEmployee,
  } = useQuery({
    queryKey: [QUERY_KEY.employeeDetail, id],
    queryFn: () => apiGetEmployeeDetailPage(id as string),
    select: (res: { data: EmployeeDetailPage }) => res.data,
    enabled: !!id,
  })

  const { data: employeeHead, isLoading: isLoadingEmployeeHead } = useQuery({
    queryKey: [QUERY_KEY.employeeHead, id],
    queryFn: () =>
      apiGetEmployeeHead(
        id as string,
        dayjs().startOf("month").format("YYYY-MM-DD"),
        dayjs().endOf("month").format("YYYY-MM-DD")
      ),
    select: (res: { data: EmployeeHeadType }) => res.data,
    enabled: !!id,
  })

  const isTrainer = employee?.roles?.some((role) => role.name === "trainer")

  return (
    <Loading loading={isLoadingEmployee || isLoadingEmployeeHead}>
      {!isEmpty(employee) && !errorEmployee && (
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-7">
          <aside className="col-span-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-2 lg:self-start">
            <div className="relative flex w-full flex-col items-center justify-center">
              <div className="outline-muted relative z-10 size-16 rounded-full outline-4">
                <Avatar className="size-16">
                  <AvatarImage
                    src={employee?.photo || "https://placehold.co/64x64"}
                    alt={employee?.name || ""}
                  />
                  <AvatarFallback>
                    {employee?.name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="bg-sidebar-inset relative -mt-11 flex w-full items-center justify-center rounded-2xl p-4 pt-14">
                <div className="absolute top-3 right-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground size-8"
                          onClick={() => navigate(`/employee/edit/${id}`)}
                        >
                          <Edit2 className="size-4" />
                          <span className="sr-only">Edit employee</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit employee</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <span className="text-sidebar-inset-text text-center text-lg leading-none font-medium">
                    {employee?.name}
                  </span>
                  <span className="text-primary-foreground/80 text-center text-sm leading-none capitalize">
                    {employee?.roles?.map((role) => role.name).join(", ") ||
                      "-"}
                  </span>
                </div>
              </div>
            </div>

            {isTrainer && (
              <Card className="bg-accent py-0 shadow-none">
                <CardContent className="flex items-center justify-between gap-2 p-2">
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-foreground text-lg font-medium">
                      {employee?.total_members || 0}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Membership
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-foreground text-lg font-medium">
                      {employee?.total_pt_program || 0}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      PT Program
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-foreground text-lg font-medium">
                      {employee?.total_class || 0}
                    </div>
                    <div className="text-muted-foreground text-xs">Class</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="py-0 shadow-none">
              <CardContent className="p-4">
                <div className="flex w-full items-center gap-3 pb-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <ScanBarcode
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground text-xs">
                        Kode pegawai
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {employee?.code}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(employee?.code || "")
                        setCopiedField("code")
                        setTimeout(() => setCopiedField(null), 2000)
                      }}
                    >
                      {copiedField === "code" ? (
                        <TickSquare
                          size="16"
                          color="hsl(var(--primary))"
                          variant="Bold"
                        />
                      ) : (
                        <Copy
                          size="16"
                          color="currentColor"
                          variant="Outline"
                        />
                      )}
                      <span className="sr-only">Copy code</span>
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <Whatsapp
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground text-xs">
                        No. Hp
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {employee?.phone || "-"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(employee?.phone || "")
                        setCopiedField("phone")
                        setTimeout(() => setCopiedField(null), 2000)
                      }}
                    >
                      {copiedField === "phone" ? (
                        <TickSquare
                          size="16"
                          color="hsl(var(--primary))"
                          variant="Bold"
                        />
                      ) : (
                        <Copy
                          size="16"
                          color="currentColor"
                          variant="Outline"
                        />
                      )}
                      <span className="sr-only">Copy phone</span>
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 pt-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <MessageText1
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground text-xs">
                        Email
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {employee?.email || "-"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(employee?.email || "")
                        setCopiedField("email")
                        setTimeout(() => setCopiedField(null), 2000)
                      }}
                    >
                      {copiedField === "email" ? (
                        <TickSquare
                          size="16"
                          color="hsl(var(--primary))"
                          variant="Bold"
                        />
                      ) : (
                        <Copy
                          size="16"
                          color="currentColor"
                          variant="Outline"
                        />
                      )}
                      <span className="sr-only">Copy email</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="py-0 shadow-none">
              <CardContent className="p-4">
                <div className="flex w-full items-center gap-3 pb-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <TagUser size="20" color="currentColor" variant="Outline" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      Jenis kelamin
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {employee?.gender
                        ? employee.gender === "m"
                          ? "Laki-laki"
                          : "Perempuan"
                        : "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <Calendar2
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      Tanggal lahir
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {employee?.birth_date
                        ? dayjs(employee?.birth_date).format("DD MMM YYYY")
                        : "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <CalendarTick
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      Tanggal bergabung
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {employee?.join_date
                        ? dayjs(employee?.join_date).format("DD MMM YYYY")
                        : "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <HomeHashtag
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      Alamat
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {employee?.address || "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <Notepad2
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      Spesialis
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {employee?.specialist || "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 pt-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <SecurityUser
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">Role</span>
                    <span className="text-foreground text-sm font-medium">
                      {employee.roles
                        ?.map((role) => role.display_name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
          <div
            data-slot="main-content"
            className="col-span-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-5 lg:self-start"
          >
            <Card className="bg-accent py-0 shadow-none">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {employeeHead?.total_sales || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total penjualan bulan ini
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {employeeHead?.total_session || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total sesi bulan ini
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {employeeHead?.total_class || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total class bulan ini
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {employeeHead?.ftotal_commission_amount || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Komisi didapatkan bulan ini
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3 shadow-none">
              <CardContent className="p-0">
                <Tabs defaultValue="tab1">
                  <div className="overflow-x-auto">
                    <TabsList className="min-w-fit justify-start sm:w-fit">
                      <TabsTrigger value="tab1">Informasi detail</TabsTrigger>
                      {isTrainer && (
                        <>
                          <TabsTrigger value="tab2">Daftar Member</TabsTrigger>
                          <TabsTrigger value="tab3">Daftar Program</TabsTrigger>
                        </>
                      )}
                    </TabsList>
                  </div>
                  <TabsContents className="py-6">
                    <TabsContent value="tab1">
                      <InformasiDetail employee={employee} />
                    </TabsContent>
                    <TabsContent value="tab2">
                      {isTrainer ? <Members data={employee} /> : null}
                    </TabsContent>
                    <TabsContent value="tab3">
                      {isTrainer ? <PtPrograms data={employee} /> : null}
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </Loading>
  )
}

export default EmployeeDetail
