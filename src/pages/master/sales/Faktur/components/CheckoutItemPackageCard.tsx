import React from "react"
import { Edit2, Trash } from "iconsax-reactjs"
import { cn } from "@/lib/utils"
import { PackageType, categoryPackage } from "@/constants/packages"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProcessedItem } from "../utils/generateCartData"

type CheckoutItemPackageCardProps = {
  item: ProcessedItem
  showEdit?: boolean
  showDelete?: boolean
  onClick?: (item: ProcessedItem) => void
  onDelete?: () => void
}

const CheckoutItemPackageCard: React.FC<CheckoutItemPackageCardProps> = ({
  item,
  showEdit = true,
  showDelete = false,
  onClick,
  onDelete,
}) => {
  return (
    <Card
      data-type={item.package_type}
      card-type="checkout-item-package"
      className={cn(
        "group relative p-4 shadow-none",
        showEdit && "hover:bg-accent cursor-pointer active:scale-95"
      )}
      onClick={(e) => {
        if (showEdit) {
          e.stopPropagation()
          onClick?.(item)
        }
      }}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h6 className="text-lg leading-tight font-semibold">
                  {item.name}
                </h6>
                <div className="flex items-center gap-1">
                  {showEdit ? (
                    <div className="hover:bg-primary-subtle text-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <Edit2 variant="Bulk" className="size-5" />
                    </div>
                  ) : null}
                  {showDelete && onDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className="text-muted-foreground text-xs italic">
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
                <span className="text-muted-foreground block text-sm font-semibold">
                  Duration:
                </span>
                <div className="text-sm font-medium">
                  {item.duration} {item.duration_type}
                </div>
              </div>

              {/* Qty */}
              <div className="min-w-[50px] shrink-0 space-y-1">
                <span className="text-muted-foreground block text-sm font-semibold">
                  Qty:
                </span>
                <span className="text-sm font-medium">
                  {item.quantity || 1}
                </span>
              </div>

              {/* Extra Session */}
              {item.extra_session && item.extra_session > 0 ? (
                <div className="min-w-[120px] shrink-0 space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Extra Session:
                  </span>
                  <span className="text-sm font-medium">
                    {item.extra_session} Ss
                  </span>
                </div>
              ) : null}

              {/* Extra Day */}
              {item.extra_day && item.extra_day > 0 ? (
                <div className="min-w-[90px] shrink-0 space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Extra Day:
                  </span>
                  <span className="text-sm font-medium">
                    {item.extra_day} D
                  </span>
                </div>
              ) : null}

              {/* Discount */}
              {item.discount && item.discount > 0 ? (
                <div className="min-w-[100px] shrink-0 space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Discount:
                  </span>
                  <span className="bg-primary text-primary-foreground rounded px-2 py-1 text-sm font-medium">
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
                    <span className="text-muted-foreground block text-sm font-semibold">
                      Class:
                    </span>
                    <div className="text-sm font-medium">
                      {item.classes.map((cls) => cls.name).join(", ")}
                    </div>
                  </div>
                )}

              {/* Trainer/Instructor */}
              {item.package_type !== PackageType.MEMBERSHIP && (
                <div className="min-w-[150px] shrink-0 grow-0 space-y-1">
                  <span className="text-muted-foreground block text-sm font-semibold">
                    {item.package_type === PackageType.CLASS
                      ? "Instructor:"
                      : "Trainer:"}
                  </span>
                  <div className="text-sm font-medium">
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
                  <span className="text-muted-foreground block text-sm font-semibold">
                    Note:
                  </span>
                  <div className="text-sm font-medium wrap-break-word">
                    {item.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pb-4 text-right">
            <div className="space-y-1">
              <div className="text-primary text-xl font-semibold">
                {item.fnet_amount}
              </div>
              {item.discount && item.discount > 0 ? (
                <div className="text-muted-foreground text-sm line-through">
                  {item.fgross_amount}
                </div>
              ) : null}

              {item.taxes.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1">
                  {item.taxes.map((tax) => (
                    <div
                      key={tax.id}
                      className="text-muted-foreground flex items-center justify-end gap-1 text-sm"
                    >
                      <span>{tax.name}</span>
                      <span>
                        {`(${tax.rate}%)`}
                        {/* {`(${tax.rate}%, ${tax.ftax_amount})`} */}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CheckoutItemPackageCard
