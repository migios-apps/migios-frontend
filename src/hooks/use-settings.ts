import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiGetSettings } from "@/services/api/settings/settings"
import { QUERY_KEY } from "@/constants/queryKeys.constant"

export function useSettings() {
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [QUERY_KEY.settings],
    queryFn: () => apiGetSettings(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  })

  return {
    settings: data,
    isLoading,
    isFetching,
    error,
    invalidateSettings: () =>
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.settings] }),
  }
}
