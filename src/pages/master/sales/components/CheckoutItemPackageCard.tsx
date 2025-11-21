import React from "react"
import { Edit } from "iconsax-reactjs"
import { PackageType, categoryPackage } from "@/constants/packages"
import { Button, Card } from "@/components/ui"
import { ProcessedItem } from "../utils/generateCartData"

type CheckoutItemPackageCardProps = {
  item: ProcessedItem
  showEdit?: boolean
  onClick?: (item: ProcessedItem) => void
}

const CheckoutItemPackageCard: React.FC<CheckoutItemPackageCardProps> = ({
  item,
  showEdit = true,
  onClick,
}) => {
  return (
    <Card bodyClass="p-4 relative z-10">
      {showEdit ? (
        <div className="hover:bg-primary-subtle absolute right-0 bottom-0 z-20 rounded-tl-lg rounded-br-lg bg-gray-300 dark:bg-gray-700">
          <Button
            variant="plain"
            size="sm"
            className="hover:bg-primary-subtle h-8 w-8"
            icon={<Edit color="currentColor" size={16} />}
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(item)
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="space-y-3">
          <div className="flex flex-col">
            <h6 className="text-lg leading-tight font-bold">{item.name}</h6>
            <p className="text-xs text-gray-600 italic dark:text-gray-400">
              {
                categoryPackage.filter(
                  (option) => option.value === item.package_type
                )[0]?.label
              }
              {item.package_type === PackageType.PT_PROGRAM &&
                ` (${item.session_duration} Ss)`}
            </p>
          </div>

          {/* Package Details */}
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Duration */}
            <div className="min-w-[90px] shrink-0 space-y-1">
              <span className="block font-semibold text-gray-600 dark:text-gray-400">
                Duration:
              </span>
              <div className="font-medium">
                {item.duration} {item.duration_type}
              </div>
            </div>

            {/* Qty */}
            <div className="min-w-[50px] shrink-0 space-y-1">
              <span className="block font-semibold text-gray-600 dark:text-gray-400">
                Qty:
              </span>
              <span className="font-medium">{item.quantity || 1}</span>
            </div>

            {/* Extra Session */}
            {item.extra_session && item.extra_session > 0 ? (
              <div className="min-w-[120px] shrink-0 space-y-1">
                <span className="block font-semibold text-gray-600 dark:text-gray-400">
                  Extra Session:
                </span>
                <span className="font-medium">{item.extra_session} Ss</span>
              </div>
            ) : null}

            {/* Extra Day */}
            {item.extra_day && item.extra_day > 0 ? (
              <div className="min-w-[90px] shrink-0 space-y-1">
                <span className="block font-semibold text-gray-600 dark:text-gray-400">
                  Extra Day:
                </span>
                <span className="font-medium">{item.extra_day} D</span>
              </div>
            ) : null}

            {/* Discount */}
            {item.discount && item.discount > 0 ? (
              <div className="min-w-[100px] shrink-0 space-y-1">
                <span className="block font-semibold text-gray-600 dark:text-gray-400">
                  Discount:
                </span>
                <span className="bg-primary rounded px-2 py-1 font-medium text-white">
                  {item.discount_type === "percent"
                    ? `${item.discount}%`
                    : item.fdiscount_amount}
                </span>
              </div>
            ) : null}

            {/* Class */}
            {item.package_type === PackageType.CLASS &&
              item.classes &&
              item.classes.length > 0 && (
                <div className="min-w-[150px] shrink-0 grow-0 space-y-1">
                  <span className="block font-semibold text-gray-600 dark:text-gray-400">
                    Class:
                  </span>
                  <div className="font-medium">
                    {item.classes.map((cls) => cls.name).join(", ")}
                  </div>
                </div>
              )}

            {/* Trainer/Instructor */}
            {item.package_type !== PackageType.MEMBERSHIP && (
              <div className="min-w-[150px] shrink-0 grow-0 space-y-1">
                <span className="block font-semibold text-gray-600 dark:text-gray-400">
                  {item.package_type === PackageType.CLASS
                    ? "Instructor:"
                    : "Trainer:"}
                </span>
                <div className="font-medium">
                  {[
                    ...(item?.instructors ? item.instructors : []),
                    ...(item.trainers ? [item.trainers] : []),
                  ]
                    ?.map((person) => person.name)
                    ?.slice(0, 3)
                    ?.join(", ")}
                </div>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="w-full space-y-1">
                <span className="block font-semibold text-gray-600 dark:text-gray-400">
                  Note:
                </span>
                <div className="font-medium wrap-break-word">{item.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="pb-4 text-right">
          <div className="space-y-1">
            <div className="text-primary text-xl font-bold">
              {item.fnet_amount}
            </div>
            {item.discount && item.discount > 0 ? (
              <div className="text-sm text-gray-500 line-through">
                {item.fgross_amount}
              </div>
            ) : null}

            {item.taxes.length > 0 ? (
              <div className="mt-2 space-y-1">
                {item.taxes.map((tax) => (
                  <div key={tax.id} className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {tax.name}
                    </span>
                    <span className="ml-2 font-medium">
                      {`(${tax.rate}%, ${tax.ftax_amount})`}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CheckoutItemPackageCard
