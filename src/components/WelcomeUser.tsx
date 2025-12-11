import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { useClubStore } from "@/stores/use-club"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog"
import { SparklesText } from "./MagicUI/SparklesText"
import { SchoolPrideConfetti } from "./MagicUI/confetti"
import Logo from "./layout/Logo"
import { Separator } from "./ui/separator"

const WelcomeUser = () => {
  const [openConfetti, setOpenConfetti] = useState(false)

  // close confetti after 1 second
  useEffect(() => {
    if (openConfetti) {
      setTimeout(() => {
        setOpenConfetti(false)
      }, 1000)
    }
  }, [openConfetti])

  const { welcome, setWelcome } = useClubStore()
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
    if (welcome) {
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
        setOpenConfetti(true)
      }
    }
  }, [progressList, currentStep, welcome, settingup.length])
  return (
    <>
      <Dialog
        open={welcome}
        onOpenChange={(open) => {
          if (isCompleted) {
            setWelcome(open)
          }
        }}
      >
        <DialogHeader className="rounded-2xl">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <DialogContent
          className="m-0 rounded-2xl border-none! p-0!"
          showCloseButton={false}
          autoFocus={false}
        >
          <div
            className="relative h-20 w-full overflow-hidden rounded-tl-2xl rounded-tr-2xl border-none bg-cover bg-center md:h-24"
            style={{
              backgroundImage: `url('/img/pt-program.jpg')`,
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
                  onClick={() => {
                    setWelcome(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div className="relative flex items-start gap-1 px-2 py-1">
                <Logo
                  className="me-2 text-white"
                  type="icon"
                  svgProps={{ className: "h-12 w-auto" }}
                />
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white sm:text-2xl">
                    Selamat datang di Migios!
                  </span>
                  <span className="text-sm text-white sm:text-base">
                    Transformasi Gym Anda, Raih Kesuksesan Lebih Cepat! 🚀
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <SparklesText
              text="Tunggu sebentar, kami sedang menyiapkan semuanya...."
              className="text-2xl lg:text-3xl"
            />
            <div className="mt-4 flex flex-col gap-0">
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
                  {index < settingup.length - 1 &&
                    progressList[index] > 100 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* {isCompleted && <SchoolPrideConfetti duration={5} />} */}
      {openConfetti && <SchoolPrideConfetti />}
      {/* <Button onClick={() => setOpenConfetti(true)}>Open Confetti</Button> */}
    </>
  )
}

export default WelcomeUser
