import { useQuery } from "@tanstack/react-query"
import { apiGetReportHead } from "@/services/api/analytic"
import { People, Profile2User, UserMinus, Weight } from "iconsax-reactjs"
import { useSessionUser } from "@/stores/auth-store"
import { QUERY_KEY } from "@/constants/queryKeys.constant"
import { Skeleton } from "@/components/ui/skeleton"
import WelcomeUser from "@/components/WelcomeUser"
import AttendanceToday from "./components/AttendanceToday"
import CardOverview from "./components/CardOverview"
import NewMember from "./components/NewMember"
import Overview from "./components/Overview"
import UpcomingSchedule from "./components/UpcomingSchedule"

const Dashboard = () => {
  const club = useSessionUser((state) => state.club)
  const {
    data: head,
    isLoading,
    // error,
  } = useQuery({
    queryKey: [QUERY_KEY.reportHead],
    queryFn: () => apiGetReportHead(),
    select: (res) => res.data,
    enabled: !!club.id,
  })

  return (
    <>
      <div className="flex max-w-full flex-col gap-4 overflow-x-hidden">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="flex flex-1 flex-col gap-4 xl:col-span-3">
            {isLoading ? (
              <div className="bg-card rounded-xl border p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-20" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CardOverview
                data={[
                  {
                    name: "Program Membership",
                    value: head?.total_member_in_membership || 0,
                    className:
                      "bg-gradient-to-t from-blue-100 to-blue-50 [&_.text-primary]:text-blue-600 dark:from-blue-950/40 dark:to-transparent dark:[&_.text-primary]:text-blue-400",
                    description:
                      "Total member yang mengikuti program membership",
                    icon: (
                      <Profile2User
                        size="24"
                        color="currentColor"
                        variant="Bulk"
                      />
                    ),
                  },
                  {
                    name: "PT Program",
                    value: head?.total_member_in_pt || 0,
                    className:
                      "bg-gradient-to-t from-amber-100 to-amber-50 [&_.text-primary]:text-amber-600 dark:from-amber-950/40 dark:to-transparent dark:[&_.text-primary]:text-amber-400",
                    description: "Total member yang mengikuti program PT",
                    icon: (
                      <Weight size="24" color="currentColor" variant="Bulk" />
                    ),
                  },
                  {
                    name: "Program Kelas",
                    value: head?.total_member_in_class || 0,
                    className:
                      "bg-gradient-to-t from-purple-100 to-purple-50 [&_.text-primary]:text-purple-600 dark:from-purple-950/40 dark:to-transparent dark:[&_.text-primary]:text-purple-400",
                    description: "Total member yang mengikuti program kelas",
                    icon: (
                      <People size="24" color="currentColor" variant="Bulk" />
                    ),
                  },
                ]}
              />
            )}
            <Overview />
            <AttendanceToday />
          </div>
          <div className="flex flex-col gap-4 2xl:min-w-[360px]">
            <NewMember />
            {isLoading ? (
              <div className="bg-card rounded-xl border p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 flex-col gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-10 w-20" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CardOverview
                className="grid-cols-1!"
                data={[
                  {
                    name: "Aktif Member",
                    value: head?.total_active_membership || 0,
                    className:
                      "bg-gradient-to-t from-emerald-100 to-emerald-50 [&_.text-primary]:text-emerald-600 dark:from-emerald-950/40 dark:to-transparent dark:[&_.text-primary]:text-emerald-400",
                    icon: (
                      <Profile2User
                        size="24"
                        color="currentColor"
                        variant="Bold"
                      />
                    ),
                  },
                  {
                    name: "Non Aktif Member",
                    value: head?.total_inactive_membership || 0,
                    className:
                      "bg-gradient-to-t from-rose-100 to-rose-50 [&_.text-primary]:text-rose-600 dark:from-rose-950/40 dark:to-transparent dark:[&_.text-primary]:text-rose-400",
                    icon: (
                      <Profile2User
                        size="24"
                        color="currentColor"
                        variant="Broken"
                      />
                    ),
                  },
                  {
                    name: "Freeze Member",
                    value: head?.total_freeze_members || 0,
                    className:
                      "bg-gradient-to-t from-cyan-100 to-cyan-50 [&_.text-primary]:text-cyan-600 dark:from-cyan-950/40 dark:to-transparent dark:[&_.text-primary]:text-cyan-400",
                    icon: (
                      <UserMinus
                        size="24"
                        color="currentColor"
                        variant="Broken"
                      />
                    ),
                  },
                ]}
              />
            )}
            <UpcomingSchedule />
          </div>
        </div>
      </div>
      <WelcomeUser />
    </>
  )
}

export default Dashboard
