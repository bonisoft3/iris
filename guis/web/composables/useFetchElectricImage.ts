import { ref, watch } from 'vue'
import type { TrashItem } from '#build/interfaces/trashItem'
import { useShape } from './useShape'

export function useFetchElectricImage(imageId: string) {
  const trashItem = ref<TrashItem | null>(null)
  const config = useRuntimeConfig()

  const urlPath = config.public.ELECTRIC_SQL_URL + 'v1/shape'
  const options = {
    url: urlPath,
    table: 'trashitempb',
    where: `id = '${imageId}'`,
  }

  const abortController = new AbortController()
  const signal = abortController.signal

  const shapeData = useShape({ ...options, signal })

  watch(
    () => shapeData.value.data,
    (newData) => {
      if (newData && newData.length > 0) {
        trashItem.value = newData[0] as unknown as TrashItem
        if (trashItem.value?.pbjson?.label) {
          abortController.abort()
        }
      }
    },
    { immediate: true }
  )

  return trashItem
}
