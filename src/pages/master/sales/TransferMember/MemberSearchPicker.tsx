import { useCallback } from "react"
import { MemberDetail } from "@/services/api/@types/member"
import { apiGetMemberList } from "@/services/api/MembeService"
import { CloseCircle } from "iconsax-reactjs"
import { GroupBase, OptionsOrGroups } from "react-select"
import { Button } from "@/components/ui/button"
import {
  ReturnAsyncSelect,
  SelectAsyncPaginate,
} from "@/components/ui/react-select"

type MemberSearchPickerProps = {
  label?: string
  placeholder?: string
  value: MemberDetail | null
  onChange: (member: MemberDetail | null) => void
  excludeMemberId?: number
  emptyAction?: React.ReactNode
  inputName?: string
  onlyActivePackage?: boolean
}

const MemberSearchPicker = ({
  label,
  placeholder = "Cari nama atau kode member...",
  value,
  onChange,
  excludeMemberId,
  emptyAction,
  inputName,
  onlyActivePackage = false,
}: MemberSearchPickerProps) => {
  const loadMembers = useCallback(
    async (
      inputValue: string,
      _: OptionsOrGroups<MemberDetail, GroupBase<MemberDetail>>,
      additional?: { page: number }
    ) => {
      const response = await apiGetMemberList({
        page: additional?.page,
        per_page: 10,
        sort_column: "id",
        sort_type: "desc",
        search: [
          (inputValue || "").length > 0
            ? ({
                search_column: "name",
                search_condition: "like",
                search_text: `${inputValue}`,
                search_operator: "or",
              } as any)
            : null,
          (inputValue || "").length > 0
            ? ({
                search_column: "code",
                search_condition: "like",
                search_text: `${inputValue}`,
                search_operator: "or",
              } as any)
            : null,
        ],
      })

      const eligible = response.data.data.filter(
        (member) =>
          member.id !== excludeMemberId &&
          (!onlyActivePackage || Number(member.membeship_status_code) === 1)
      )
      const meta = response.data.meta

      return new Promise<ReturnAsyncSelect>((resolve) => {
        resolve({
          options: eligible,
          hasMore: meta.page < meta.total_page,
          additional: { page: additional!.page + 1 },
        })
      })
    },
    [excludeMemberId, onlyActivePackage]
  )

  if (value) {
    return (
      <div className="space-y-2">
        {label ? <p className="text-sm font-medium">{label}</p> : null}
        <div className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{value.name}</p>
            <p className="text-muted-foreground font-mono text-xs">
              {value.code}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            <CloseCircle size={16} variant="Bulk" />
            Ganti
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      <SelectAsyncPaginate<MemberDetail>
        isClearable
        name={inputName}
        loadOptions={loadMembers as any}
        additional={{ page: 1 }}
        placeholder={placeholder}
        value={value}
        cacheUniqs={[value, excludeMemberId, onlyActivePackage]}
        getOptionLabel={(option) => `${option?.name} - ${option?.code}`}
        getOptionValue={(option) => option?.id?.toString() || ""}
        debounceTimeout={500}
        noOptionsMessage={() =>
          onlyActivePackage
            ? "Tidak ada member berpaket aktif yang cocok"
            : "Member tidak ditemukan"
        }
        onChange={(val) => onChange(val as MemberDetail | null)}
      />
      {emptyAction}
    </div>
  )
}

export default MemberSearchPicker
