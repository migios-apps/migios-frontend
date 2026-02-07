import { useQuery } from "@tanstack/react-query"
import {
  apiGetMember,
  apiGetMemberDetailHead,
} from "@/services/api/MembeService"
import {
  Calendar2,
  CalendarTick,
  Cards,
  HomeHashtag,
  MessageText1,
  NoteFavorite,
  ScanBarcode,
  TagUser,
  Whatsapp,
} from "iconsax-reactjs"
import isEmpty from "lodash/isEmpty"
import { Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import CopyButton from "@/components/ui/copy-button"
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
import { useMember } from "../store/useMember"
import HistoryAttandance from "./Attandance"
import FreezProgram from "./FreezProgram"
import LoyaltyPoint from "./LoyaltyPoint"
import Mesurement from "./Mesurement"
import Package from "./Package"

// import Activity from './Activity'
// import InformasiDetail from './InformasiDetail'
// import Members from './Members'
// import PtPrograms from './PtPrograms'

const MemberDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setMember } = useMember()

  const {
    data: member,
    isLoading: isLoadingMember,
    error: errorMember,
  } = useQuery({
    queryKey: [QUERY_KEY.members, id],
    queryFn: async () => {
      const res = await apiGetMember(id as string)
      setMember(res.data)
      return res
    },
    select: (res) => res.data,
    enabled: !!id,
  })

  const { data: memberHead } = useQuery({
    queryKey: [QUERY_KEY.memberHead, QUERY_KEY.memberDetail, id],
    queryFn: () => apiGetMemberDetailHead(id as string),
    select: (res) => res.data,
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  return (
    <Loading loading={isLoadingMember}>
      {!isEmpty(member) && !errorMember && (
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-7">
          <aside className="col-span-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-2 lg:self-start">
            <div className="relative flex w-full flex-col items-center justify-center">
              <div className="bg-accent relative flex w-full items-center rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="outline-muted relative size-16 rounded-full outline-4">
                    <Avatar className="size-16">
                      <AvatarImage
                        src={member?.photo || "https://placehold.co/64x64"}
                        alt={member?.name || ""}
                      />
                      <AvatarFallback>
                        {member?.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-lg leading-none font-medium">
                      {member?.name}
                    </span>
                    <span className="text-muted-foreground text-sm leading-none">
                      {member?.code}
                    </span>
                    <Badge
                      className={cn(
                        "mt-2",
                        statusColor[member.membeship_status]
                      )}
                    >
                      {member.membeship_status}
                    </Badge>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-background text-muted-foreground hover:bg-background/80 hover:text-foreground size-8"
                          onClick={() =>
                            navigate(`/members/edit/${member?.code}`)
                          }
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit member</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit member</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <Card className="bg-accent py-0 shadow-none">
              <CardContent className="flex items-center justify-between gap-2 p-2">
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {member?.total_active_membership || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Membership
                  </div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {member?.total_active_ptprogram || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    PT Program
                  </div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="flex flex-1 flex-col items-center gap-1">
                  <div className="text-foreground text-lg font-medium">
                    {member?.total_active_class || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">Class</div>
                </div>
              </CardContent>
            </Card>

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
                        Kode member
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {member?.code}
                      </span>
                    </div>

                    <CopyButton value={member?.code || ""} label="Copy code" />
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
                        {member?.phone || "-"}
                      </span>
                    </div>

                    <CopyButton
                      value={member?.phone || ""}
                      label="Copy phone"
                    />
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
                        {member?.email || "-"}
                      </span>
                    </div>

                    <CopyButton
                      value={member?.email || ""}
                      label="Copy email"
                    />
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
                      {member?.gender
                        ? member.gender === "m"
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
                      {member?.birth_date
                        ? dayjs(member?.birth_date).format("DD MMM YYYY")
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
                      {member?.join_date
                        ? dayjs(member?.join_date).format("DD MMM YYYY")
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
                      {member?.address || "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 py-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <Cards size="20" color="currentColor" variant="Outline" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">
                      {member.identity_type ?? "Identity Type"}
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {member.identity_number ?? "-"}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex w-full items-center gap-3 pt-3">
                  <div className="text-muted-foreground flex size-8 items-center justify-center">
                    <NoteFavorite
                      size="20"
                      color="currentColor"
                      variant="Outline"
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-xs">Goals</span>
                    <span className="text-foreground text-sm font-medium">
                      {member.goals ?? "-"}
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
                  <div className="text-foreground flex items-baseline gap-0.5 leading-none font-medium">
                    {memberHead?.total_session_usage &&
                    memberHead.total_session_usage > 0 ? (
                      <>
                        <span className="text-2xl">
                          {memberHead.total_active_session -
                            memberHead.total_session_usage}
                        </span>
                        <span className="text-muted-foreground text-sm font-normal">
                          /{memberHead.total_active_session}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl">
                        {memberHead?.total_active_session || 0}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Sesi PT Program
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-2xl leading-none font-medium">
                    {memberHead?.total_active_package || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total paket aktif
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-2xl leading-none font-medium">
                    {memberHead?.total_active_class || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Total Kelas aktif
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-2xl leading-none font-medium">
                    {memberHead?.total_balance_loyalty_point || 0}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Loyalty Point
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3 shadow-none">
              <CardContent className="p-0">
                <Tabs defaultValue="tab2">
                  <div className="overflow-x-auto">
                    <TabsList className="min-w-fit justify-start sm:w-fit">
                      {/* <TabsTrigger value="tab1">Informasi detail</TabsTrigger> */}
                      <TabsTrigger value="tab2">Paket member</TabsTrigger>
                      <TabsTrigger value="tab3">Pengukuran</TabsTrigger>
                      <TabsTrigger value="tab4">Freeze</TabsTrigger>
                      <TabsTrigger value="tab5">Loyalty Point</TabsTrigger>
                      <TabsTrigger value="tab6">Riwayat Absensi</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContents>
                    {/* <TabsContent value="tab1">
                      <InformasiDetail member={member} />
                    </TabsContent> */}
                    <TabsContent value="tab2">
                      <Package member={member} />
                    </TabsContent>
                    <TabsContent value="tab3">
                      <Mesurement member={member} />
                    </TabsContent>
                    <TabsContent value="tab4">
                      <FreezProgram data={member} />
                    </TabsContent>
                    <TabsContent value="tab5">
                      <LoyaltyPoint member={member} />
                    </TabsContent>
                    <TabsContent value="tab6">
                      <HistoryAttandance member={member} />
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

export default MemberDetail
