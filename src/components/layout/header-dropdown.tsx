import { Devices, KeyboardOpen, Menu } from "iconsax-reactjs"
import { Link } from "react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu"
import { Button } from "../ui/button"

const HeaderDropdown = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative h-8 w-9 rounded-full">
          <Menu size="32" color="currentColor" variant="Bulk" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem className="h-10 cursor-pointer">
            <Link to="/sales/order" className="flex items-center gap-2">
              <KeyboardOpen
                className="h-6! w-6!"
                color="var(--color-primary)"
                variant="Bulk"
              />
              Point of Sale
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="h-10 cursor-pointer">
            <Link to="/attendance/checkin" className="flex items-center gap-2">
              <Devices
                className="h-6! w-6!"
                color="var(--color-primary)"
                variant="Bulk"
              />
              Front Desk
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderDropdown
