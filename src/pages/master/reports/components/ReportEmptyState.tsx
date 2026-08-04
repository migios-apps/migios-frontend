import { cn } from "@/lib/utils"

interface ReportEmptyStateProps {
  message?: string
  className?: string
}

const ReportEmptyState = ({
  message = "Tidak ada data",
  className,
}: ReportEmptyStateProps) => (
  <div
    className={cn(
      "bg-muted flex h-64 items-center justify-center rounded-lg",
      className
    )}
  >
    <div className="text-muted-foreground flex flex-col items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  </div>
)

export default ReportEmptyState
