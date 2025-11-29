import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGetMember } from "@/services/api/MembeService"
import dayjs from "dayjs"
import {
  Calendar2,
  CalendarTick,
  Cards,
  Copy,
  HomeHashtag,
  MessageText1,
  NoteFavorite,
  ScanBarcode,
  TagUser,
  TickSquare,
  Whatsapp,
} from "iconsax-reactjs"
import isEmpty from "lodash/isEmpty"
import { Pencil } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import useCopyToClipboard from "@/utils/hooks/useCopyToClipboard"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Loading from "@/components/ui/loading"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import FreezProgram from "./FreezProgram"
import InformasiDetail from "./InformasiDetail"
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
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { copy } = useCopyToClipboard()

  const {
    data: member,
    isLoading: isLoadingMember,
    error: errorMember,
  } = useQuery({
    queryKey: [QUERY_KEY.members, id],
    queryFn: () => apiGetMember(id as string),
    select: (res) => res.data,
    enabled: !!id,
  })

  //   const {
  //     data: memberHead,
  //     isLoading: isLoadingmemberHead,
  //     error: errormemberHead,
  //   } = useQuery({
  //     queryKey: [QUERY_KEY.memberHead, id],
  //     queryFn: () => apiGetmemberHead(id as string, '2025-04-01', '2025-04-30'),
  //     select: (res: { data: memberHeadType }) => res.data,
  //     enabled: !!id,
  //   })

  return (
    <Loading loading={isLoadingMember}>
      {!isEmpty(member) && !errorMember && (
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-7">
          <aside className="col-span-1 flex flex-col gap-4 lg:sticky lg:top-20 lg:col-span-2 lg:self-start">
            <div className="relative flex w-full flex-col items-center justify-center">
              <div className="outline-muted relative z-10 size-16 rounded-full outline-4">
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
              <div className="bg-sidebar-inset relative -mt-11 flex w-full items-center justify-center rounded-2xl p-4 pt-14">
                <div className="absolute top-3 right-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-primary-foreground/10 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground size-8"
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
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <span className="text-sidebar-inset-text text-center text-lg leading-none font-medium">
                    {member?.name}
                  </span>
                  <Badge className={statusColor[member.membeship_status]}>
                    {member.membeship_status}
                  </Badge>
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

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(member?.code || "")
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
                        {member?.phone || "-"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(member?.phone || "")
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
                        {member?.email || "-"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        copy(member?.email || "")
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
                  <div className="text-foreground text-lg font-medium">0</div>
                  <div className="text-muted-foreground text-xs">
                    Total sesi digunakan
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">0</div>
                  <div className="text-muted-foreground text-xs">
                    Sisa sesi bulan ini
                  </div>
                </div>
                <Separator className="sm:hidden" />
                <Separator
                  orientation="vertical"
                  className="hidden h-12 sm:block"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="text-foreground text-lg font-medium">0</div>
                  <div className="text-muted-foreground text-xs">
                    Total langganan aktif
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
                      <TabsTrigger value="tab2">Paket member</TabsTrigger>
                      <TabsTrigger value="tab3">Pengukuran</TabsTrigger>
                      <TabsTrigger value="tab4">Freeze</TabsTrigger>
                      <TabsTrigger value="tab5">Loyalty Point</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="tab1">
                    <InformasiDetail member={member} />
                  </TabsContent>
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
