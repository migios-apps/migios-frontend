import React, { useEffect, useRef, useState } from "react"
import { Pen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Signature Canvas Component
interface SignatureCanvasProps {
  width?: number
  height?: number
  onSave: (signature: string) => void
  existingSignature?: string
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  width = 300,
  height = 150,
  onSave,
  existingSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && existingSignature) {
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
        setHasSignature(true)
      }
      img.src = existingSignature
    }
  }, [existingSignature])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
      setHasSignature(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const dataURL = canvas.toDataURL()
    onSave(dataURL)
  }

  return (
    <div className="border-border bg-muted rounded-lg border p-4">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-border bg-background cursor-crosshair rounded-md border"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={clearCanvas}
        >
          <Trash2 className="mr-2 size-4" />
          Clear
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={!hasSignature}
          onClick={saveSignature}
        >
          <Pen className="mr-2 size-4" />
          Save
        </Button>
      </div>
    </div>
  )
}

export default SignatureCanvas
