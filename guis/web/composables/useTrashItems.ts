import { useShape } from "./useShape";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Row } from "@electric-sql/client";
import type { TrashItem } from "#build/interfaces/trashItem";

function getAllTrashItems(data: Row[]): TrashItem[] {
  if (!data) return []

  return data.sort((a: Row, b: Row) => {
    return new Date(b.ts as string).getTime() - new Date(a.ts as string).getTime()
  }) as unknown as TrashItem[]
}

export default function useGlobalPics() {
  const config = useRuntimeConfig()
  const queryClient = useQueryClient()

  const urlPath = config.public.ELECTRIC_SQL_URL + 'v1/shape'
  const options = {
    url: urlPath,
    table: 'trashitempb',
  }

  const shapeData = useShape(options);

  const { data, isPending: isPedingQuery, isError } = useQuery({
    queryKey: ['trashItems'],
    queryFn: () => {
      return Promise.resolve(
        getAllTrashItems(shapeData.value?.data)
      )
    },
    enabled: !!shapeData.value
  })

  const trashItems = computed<TrashItem[]>(() => data.value || [])
  const isPending = computed(() => shapeData.value.isLoading || isPedingQuery.value)

  watch(
    () => shapeData.value?.data,
    () => {
      queryClient.invalidateQueries({ queryKey: ['trashItems'] })
    }
  )

  return {
    trashItems,
    isPending,
    isError
  }
}
