import React from "react"
import { Edit } from "iconsax-reactjs"
import { PackageType, categoryPackage } from "@/constants/packages"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProcessedItem } from "../utils/generateCartData"

type ItemPackageCardProps = {
  item: ProcessedItem
  onClick?: (item: ProcessedItem) => void
}

const ItemPackageCard: React.FC<ItemPackageCardProps> = ({ item, onClick }) => {
  return (
    <Card className="relative z-10 flex flex-col justify-between p-3">
      <CardContent className="p-0">
        <div className="hover:bg-primary-subtle absolute top-0 right-0 z-20 rounded-tr-lg rounded-bl-lg bg-gray-300 dark:bg-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-primary-subtle h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onClick?.(item)
            }}
          >
            <Edit color="currentColor" size={16} />
          </Button>
        </div>
        <h6 className="font-bold">{item.name}</h6>
        <div className="z-10 flex w-full items-end justify-between">
          <div className="flex flex-col">
            <span>
              {
                categoryPackage.filter(
                  (option) => option.value === item.package_type
                )[0]?.label
              }
              {item.package_type === PackageType.PT_PROGRAM &&
                ` (${item.session_duration} Ss)`}
            </span>
            <span>
              {item.duration} {item.duration_type}
            </span>
          </div>
          <div className="text-right leading-none">
            {item.discount && item.discount > 0 ? (
              <span className="text-sm line-through">
                {item.foriginal_price}
              </span>
            ) : null}
            <span className="-mt-0.5 block text-lg font-bold">
              {item.foriginal_total_amount}
            </span>
          </div>
        </div>
        <div className="flex justify-start gap-2">
          {item.extra_session && item.extra_session > 0 ? (
            <div className="mt-1 flex gap-2">
              <span className="text-sm">Extra Session:</span>
              <span className="font-bold">{item.extra_session} Ss</span>
            </div>
          ) : null}
          {item.extra_day && item.extra_day > 0 ? (
            <div className="mt-1 flex gap-2">
              <span className="text-sm">Extra Day:</span>
              <span className="font-bold">{item.extra_day} D</span>
            </div>
          ) : null}
        </div>
        {item.package_type === PackageType.CLASS && (
          <div className="mt-1 flex flex-col">
            <span className="font-bold">Class</span>
            <span className="text-sm">
              {item.classes?.map((item) => item.name).join(", ")}
            </span>
          </div>
        )}
        {item.package_type !== PackageType.MEMBERSHIP ? (
          <div className="mt-1 flex flex-col">
            <span className="font-bold">
              {item.package_type === PackageType.CLASS
                ? "Instructor"
                : "Trainer"}
            </span>
            <span className="text-sm">
              {[
                ...(item?.instructors ? item.instructors : []),
                ...(item.trainers ? [item.trainers] : []),
              ]
                ?.map((item) => item.name)
                ?.slice(0, 3)
                ?.join(", ")}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default ItemPackageCard
