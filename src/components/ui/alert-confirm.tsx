import React, { JSX } from "react"
import { Trash } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"

interface AlertConfirmProps {
  title: JSX.Element | string
  description?: JSX.Element | string
  open: boolean
  loading?: boolean
  zIndex?: number
  type?: "delete" | "confirm"
  icon?: JSX.Element | null
  leftTitle?: JSX.Element | string
  rightTitle?: JSX.Element | string
  leftButtonClassName?: string
  rightButtonClassName?: string
  closable?: boolean
  className?: string
  onClose?: () => void
  onLeftClick?: () => void
  onRightClick?: () => void
}

const DeleteIcon = () => {
  return (
    <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
      <Trash variant="Broken" className="h-10 w-10 text-red-400" />
    </div>
  )
}

const AlertConfirm: React.FC<AlertConfirmProps> = ({
  title,
  description,
  open,
  loading,
  type = "confirm",
  icon = type === "delete" ? <DeleteIcon /> : null,
  leftTitle = "Cancel",
  rightTitle = "Confirm",
  leftButtonClassName,
  rightButtonClassName,
  className = "sm:max-w-[320px]",
  closable = false,
  onClose,
  onLeftClick,
  onRightClick,
}) => {
  return (
    <Dialog open={open} onOpenChange={closable ? onClose : undefined}>
      <DialogContent
        className={className}
        showCloseButton={closable}
        animation="zoomBounce"
        from="top"
      >
        <div className="relative flex flex-col items-center justify-center">
          {icon && <div className="mb-2">{icon}</div>}
          <DialogHeader className="text-center">
            <DialogTitle className="text-center">{title}</DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
          </DialogHeader>
          {description && (
            <div className="text-muted-foreground text-center text-sm">
              {description}
            </div>
          )}
          <DialogFooter className="mt-6 grid w-full grid-cols-1 gap-2 md:grid-cols-2">
            {onLeftClick && (
              <Button
                className={cn("w-full", leftButtonClassName)}
                variant="outline"
                onClick={onLeftClick}
              >
                {leftTitle}
              </Button>
            )}
            {onRightClick && (
              <Button
                className={cn("w-full", rightButtonClassName)}
                variant={type === "delete" ? "destructive" : "default"}
                disabled={loading}
                onClick={onRightClick}
              >
                {loading ? "Loading..." : rightTitle}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AlertConfirm
