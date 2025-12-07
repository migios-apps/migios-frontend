import { useEffect, useState } from "react"
import { Home, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SparklesText } from "@/components/MagicUI/SparklesText"

const Step5 = () => {
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
    <div className="flex w-full flex-col">
      <div className="bg-background relative mx-auto max-w-140 px-8">
        <SparklesText
          text="Tunggu sebentar, kami sedang menyiapkan semuanya...."
          className="text-2xl lg:text-5xl"
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
                  value={progressList[index] > 100 ? 100 : progressList[index]}
                />
              )}
            </div>
          ))}
        </div>
        {isCompleted && (
          <div className="flex w-full items-center justify-end">
            <Button
              type="submit"
              variant="outline"
              size="default"
              className="border-primary text-primary mt-4"
            >
              Masuk ke dashboard
              <Home className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {/* <RetroGrid /> */}
    </div>
  )
}

export default Step5
