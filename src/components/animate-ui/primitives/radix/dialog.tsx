"use client"

import * as React from "react"
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { getStrictContext } from "@/lib/get-strict-context"
import { useControlledState } from "@/hooks/use-controlled-state"

type DialogContextType = {
  isOpen: boolean
  setIsOpen: DialogProps["onOpenChange"]
}

const [DialogProvider, useDialog] =
  getStrictContext<DialogContextType>("DialogContext")

type DialogProps = React.ComponentProps<typeof DialogPrimitive.Root>

function Dialog(props: DialogProps) {
  const [isOpen, setIsOpen] = useControlledState({
    value: props?.open,
    defaultValue: props?.defaultOpen,
    onChange: props?.onOpenChange,
  })

  return (
    <DialogProvider value={{ isOpen, setIsOpen }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        {...props}
        onOpenChange={setIsOpen}
      />
    </DialogProvider>
  )
}

type DialogTriggerProps = React.ComponentProps<typeof DialogPrimitive.Trigger>

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

type DialogPortalProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Portal>,
  "forceMount"
>

function DialogPortal(props: DialogPortalProps) {
  const { isOpen } = useDialog()

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPrimitive.Portal
          data-slot="dialog-portal"
          forceMount
          {...props}
        />
      )}
    </AnimatePresence>
  )
}

type DialogOverlayProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Overlay>,
  "forceMount" | "asChild"
> &
  HTMLMotionProps<"div">

function DialogOverlay({
  transition = { duration: 0.2, ease: "easeInOut" },
  ...props
}: DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay data-slot="dialog-overlay" asChild forceMount>
      <motion.div
        key="dialog-overlay"
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={transition}
        {...props}
      />
    </DialogPrimitive.Overlay>
  )
}

type DialogSlideDirection = "top" | "bottom" | "left" | "right" | "center"
type DialogAnimationType =
  | "slide"
  | "zoom"
  | "fade"
  | "slideBounce"
  | "zoomBounce"
  | "fadeBounce"

type DialogContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Content>,
  "forceMount" | "asChild"
> &
  HTMLMotionProps<"div"> & {
    from?: DialogSlideDirection
    animation?: DialogAnimationType
  }

function DialogContent({
  from = "bottom",
  animation = "zoom",
  onOpenAutoFocus,
  onCloseAutoFocus,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  transition,
  ...props
}: DialogContentProps) {
  // Determine if bounce should be applied
  const isBounce = animation.includes("Bounce")

  // Extract base animation type
  const baseAnimation = animation.replace("Bounce", "").toLowerCase() as
    | "slide"
    | "zoom"
    | "fade"

  // Set transition based on bounce
  const defaultTransition = isBounce
    ? ({ type: "spring", stiffness: 400, damping: 20 } as const)
    : ({ duration: 0.2, ease: "easeInOut" } as const)

  const finalTransition = transition || defaultTransition

  const getAnimationVariants = () => {
    // For fade animation, direction doesn't matter
    if (baseAnimation === "fade") {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }

    // For zoom animation
    if (baseAnimation === "zoom") {
      const baseZoom = {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      }

      // If center or zoom, just scale from center
      if (from === "center") {
        return baseZoom
      }

      // Zoom with directional offset
      const offset = 50
      let position = {}

      switch (from) {
        case "top":
          position = { y: -offset }
          break
        case "bottom":
          position = { y: offset }
          break
        case "left":
          position = { x: -offset }
          break
        case "right":
          position = { x: offset }
          break
      }

      return {
        initial: { opacity: 0, scale: 0.8, ...position },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
        exit: { opacity: 0, scale: 0.8, ...position },
      }
    }

    // For slide animation (default)
    if (from === "center") {
      // Center slide is just fade
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }

    const offset = 100
    let position = {}

    switch (from) {
      case "top":
        position = { y: -offset }
        break
      case "bottom":
        position = { y: offset }
        break
      case "left":
        position = { x: -offset }
        break
      case "right":
        position = { x: offset }
        break
    }

    return {
      initial: { opacity: 0, ...position },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...position },
    }
  }

  const variants = getAnimationVariants()

  return (
    <DialogPrimitive.Content
      asChild
      forceMount
      onOpenAutoFocus={onOpenAutoFocus}
      onCloseAutoFocus={onCloseAutoFocus}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      onInteractOutside={onInteractOutside}
      tabIndex={undefined}
    >
      <motion.div
        key="dialog-content"
        data-slot="dialog-content"
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={finalTransition}
        tabIndex={undefined}
        {...props}
      />
    </DialogPrimitive.Content>
  )
}

type DialogCloseProps = React.ComponentProps<typeof DialogPrimitive.Close>

function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

type DialogHeaderProps = React.ComponentProps<"div">

function DialogHeader(props: DialogHeaderProps) {
  return <div data-slot="dialog-header" {...props} />
}

type DialogFooterProps = React.ComponentProps<"div">

function DialogFooter(props: DialogFooterProps) {
  return <div data-slot="dialog-footer" {...props} />
}

type DialogTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>

function DialogTitle(props: DialogTitleProps) {
  return <DialogPrimitive.Title data-slot="dialog-title" {...props} />
}

type DialogDescriptionProps = React.ComponentProps<
  typeof DialogPrimitive.Description
>

function DialogDescription(props: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description data-slot="dialog-description" {...props} />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  useDialog,
  type DialogProps,
  type DialogTriggerProps,
  type DialogPortalProps,
  type DialogCloseProps,
  type DialogOverlayProps,
  type DialogContentProps,
  type DialogHeaderProps,
  type DialogFooterProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogContextType,
  type DialogSlideDirection,
  type DialogAnimationType,
}
