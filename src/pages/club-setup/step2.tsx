import React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormFieldItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/react-select"
import { ReturnClubFormSchema, howdidfindus } from "./validation"

type PropsType = {
  onSkip?: () => void
  onNext?: () => void
  formProps: ReturnClubFormSchema
}

const homany_staff = [
  { value: "1", label: "Just me" },
  { value: "2-4", label: "2-4" },
  { value: "5-9", label: "5-9" },
  { value: "10+", label: "10+" },
]

const howmany_member = [
  { value: "-50", label: "Under 50" },
  { value: "50-100", label: "50-100" },
  { value: "101-200", label: "101-200" },
  { value: "201-400", label: "201-400" },
  { value: "400+", label: "400+" },
]

const howmany_location = [
  { value: "1", label: "1" },
  { value: "2-4", label: "2-4" },
  { value: "5-10", label: "5-10" },
  { value: "10+", label: "10+" },
]

const Step2: React.FC<PropsType> = ({ onNext, onSkip, formProps }) => {
  const {
    control,
    watch,
    formState: { errors },
  } = formProps

  const watchData = watch()

  return (
    <Form {...formProps}>
      <div className="relative flex w-full max-w-130 flex-col gap-4">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">
            Ceritakan sedikit tentang bisnis Anda
          </h2>
          <span className="text-lg">
            Ini membantu mempersonalisasikan pengalaman Anda dengan sistem
            migios
          </span>
        </div>
        <div className="mt-8 flex w-full flex-col gap-8">
          <div className="flex flex-col">
            <h6 className="mb-2">
              Berapa banyak anggota staf yang Anda miliki?
            </h6>
            <div className="mb-0">
              <FormFieldItem
                control={control}
                name="about_club.total_staff"
                label=""
                invalid={Boolean(errors.about_club?.total_staff)}
                errorMessage={errors.about_club?.total_staff?.message}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {homany_staff.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <Button
                          variant={
                            field.value === option.value ? "default" : "outline"
                          }
                          size="sm"
                          className={cn("w-full min-w-28")}
                          value={option.value}
                          onClick={() => field.onChange(option.value)}
                          type="button"
                        >
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h6 className="mb-2">
              Berapa banyak anggota yang menghadiri gym Anda?
            </h6>
            <div className="mb-0">
              <FormFieldItem
                control={control}
                name="about_club.total_member"
                label=""
                invalid={Boolean(errors.about_club?.total_member)}
                errorMessage={errors.about_club?.total_member?.message}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {howmany_member.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <Button
                          variant={
                            field.value === option.value ? "default" : "outline"
                          }
                          size="sm"
                          className={cn("w-full min-w-28")}
                          value={option.value}
                          onClick={() => field.onChange(option.value)}
                          type="button"
                        >
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h6 className="mb-2">
              Berapa banyak lokasi yang dimiliki bisnis Anda?
            </h6>
            <div className="mb-0">
              <FormFieldItem
                control={control}
                name="about_club.total_location"
                label=""
                invalid={Boolean(errors.about_club?.total_location)}
                errorMessage={errors.about_club?.total_location?.message}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {howmany_location.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <Button
                          variant={
                            field.value === option.value ? "default" : "outline"
                          }
                          size="sm"
                          className={cn("w-full min-w-28")}
                          value={option.value}
                          onClick={() => field.onChange(option.value)}
                          type="button"
                        >
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h2>Bagaimana Anda menemukan kami? </h2>
            <span className="text-muted-foreground text-sm">
              Opsional, tapi dihargai!
            </span>
            <div className="mb-0">
              <FormFieldItem
                control={control}
                name="about_club.how_did_find_us"
                label=""
                invalid={Boolean(errors.about_club?.how_did_find_us)}
                errorMessage={errors.about_club?.how_did_find_us?.message}
                render={({ field }) => (
                  <div className="mt-4 flex w-full flex-col gap-4">
                    <Select
                      isSearchable={false}
                      placeholder="Select..."
                      value={
                        watch("about_club.is_other_find_us")
                          ? howdidfindus.find(
                              (option) => option.value === "Other"
                            )
                          : howdidfindus.find(
                              (option) => option.value === field.value
                            )
                      }
                      options={howdidfindus}
                      onChange={(
                        value: { value: string; label: string } | null
                      ) => {
                        formProps.setValue(
                          "about_club.is_other_find_us",
                          value?.value === "Other"
                        )
                        if (value?.value !== "Other") {
                          field.onChange(value?.value)
                        } else {
                          field.onChange(undefined)
                        }
                      }}
                    />
                    {watch("about_club.is_other_find_us") && (
                      <Input
                        type="text"
                        autoComplete="off"
                        placeholder="How did you find us?"
                        value={field.value || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.onChange(e.target.value)
                        }
                      />
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex w-full items-end justify-between">
          <Button
            variant="ghost"
            size="default"
            className="rounded-full text-start"
            onClick={onSkip}
          >
            Lewati tahap ini
          </Button>
          <Button
            disabled={
              !watchData.about_club?.total_staff ||
              !watchData.about_club?.total_member ||
              !watchData.about_club?.total_location
            }
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
    </Form>
  )
}

export default Step2
