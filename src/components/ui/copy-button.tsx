import { Copy } from "iconsax-reactjs"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import useCopyToClipboard from "@/utils/hooks/useCopyToClipboard"
import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

const CopyButton = ({ value, label, className }: CopyButtonProps) => {
  const { copy, isCopied } = useCopyToClipboard()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-8", isCopied ? "bg-accent" : "", className)}
      onClick={() => copy(value)}
    >
      {isCopied ? (
        <Check size="16" className="text-green-500" />
      ) : (
        <Copy size="16" color="currentColor" variant="Outline" />
      )}
      {label && <span className="sr-only">{label}</span>}
    </Button>
  )
}

export default CopyButton
