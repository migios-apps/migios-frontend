import React, { useId, useRef } from "react"
import { cn } from "@/lib/utils"

export interface UploadProps {
  children: React.ReactNode
  showList?: boolean
  uploadLimit?: number
  onChange?: (files: File[]) => void
  className?: string
  accept?: string
  disabled?: boolean
  multiple?: boolean
}

const Upload = React.forwardRef<HTMLInputElement, UploadProps>(
  ({
    children,
    showList = false,
    uploadLimit = 1,
    onChange,
    className,
    accept,
    disabled = false,
    multiple = false,
    ...props
  }) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const id = useId()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const limitedFiles = files.slice(0, uploadLimit)
      onChange?.(limitedFiles)
    }

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    return (
      <div className={cn("relative", className)}>
        <input
          ref={inputRef}
          type="file"
          id={id}
          className="hidden"
          accept={accept}
          disabled={disabled}
          multiple={multiple || uploadLimit > 1}
          onChange={handleFileChange}
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(!disabled && "cursor-pointer")}
        >
          {children}
        </div>
      </div>
    )
  }
)

Upload.displayName = "Upload"

export default Upload
