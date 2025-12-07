import { useState } from "react"
import { Plus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ReturnClubFormSchema } from "./validation"

type PropsType = {
  onSkip?: () => void
  onNext?: () => void
  formProps: ReturnClubFormSchema
}

type ProgramType = "membership" | "pt_program" | "class"
type ProgramProps = {
  id: number
  title: string
  type: ProgramType
  desc: string
  img: string
  category: {
    label: string
    value: string
  }[]
}

const programs: ProgramProps[] = [
  {
    id: 1,
    title: "Membership",
    type: "membership",
    desc: "Siapkan program membership untuk anggota Anda.",
    img: "/img/others/membership.jpg",
    category: [],
  },
  {
    id: 2,
    title: "Personal Training",
    type: "pt_program",
    desc: "Siapkan program personal trainer untuk anggota Anda.",
    img: "/img/others/pt-program.jpg",
    category: [],
  },
  {
    id: 3,
    title: "Class Program",
    type: "class",
    desc: "Siapkan program kelas untuk anggota Anda.",
    img: "/img/others/yoga.jpg",
    category: [
      {
        label: "Yoga",
        value: "Yoga",
      },
      {
        label: "Pilates",
        value: "Pilates",
      },
      {
        label: "Zumba",
        value: "Zumba",
      },
      {
        label: "Cardio",
        value: "Cardio",
      },
    ],
  },
]

const programTypeOrder = {
  membership: 0,
  pt_program: 1,
  class: 2,
}

const Step3: React.FC<PropsType> = ({ onNext, onSkip, formProps }) => {
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const { watch, setValue } = formProps

  const watchData = watch()
  const dataPrograms = watchData.programs || []

  return (
    <div className="relative w-full max-w-[35rem]">
      <h2>Program apa yang Anda jalankan?</h2>
      <span className="text-lg">
        Program digunakan untuk mengatur keanggotaan dan akses sesi, serta
        melacak kemajuan member.
      </span>
      <div className="mt-8 flex w-full flex-col gap-4">
        {programs.map((item, index) => (
          <div key={index} className="flex flex-col">
            <Card
              className={cn(
                "relative overflow-hidden border bg-cover bg-center",
                item.category?.length > 0 &&
                  watchData.programs?.map((p) => p.type).includes(item.type)
                  ? "rounded-br-none rounded-bl-none"
                  : ""
              )}
              style={{
                backgroundImage: `url('${item.img}')`,
                backgroundPositionY: item.id === 2 ? "30%" : "center",
              }}
            >
              <div className="absolute inset-0 z-0 bg-black opacity-55"></div>
              <CardContent className="relative z-10 flex w-full items-center justify-between gap-4 p-6 text-white">
                <div className="flex flex-col">
                  <h5 className="text-white">{item.title}</h5>
                  <span>{item.desc}</span>
                </div>
                <div className="flex">
                  <Checkbox
                    checked={Boolean(
                      dataPrograms.map((p) => p.type).includes(item.type)
                    )}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setValue(
                          "programs",
                          [
                            ...dataPrograms,
                            {
                              name: item.title,
                              type: item.type,
                              classes: [],
                            },
                          ].sort(
                            (a, b) =>
                              programTypeOrder[a.type as ProgramType] -
                              programTypeOrder[b.type as ProgramType]
                          )
                        )
                      } else {
                        setValue(
                          "programs",
                          dataPrograms
                            .filter((p) => p.type !== item.type)
                            .sort(
                              (a, b) =>
                                programTypeOrder[a.type as ProgramType] -
                                programTypeOrder[b.type as ProgramType]
                            )
                        )
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <div
              className={cn(
                "flex flex-wrap gap-2",
                item.category?.length > 0 &&
                  watchData.programs?.map((p) => p.type).includes(item.type)
                  ? "border-primary -mt-4 rounded-br-2xl rounded-bl-2xl border-2 p-3 pt-8 dark:border-gray-700"
                  : "hidden"
              )}
            >
              {item.category?.map((option, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex gap-2 rounded-xl border border-gray-300 p-2 dark:border-gray-600">
                    <span>{option.label}</span>
                    <Checkbox
                      checked={Boolean(
                        dataPrograms
                          .find((p) => p.type === item.type)
                          ?.classes?.includes(option.value)
                      )}
                      onCheckedChange={(checked: boolean) => {
                        const program = dataPrograms.find(
                          (p) => p.type === item.type
                        )

                        if (checked && program) {
                          setValue(
                            "programs",
                            dataPrograms.map((p) =>
                              p.type === item.type
                                ? {
                                    ...p,
                                    classes: [...p.classes, option.value],
                                  }
                                : p
                            )
                          )
                        } else if (program) {
                          setValue(
                            "programs",
                            dataPrograms.map((p) =>
                              p.type === item.type
                                ? {
                                    ...p,
                                    classes: p.classes.filter(
                                      (c) => c !== option.value
                                    ),
                                  }
                                : p
                            )
                          )
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              {dataPrograms
                .find((p) => p.type === item.type)
                ?.classes?.filter(
                  (className) =>
                    !item.category?.some((c) => c.value === className)
                )
                .map((className, index) => (
                  <div key={`custom-${index}`} className="flex items-center">
                    <div className="flex gap-2 rounded-xl border border-gray-300 p-2 dark:border-gray-600">
                      <span>{className}</span>
                      <Checkbox
                        checked
                        onCheckedChange={(checked: boolean) => {
                          const program = dataPrograms.find(
                            (p) => p.type === item.type
                          )

                          if (!checked && program) {
                            setValue(
                              "programs",
                              dataPrograms.map((p) =>
                                p.type === item.type
                                  ? {
                                      ...p,
                                      classes: p.classes.filter(
                                        (c) => c !== className
                                      ),
                                    }
                                  : p
                              )
                            )
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              {item.category.length > 0 && (
                <>
                  {!showNewCategory ? (
                    <div className="flex items-center">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex gap-2"
                        onClick={() => setShowNewCategory(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Tambahkan lainnya
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="mb-0 flex-1">
                        <Input
                          type="text"
                          placeholder="Nama kategori baru"
                          value={newCategory}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewCategory(e.target.value)
                          }
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLInputElement>
                          ) => {
                            if (e.key === "Enter" && newCategory.trim()) {
                              const classProgram = dataPrograms.find(
                                (p) => p.type === item.type
                              )

                              if (classProgram) {
                                setValue(
                                  "programs",
                                  dataPrograms.map((p) =>
                                    p.type === "class"
                                      ? {
                                          ...p,
                                          classes: [
                                            ...p.classes,
                                            newCategory.trim(),
                                          ],
                                        }
                                      : p
                                  )
                                )
                              }
                              setNewCategory("")
                              setShowNewCategory(false)
                            } else if (e.key === "Escape") {
                              setNewCategory("")
                              setShowNewCategory(false)
                            }
                          }}
                        />
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={!newCategory.trim()}
                        onClick={() => {
                          if (newCategory.trim()) {
                            const classProgram = dataPrograms.find(
                              (p) => p.type === item.type
                            )

                            if (classProgram) {
                              setValue(
                                "programs",
                                dataPrograms.map((p) =>
                                  p.type === "class"
                                    ? {
                                        ...p,
                                        classes: [
                                          ...p.classes,
                                          newCategory.trim(),
                                        ],
                                      }
                                    : p
                                )
                              )
                            }
                            setNewCategory("")
                            setShowNewCategory(false)
                          }
                        }}
                      >
                        Tambah
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewCategory("")
                          setShowNewCategory(false)
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex w-full items-end justify-between">
        <Button
          variant="ghost"
          size="default"
          className="rounded-full px-0 text-start"
          onClick={onSkip}
        >
          Lewati tahap ini
        </Button>
        <Button
          type="submit"
          variant="default"
          size="default"
          className="mt-4 min-w-32 rounded-full"
          onClick={onNext}
        >
          Berikutnya
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default Step3
