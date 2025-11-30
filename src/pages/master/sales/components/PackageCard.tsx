import { PackageDetail } from "@/services/api/@types/package"
import { People, Profile, Profile2User } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import {
  PackageType,
  categoryPackage,
  gradientPackages,
  textColorPackages,
} from "@/constants/packages"
import { Card, CardContent } from "@/components/ui/card"
import { ReturnTransactionItemFormSchema } from "../utils/validation"

type PackageCardProps = {
  item: PackageDetail
  onClick?: (item: PackageDetail) => void
  disabled?: boolean
  formProps: ReturnTransactionItemFormSchema
}

const iconPackages = {
  membership: Profile,
  pt_program: Profile2User,
  class: People,
}

const iconColorPackages = {
  membership: "text-white/20",
  pt_program: "text-white/20",
  class: "text-white/20",
}

const PackageCard = ({
  item,
  onClick,
  disabled,
  formProps,
}: PackageCardProps) => {
  const IconComponent =
    iconPackages[item.type as keyof typeof iconPackages] || Profile

  return (
    <Card
      data-type={item.type}
      card-type="card-item-package"
      className={cn(
        "relative z-10 flex h-full min-h-[120px] transform flex-col justify-between overflow-hidden bg-linear-to-r p-3 transition-all duration-100",
        !disabled && "cursor-pointer hover:shadow-lg active:scale-95",
        disabled
          ? cn(
              "bg-accent-foreground dark:bg-card cursor-not-allowed opacity-25"
            )
          : cn(
              gradientPackages[item.type as keyof typeof gradientPackages] ||
                "from-muted to-muted-foreground text-card-foreground"
            )
      )}
      onClick={() => {
        if (!disabled) {
          formProps.setValue("data", item)
          formProps.setValue("item_type", "package")
          formProps.setValue("package_id", item.id)
          formProps.setValue("is_promo", item.is_promo)
          formProps.setValue("package_type", item.type)
          formProps.setValue("name", item.name)
          formProps.setValue("quantity", 1)
          formProps.setValue("price", item.price)
          formProps.setValue("sell_price", item.sell_price)
          formProps.setValue("loyalty_point", item.loyalty_point)
          formProps.setValue("duration", item.duration)
          formProps.setValue("duration_type", item.duration_type)
          formProps.setValue("session_duration", item.session_duration)
          formProps.setValue("classes", item.classes)
          formProps.setValue("trainers", null)
          formProps.setValue("instructors", item.instructors)
          formProps.setValue("allow_all_trainer", item.allow_all_trainer)
          if (item.is_promo) {
            formProps.setValue("discount_type", item.discount_type)
            formProps.setValue("discount", item.discount)
          }
          onClick?.(item)
        }
      }}
    >
      <CardContent className="p-0">
        {item.is_promo === 1 && (
          <div
            className={cn(
              "text-primary-foreground absolute top-4 -right-10 z-10 w-32 rotate-45 py-0.5 text-center text-xs font-semibold shadow-lg",
              disabled ? "bg-accent-foreground/20" : "bg-destructive"
            )}
          >
            PROMO
          </div>
        )}
        <div className="absolute top-1/2 right-0 -translate-x-2 -translate-y-1/2">
          <IconComponent
            color="currentColor"
            size={120}
            variant={item.type === "class" ? "Bold" : "Bold"}
            className={cn(
              disabled
                ? "text-white/20"
                : iconColorPackages[
                    item.type as keyof typeof iconColorPackages
                  ] || "text-white/20 dark:text-gray-400/20"
            )}
          />
        </div>
        <h6 className="text-lg font-semibold text-white">{item.name}</h6>
        <div className="z-10 flex w-full items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-white/80">
              {
                categoryPackage.filter(
                  (option) => option.value === item.type
                )[0]?.label
              }
              {item.type === PackageType.PT_PROGRAM &&
                ` (${item.session_duration} Ss)`}
            </span>
            {item.type === PackageType.PT_PROGRAM && (
              <span className="text-sm font-semibold text-white/80">
                With {item.trainers?.map((item) => item.name).join(", ")}
              </span>
            )}
            {item.type === PackageType.CLASS && (
              <span className="text-sm font-semibold text-white/80">
                {item.classes
                  ?.map((item) => item.name)
                  .slice(0, 2)
                  .join(", ")}{" "}
                {item.classes?.length > 2 ? ", ect." : ""}
              </span>
            )}
            <span
              className={cn(
                "mt-1 w-fit rounded-full bg-white/90 px-2 text-sm font-semibold capitalize",
                disabled
                  ? "text-muted-foreground"
                  : textColorPackages[
                      item.type as keyof typeof textColorPackages
                    ] || "text-muted-foreground"
              )}
            >
              {item.fduration}
            </span>
          </div>
          <div className="text-right leading-none">
            {item.is_promo === 1 && (
              <span className="text-sm text-white/60 line-through">
                {item.fprice}
              </span>
            )}
            <span className="-mt-0.5 block text-lg font-semibold text-white">
              {item.fsell_price}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PackageCard
