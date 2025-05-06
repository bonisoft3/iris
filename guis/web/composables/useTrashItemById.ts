import { ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { TrashItem } from '#build/interfaces/trashItem'

export function useTrashItemById(id: string) {
  const trashItem = ref<TrashItem | null>(null)

  const queryClient = useQueryClient()
  const allTrashItems = queryClient.getQueryData<TrashItem[]>(['trashItems']) || []
  trashItem.value = allTrashItems?.find(item => item.id === id) || null

  if (trashItem.value) return trashItem

  return useFetchElectricImage(id)
}
