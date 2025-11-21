import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export interface FullPaginationProps {
  currentPage?: number
  displayTotal?: boolean
  onChange?: (pageNumber: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSize?: number
  pageSizeOptions?: number[]
  total?: number
  className?: string
  children?: React.ReactNode
}

export function FullPagination({
  currentPage = 1,
  displayTotal = false,
  onChange,
  onPageSizeChange,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  total = 0,
  className,
}: FullPaginationProps) {
  const totalPages = Math.ceil(total / pageSize) || 0

  if (totalPages === 0 || !Number.isFinite(totalPages)) {
    return null
  }

  const pages: (number | "ellipsis")[] = []
  const mobilePages: (number | "ellipsis")[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "ellipsis", totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      )
    } else {
      pages.push(
        1,
        "ellipsis",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis",
        totalPages
      )
    }
  }

  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      mobilePages.push(i)
    }
  } else {
    if (currentPage === 1) {
      mobilePages.push(1, 2, "ellipsis", totalPages)
    } else if (currentPage === totalPages) {
      mobilePages.push(1, "ellipsis", totalPages - 1, totalPages)
    } else if (currentPage === 2) {
      mobilePages.push(1, 2, 3, "ellipsis", totalPages)
    } else if (currentPage === totalPages - 1) {
      mobilePages.push(
        1,
        "ellipsis",
        totalPages - 2,
        totalPages - 1,
        totalPages
      )
    } else {
      mobilePages.push(1, "ellipsis", currentPage, "ellipsis", totalPages)
    }
  }

  const handlePaginationChange = (page: number) => {
    if (Number.isFinite(page) && onChange) {
      onChange(page)
    }
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 px-0 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            if (onPageSizeChange) {
              onPageSizeChange(Number(value))
            }
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {displayTotal && (
          <div className="text-muted-foreground text-sm">
            <span className="inline">
              {Math.min((currentPage - 1) * pageSize + 1, total)}-
              {Math.min(currentPage * pageSize, total)} dari {total}
            </span>
          </div>
        )}
      </div>

      <Pagination className="hidden md:flex md:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePaginationChange(currentPage - 1)}
              className={cn(
                currentPage <= 1 && "pointer-events-none opacity-50",
                "cursor-pointer"
              )}
            />
          </PaginationItem>

          {pages.map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePaginationChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {String(page)}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePaginationChange(currentPage + 1)}
              className={cn(
                currentPage >= totalPages && "pointer-events-none opacity-50",
                "cursor-pointer"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Pagination className="flex justify-center sm:justify-end md:hidden">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePaginationChange(currentPage - 1)}
              className={cn(
                currentPage <= 1 && "pointer-events-none opacity-50",
                "cursor-pointer"
              )}
            />
          </PaginationItem>

          {mobilePages.map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`mobile-ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`mobile-${page}`}>
                <PaginationLink
                  onClick={() => handlePaginationChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {String(page)}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePaginationChange(currentPage + 1)}
              className={cn(
                currentPage >= totalPages && "pointer-events-none opacity-50",
                "cursor-pointer"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
