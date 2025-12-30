import { useState } from "react"
import { TrainerDetail, TrainerMember } from "@/services/api/@types/trainer"
import {
  Profile2User,
  Calendar2,
  Call,
  Sms,
  Clock,
  TaskSquare,
  Man,
  Woman,
} from "iconsax-reactjs"
import { User, BookOpen, ArrowRightLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { dayjs } from "@/utils/dayjs"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/animate-ui/components/radix/sheet"
import TransferMemberDialog from "./TransferMemberDialog"

interface MemberDetailSheetProps {
  member: TrainerMember | null
  trainer: TrainerDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MemberDetailSheet = ({
  member,
  trainer,
  open,
  onOpenChange,
}: MemberDetailSheetProps) => {
  const [activeTab, setActiveTab] = useState("packages")
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)

  if (!member) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          floating
          className="flex flex-col gap-0 sm:max-w-md"
        >
          <SheetHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <SheetTitle className="text-base font-semibold tracking-tight">
                  Detail Member
                </SheetTitle>
              </div>
            </div>
            <SheetDescription className="hidden" />
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 p-4 pt-1">
                {/* Single Card Integrated Profile */}
                <div className="flex flex-col items-center">
                  {/* Trainer Section (Inside Card) - Vertical Layout */}
                  {trainer && (
                    <div className="flex w-full flex-col items-center pt-2">
                      <Avatar className="h-10 w-10 border shadow-xs">
                        <AvatarImage src={trainer.photo || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
                          {trainer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-2 flex flex-col items-center text-center">
                        <p className="mb-1 text-sm leading-none font-semibold tracking-tight">
                          {trainer.name}
                        </p>
                        <span className="text-muted-foreground text-xs">
                          {trainer.code}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20 mt-1 h-4 border-none text-[10px] font-semibold shadow-none"
                        >
                          Trainer
                        </Badge>
                      </div>

                      {/* Precise Connecting Line */}
                      <div className="mt-1 flex h-8 w-0.5 flex-col items-center">
                        <div className="border-primary h-full w-full border-l-2 border-dashed opacity-40" />
                      </div>
                    </div>
                  )}

                  {/* Member Section (Inside Card) */}
                  <div
                    className={cn(
                      "flex w-full flex-col items-center",
                      trainer ? "pt-1" : "pt-4"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-16 w-16 border shadow-md">
                        <AvatarImage src={member.photo || ""} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        className={cn(
                          "border-background absolute -bottom-1 left-1/2 z-30 h-3.5 -translate-x-1/2 border-2 px-1.5 text-[9px] font-semibold whitespace-nowrap shadow-sm transition-all",
                          statusColor[member.membership_status]
                        )}
                      >
                        {member.membership_status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-col items-center text-center">
                      <h2 className="text-base font-semibold tracking-tight">
                        {member.name}
                      </h2>
                      <div className="text-muted-foreground text-xs">
                        {member.code}
                      </div>
                    </div>

                    {/* Precise Info Grid - Refactored with Cards */}
                    {/* Precise Info Grid - Optimized Layout */}
                    <div className="mt-6 flex w-full flex-col gap-2">
                      <div className="grid w-full grid-cols-2 gap-2">
                        <Card className="flex flex-col items-center justify-center gap-1 rounded-xl border p-2 py-2.5 shadow-none">
                          <div className="rounded-md bg-blue-500/10 p-1 text-blue-600">
                            <Call className="h-3 w-3" variant="Bulk" />
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground text-[10px]">
                              Telepon
                            </p>
                            <p className="text-xs font-semibold">
                              {member.phone || "-"}
                            </p>
                          </div>
                        </Card>
                        <Card className="flex flex-col items-center justify-center gap-1 rounded-xl border p-2 py-2.5 shadow-none">
                          <div className="rounded-md bg-purple-500/10 p-1 text-purple-600">
                            {member.gender?.toLowerCase() === "male" ? (
                              <Man className="h-3 w-3" variant="Bulk" />
                            ) : (
                              <Woman className="h-3 w-3" variant="Bulk" />
                            )}
                          </div>
                          <div className="text-center">
                            <p className="text-muted-foreground text-[10px]">
                              Gender
                            </p>
                            <p className="text-xs font-semibold">
                              {!member?.gender
                                ? "-"
                                : member.gender === "m"
                                  ? "Laki-laki"
                                  : "Perempuan"}
                            </p>
                          </div>
                        </Card>
                      </div>
                      <Card className="flex flex-col items-center justify-center gap-1 rounded-xl border p-2 py-2.5 shadow-none">
                        <div className="rounded-md bg-green-500/10 p-1 text-green-600">
                          <Sms className="h-3 w-3" variant="Bulk" />
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-[10px]">
                            Email
                          </p>
                          <p className="text-xs font-semibold">
                            {member.email || "-"}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Tabs Section - Simplified Styling */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mt-2 w-full"
                >
                  <TabsList className="h-auto w-full justify-start gap-1">
                    <TabsTrigger value="packages">
                      <TaskSquare className="h-3 w-3" variant="Bulk" />
                      Paket Aktif
                    </TabsTrigger>
                    <TabsTrigger value="history">
                      <Clock className="h-3 w-3" variant="Bulk" />
                      Timeline Sesi
                    </TabsTrigger>
                  </TabsList>

                  <TabsContents>
                    <TabsContent value="packages" className="space-y-2 pt-1">
                      {member.packages && member.packages.length > 0 ? (
                        member.packages.map((pkg) => (
                          <Card
                            key={pkg.id}
                            className="bg-card relative overflow-hidden border p-0 shadow-none"
                          >
                            <CardContent className="p-3">
                              <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="bg-muted text-foreground rounded-lg p-2">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="mb-0.5 text-xs leading-none font-bold">
                                      {pkg.package_name}
                                    </span>
                                    {/* <span className="text-muted-foreground text-xs">
                                      PT Program
                                    </span> */}
                                  </div>
                                </div>
                              </div>

                              <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-2 text-xs">
                                <div className="flex flex-col gap-0.5">
                                  <p className="text-muted-foreground">
                                    Berakhir
                                  </p>
                                  <div className="flex items-center gap-1 font-semibold">
                                    <Calendar2 className="h-2.5 w-2.5" />
                                    {dayjs(pkg.end_date).format("DD MMM YYYY")}
                                  </div>
                                </div>
                                <div className="bg-background min-w-[50px] rounded-md border px-2 py-1 text-center">
                                  <p className="text-xs leading-none font-semibold">
                                    {pkg.total_available_session}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    Sesi
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed py-10 opacity-50">
                          <Profile2User
                            size={32}
                            variant="Bulk"
                            className="text-muted-foreground"
                          />
                          <p className="text-muted-foreground mt-2 text-xs font-semibold">
                            Tidak ada paket aktif
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-0 pt-3">
                      <div className="relative space-y-0 pl-1">
                        <div className="bg-border absolute top-1.5 left-[5.5px] h-[calc(100%-12px)] w-px" />

                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="group relative flex items-start gap-3 pb-4 last:pb-1"
                          >
                            <div className="border-background bg-primary relative z-10 flex h-3 w-3 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110">
                              <div className="h-1 w-1 rounded-full bg-white" />
                            </div>

                            <div className="bg-muted/50 hover:bg-muted flex-1 rounded-lg p-2.5 shadow-none transition-all">
                              <div className="mb-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Calendar2 className="h-2.5 w-2.5" />
                                  <p className="text-xs font-semibold tracking-wide">
                                    {30 - i} Des 2023 • 14:30
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="h-3.5 px-1 text-xs font-semibold"
                                >
                                  Sesi #{i}
                                </Badge>
                              </div>
                              <p className="text-sm leading-tight font-semibold">
                                Latihan Personal bersama {trainer?.name}
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
                                Sesi fokus pada penguatan power and
                                conditioning.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-center">
                        <div className="bg-border h-px flex-1" />
                        <p className="text-muted-foreground px-3 text-xs font-semibold">
                          Timeline Riwayat
                        </p>
                        <div className="bg-border h-px flex-1" />
                      </div>
                    </TabsContent>
                  </TabsContents>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
          <SheetFooter className="px-4 py-2">
            <div className="flex items-center justify-between">
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={() => setIsTransferDialogOpen(true)}
              >
                <ArrowRightLeft className="h-3 w-3" />
                Ganti Trainer
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <TransferMemberDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        member={member}
        trainer={trainer}
        onSuccess={() => onOpenChange(false)}
      />
    </>
  )
}

export default MemberDetailSheet
