import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { useWelcome } from "@/stores/use-welcome"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { SparklesText } from "./MagicUI/SparklesText"
import Logo from "./layout/Logo"

const WelcomeUser = () => {
  const { welcome, setWelcome } = useWelcome()
  const settingup = [
    "Menyiapkan Akun Migios Anda",
    "Menyiapkan klub gym Anda",
    "Personalisasi dasbor Anda",
    "Menyiapkan rekomendasi.",
  ]

  // State untuk menyimpan progres setiap langkah
  const [progressList, setProgressList] = useState<number[]>(
    new Array(settingup.length).fill(0)
  )
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (currentStep < settingup.length) {
      const interval = setInterval(() => {
        setProgressList((prev) => {
          const newProgress = [...prev]
          if (newProgress[currentStep] < 100) {
            newProgress[currentStep] += Math.floor(Math.random() * 20) + 10 // Progress naik acak (10-30)
          }
          return newProgress
        })
      }, 600) // Setiap 500ms progress bertambah

      if (progressList[currentStep] >= 100) {
        clearInterval(interval)
        setTimeout(() => setCurrentStep((prev) => prev + 1), 500) // Jeda sebelum lanjut ke step berikutnya
      }

      return () => clearInterval(interval)
    } else {
      setIsCompleted(true) // Semua langkah selesai
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressList, currentStep])
  return (
    <Dialog
      open={welcome}
      onOpenChange={(open) => {
        if (isCompleted) setWelcome(open)
      }}
    >
      <DialogContent className="p-0">
        <div
          className="relative h-20 w-full overflow-hidden rounded-tl-2xl rounded-tr-2xl border-none bg-cover bg-center md:h-24"
          style={{
            backgroundImage: `url('/img/others/pt-program.jpg')`,
            backgroundPositionY: "30%",
          }}
        >
          <div className="absolute inset-0 z-0 bg-black opacity-65"></div>
          <div className="pt-4">
            {isCompleted && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-3 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setWelcome(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <div className="relative flex items-center gap-1 px-2 py-1">
              <Logo
                type="streamline"
                mode="dark"
                imgClass="mx-auto relative"
                className="!w-[30px] sm:!w-[45px]"
                logoWidth={0}
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-white sm:text-2xl">
                  Selamat datang di Migios!
                </span>
                <span className="text-sm text-white sm:text-base">
                  Solusi Manajemen Gym Terlengkap! 💪🏋️‍♂️
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <SparklesText
            text="Tunggu sebentar, kami sedang menyiapkan semuanya...."
            className="text-2xl lg:text-3xl"
          />
          <div className="mt-4 flex flex-col gap-3">
            {settingup.map((item, index) => (
              <div key={index} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex text-lg">{item}</span>
                  {progressList[index] > 100 && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                {progressList[index] < 100 && (
                  <Progress
                    value={
                      progressList[index] > 100 ? 100 : progressList[index]
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default WelcomeUser
