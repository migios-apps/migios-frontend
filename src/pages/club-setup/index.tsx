import React from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/auth"
import appConfig from "@/config/app.config"
import {
  BulkCreateClubDto,
  BulkCreateClubResponse,
} from "@/services/api/@types/club"
import { apiBulkCreateClub } from "@/services/api/ClubService"
import handleApiError from "@/services/handleApiError"
import { yupResolver } from "@hookform/resolvers/yup"
import { Navigate, useNavigate } from "react-router-dom"
import { useClubStore } from "@/stores/use-club"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Stepper, StepperItem } from "@/components/ui/stepper"
import Logo from "@/components/layout/Logo"
import { ThemeSwitch } from "@/components/theme-switch"
// import dummygenerate from "./dummygenerate.json"
import Step0 from "./step0"
import Step1 from "./step1"
import Step2 from "./step2"
import Step3 from "./step3"
import Step4 from "./step4"
import Step5 from "./step5"
import {
  FormValues,
  aboutCLubSchema,
  allSchema,
  allaowNextSchema,
  memberSchema,
  profileClubSchema,
  programSchema,
} from "./validation"

const { clubsAuthenticatedEntryPath } = appConfig

const Onboarding = () => {
  const navigate = useNavigate()
  const { setClubData, signOut, user } = useAuth()
  const total_user_clubs = user?.total_user_clubs ?? 0
  const setWelcome = useClubStore((state) => state.setWelcome)
  const [activeStep, setActiveStep] = React.useState(0)
  const [formSchema, setFormSchema] = React.useState(allaowNextSchema)

  React.useEffect(() => {
    switch (activeStep) {
      case 0:
        setFormSchema(allaowNextSchema)
        break
      case 1:
        setFormSchema(profileClubSchema)
        break
      case 2:
        setFormSchema(aboutCLubSchema)
        break
      case 3:
        setFormSchema(programSchema)
        break
      case 4:
        setFormSchema(memberSchema)
        break
      default:
        activeStep > 0
          ? setFormSchema(allSchema)
          : setFormSchema(allaowNextSchema)
        break
    }
  }, [activeStep])

  const formProps = useForm<FormValues>({
    shouldUnregister: false,
    resolver: yupResolver(formSchema as any),
    mode: "all",
    defaultValues: {
      email: user?.email,
      plan_type: "free",
      duration: 7,
      duration_type: "day",
      amount: 0,
      payment_method: "cash",
    },
  })

  const { handleSubmit, setValue } = formProps

  const handleNext = handleSubmit(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  })

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleSelectPlan = (plan: any, isYearly: boolean) => {
    setValue("plan_type", plan.type as any)
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    setValue("amount", price)
    setValue("duration", plan.duration)
    setValue(
      "duration_type",
      (isYearly ? plan.duration_type_yearly : plan.duration_type) as any
    )

    // Handle free plan payment method
    if (plan.name.toLowerCase() === "free") {
      setValue("payment_method", "cash")
    }
  }

  const createNewClub = useMutation({
    mutationFn: (data: BulkCreateClubDto) => apiBulkCreateClub(data),
    onError: (error) => {
      const resError = handleApiError(error)
      console.log("error create", resError)
    },
    onSuccess: async (data: BulkCreateClubResponse) => {
      setWelcome(true)
      const result = await setClubData(data.data, false)
      if (result.status === "success") {
        navigate(appConfig.authenticatedEntryPath, { replace: true })
      }
    },
  })

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const body = {
      name: data.name,
      photo: data.photo || null,
      phone: data.phone,
      email: data.email,
      address: data.address,
      about_club: {
        total_staff: data.about_club?.total_staff || null,
        total_member: data.about_club?.total_member || null,
        total_location: data.about_club?.total_location || null,
        how_did_find_us: data.about_club?.how_did_find_us || null,
      },
      programs: data.programs
        ? (data.programs as BulkCreateClubDto["programs"])
        : [],
      members: data.members
        ? (data.members as unknown as BulkCreateClubDto["members"])
        : [],
      plan_type: data.plan_type as BulkCreateClubDto["plan_type"],
      duration: (data.plan_type === "free"
        ? 7
        : 1) as BulkCreateClubDto["duration"],
      duration_type: (data.plan_type === "free"
        ? "day"
        : "month") as BulkCreateClubDto["duration_type"],
      amount: data.amount,
      payment_method:
        data.payment_method as BulkCreateClubDto["payment_method"],
    }
    createNewClub.mutate(body)
  }

  if (total_user_clubs > 0) {
    return <Navigate replace to={clubsAuthenticatedEntryPath} />
  }

  return (
    <>
      <div className="fixed bottom-4 left-4 z-10">
        <ThemeSwitch />
      </div>
      <div className="relative z-30 flex w-full items-center justify-between gap-4 px-4 pt-3 pb-2">
        {activeStep > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleBack()
            }}
          >
            Kembali
          </Button>
        ) : (
          <div></div>
        )}
        <div className="top-4.5 ltr:right-6 rtl:left-6">
          <div className="flex justify-start gap-4">
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Keluar
            </Button>
          </div>
        </div>
      </div>
      {activeStep === 5 ? (
        <div className="mt-4 flex h-[calc(100vh-300px)] w-full items-center justify-center">
          <Step5 />
        </div>
      ) : (
        <div className="bg-background relative flex w-full items-center justify-center">
          <div className="z-20 w-full p-4 pt-0">
            <div className="relative flex w-full flex-col items-center justify-center gap-4">
              <div className="flex w-full max-w-140 flex-col items-center justify-center">
                <Logo
                  className="me-2"
                  type="full"
                  svgProps={{ className: "h-12 w-auto" }}
                />
                <Stepper className="w-full" value={activeStep}>
                  <StepperItem step={0} />
                  <StepperItem step={1} />
                  <StepperItem step={2} />
                  <StepperItem step={3} />
                  <StepperItem step={4} />
                </Stepper>
              </div>
              {activeStep === 0 && (
                <Step0
                  formProps={formProps}
                  onNext={handleNext}
                  onPlanSelect={handleSelectPlan}
                />
              )}
              {[1, 2, 3, 4].includes(activeStep) ? (
                <Card className="relative gap-0 pt-0">
                  <CardContent>
                    <div className="mt-4 flex w-full items-center justify-center">
                      {activeStep === 1 && (
                        <Step1 formProps={formProps} onNext={handleNext} />
                      )}
                      {activeStep === 2 && (
                        <Step2
                          formProps={formProps}
                          onNext={handleNext}
                          onSkip={() => setActiveStep(3)}
                        />
                      )}
                      {activeStep === 3 && (
                        <Step3
                          formProps={formProps}
                          onNext={handleNext}
                          onSkip={() => setActiveStep(4)}
                        />
                      )}
                      {activeStep === 4 && (
                        <Step4
                          formProps={formProps}
                          isLoading={createNewClub.isPending}
                          onFinished={handleSubmit(onSubmit)}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
          <div
            className={cn(
              "absolute top-1/2 left-1/2 z-0 h-screen w-full -translate-x-1/2 -translate-y-1/2",
              "bg-size-[20px_20px]",
              "bg-[radial-gradient(#d4d4d4_1px,transparent_1px)]",
              "dark:bg-[radial-gradient(#404040_1px,transparent_1px)]"
            )}
          />
          <div className="bg-background pointer-events-none absolute top-1/2 left-1/2 z-0 flex h-screen w-full -translate-x-1/2 -translate-y-1/2 items-center justify-center mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        </div>
      )}
    </>
  )
}

export default Onboarding
