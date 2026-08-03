import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/layout/vertical/sidebar"

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
  showSidebarTrigger?: boolean
}

export function Header({
  className,
  fixed,
  showSidebarTrigger = true,
  children,
  ref,
  ...props
}: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = (event?: Event) => {
      const target = event?.target

      // The page normally scrolls the document, but a page rendered with a
      // fixed container scrolls inside an element instead. Scroll events do not
      // bubble, so this listens in the capture phase and only accepts a source
      // that actually contains the header.
      if (target instanceof HTMLElement) {
        if (!headerRef.current || !target.contains(headerRef.current)) return
        setOffset(target.scrollTop)
        return
      }

      setOffset(
        window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop
      )
    }

    onScroll()
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    })

    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true })
  }, [])

  const isScrolled = offset > 10 && fixed

  const setRefs = (node: HTMLElement | null) => {
    headerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  return (
    <header
      ref={setRefs}
      className={cn(
        "z-50 h-16",
        fixed && "header-fixed peer/header sticky top-0 w-[inherit]",
        // The blur has to sit on <header> itself. Being sticky with a z-index
        // makes it a backdrop root, so a backdrop-filter on any descendant
        // (this used to be an ::after on the inner div) can only sample the
        // header's own subtree and never the page scrolling underneath it.
        isScrolled ? "bg-background/20 shadow backdrop-blur-lg" : "shadow-none",
        className
      )}
      {...props}
    >
      <div className="relative flex h-full items-center gap-3 p-4 sm:gap-4">
        {showSidebarTrigger && (
          <>
            <SidebarTrigger variant="outline" className="max-lg:scale-125" />
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        {children}
      </div>
    </header>
  )
}
