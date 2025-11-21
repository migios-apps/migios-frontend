import { useCallback, useState } from "react"
import { toast } from "sonner"

function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      setError("Clipboard API tidak tersedia.")
      setIsCopied(false)
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setError(null)
      toast.success("Teks berhasil disalin.", {
        closeButton: true,
        duration: 2000,
        position: "top-center",
      })

      // Reset status setelah 2 detik
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      setError("Gagal menyalin teks.")
      setIsCopied(false)
      toast.error("Gagal menyalin teks.", {
        closeButton: true,
        duration: 2000,
        position: "top-center",
      })
    }
  }, [])

  return { copy, isCopied, error }
}

export default useCopyToClipboard
