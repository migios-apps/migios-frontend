import React from "react"
import { ClassDetail } from "@/services/api/@types/class"
import {
  Calendar2,
  Chart21,
  Eye,
  Layer,
  People,
  Profile2User,
  TagUser,
  Timer1,
  ToggleOffCircle,
} from "iconsax-reactjs"
import { Edit2, Flame } from "lucide-react"
import { dayjs } from "@/utils/dayjs"
import { statusColor } from "@/constants/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet"
import {
  AvailableForOptions,
  ClassTypeOptions,
  LevelClassOptions,
  VisibleForOptions,
  WeekdayOptions,
} from "@/components/form/class/validation"

interface DialogClassDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ClassDetail | null
  onEdit?: () => void
}

const DialogClassDetail: React.FC<DialogClassDetailProps> = ({
  open,
  onOpenChange,
  item,
  onEdit,
}) => {
  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent floating className="gap-0 sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-lg">{item.name}</SheetTitle>
            <Badge
              className={statusColor[item.is_publish ? "active" : "inactive"]}
            >
              <span className="capitalize">
                {item.is_publish ? "Terjadwal" : "Draf"}
              </span>
            </Badge>
          </div>
          <SheetDescription />
        </SheetHeader>

        <div className="flex-1 overflow-hidden px-2 pr-1">
          <ScrollArea className="h-full px-2 pr-3">
            <div className="space-y-6 px-1 pb-4">
              {/* Informasi Dasar */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold">Informasi Dasar</h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Kapasitas */}
                  <div className="flex items-center gap-3">
                    <People
                      color="#3b82f6"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Kapasitas
                      </div>
                      <div className="text-sm font-medium">{item.capacity}</div>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="flex items-center gap-3">
                    <Chart21
                      color="#f59e0b"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Tingkat
                      </div>
                      <div className="text-sm font-medium">
                        {LevelClassOptions.find(
                          (cls) => cls.value === item.level
                        )?.label || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Kategori */}
                  <div className="flex items-center gap-3">
                    <Layer
                      color="#8b5cf6"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Kategori
                      </div>
                      <div className="text-sm font-medium">
                        {item.category?.name || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Kalori */}
                  <div className="flex items-center gap-3">
                    <Flame size={16} color="#ef4444" className="shrink-0" />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Kalori
                      </div>
                      <div className="text-sm font-medium">
                        {item.burn_calories || "-"} Cal
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Waktu & Durasi */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold">Waktu & Durasi</h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Periode */}
                  <div className="flex items-center gap-3">
                    <Calendar2
                      color="#10b981"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Periode
                      </div>
                      <div className="text-sm font-medium">
                        {dayjs(item.start_date).format("DD MMM YYYY")} -{" "}
                        {item.is_forever
                          ? "Tidak Berakhir"
                          : item.end_date
                            ? dayjs(item.end_date).format("DD MMM YYYY")
                            : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Durasi */}
                  <div className="flex items-center gap-3">
                    <Timer1
                      color="#06b6d4"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Durasi
                      </div>
                      <div className="text-sm font-medium">
                        {item.duration_time} {item.duration_time_type}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Pengaturan Kelas */}
              <div className="space-y-4">
                <h5 className="text-lg font-semibold">Pengaturan Kelas</h5>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Instruktur */}
                  <div className="flex items-center gap-3">
                    <Profile2User
                      color="#6366f1"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Instruktur
                      </div>
                      <div className="flex items-center">
                        {item.allow_all_instructor ? (
                          <Badge className={statusColor["active"]}>
                            <span className="capitalize">All Instructor</span>
                          </Badge>
                        ) : (
                          <div className="flex items-center -space-x-2 pt-1">
                            {item.instructors
                              ?.slice(0, 3)
                              .map((instructor, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="border-background size-7 cursor-pointer border-2">
                                      <AvatarImage
                                        src={instructor.photo || ""}
                                        alt={instructor.name || ""}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {instructor.name
                                          ?.charAt(0)
                                          ?.toUpperCase() || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{instructor.name || "Unknown"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            {(item.instructors?.length || 0) > 3 && (
                              <Avatar className="bg-muted border-background size-7 border-2">
                                <AvatarFallback className="text-xs">
                                  +{(item.instructors?.length || 0) - 3}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tipe Kelas */}
                  <div className="flex items-center gap-3">
                    <ToggleOffCircle
                      color="#ec4899"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Tipe Kelas
                      </div>
                      <div className="text-sm font-medium">
                        {ClassTypeOptions.find(
                          (opt) => opt.value === item.class_type
                        )?.label || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Tersedia Untuk */}
                  <div className="flex items-center gap-3">
                    <TagUser
                      color="#14b8a6"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Tersedia untuk
                      </div>
                      <div className="text-sm font-medium">
                        {AvailableForOptions.find(
                          (opt) => opt.value === item.available_for
                        )?.label || "-"}
                      </div>
                    </div>
                  </div>

                  {/* Terlihat Untuk */}
                  <div className="flex items-center gap-3">
                    <Eye
                      color="#64748b"
                      size={16}
                      variant="Bulk"
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-xs">
                        Terlihat untuk
                      </div>
                      <div className="text-sm font-medium">
                        {VisibleForOptions.find(
                          (opt) => opt.value === item.visible_for
                        )?.label || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jadwal */}
              {item.weekdays_available.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-lg font-semibold">Hari Tersedia</h5>
                    <div className="flex flex-wrap gap-2">
                      {item.weekdays_available.map((weekday, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex flex-col items-start gap-1 rounded-md px-3 py-1.5"
                          style={{
                            backgroundColor: item.background_color || "",
                            color: item.color || "",
                            borderColor: item.color || "",
                          }}
                        >
                          <span className="text-xs font-semibold capitalize">
                            {WeekdayOptions.find(
                              (opt) => opt.value === weekday.day
                            )?.label || "-"}
                          </span>
                          <span className="text-xs">
                            {item.start_time}
                            {item.end_time ? ` - ${item.end_time}` : ""}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Deskripsi */}
              {item.description && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h5 className="text-lg font-semibold">Deskripsi</h5>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="px-4 py-2">
          <div className="flex w-full items-center justify-end gap-2">
            <div></div>
            {onEdit && (
              <Button onClick={onEdit}>
                <Edit2 className="mr-2 size-4" />
                Edit Kelas
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DialogClassDetail
