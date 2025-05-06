import { ref, watch } from 'vue'
import { useShape } from './useShape'

export function useFetchElectricDonate() {
  const donatedItems = ref<Array<{ id: string, userid: string, itemid: string }>>([])
  const config = useRuntimeConfig()

  const urlPath = config.public.ELECTRIC_SQL_URL + 'v1/shape'
  const options = {
    url: urlPath,
    table: 'donates',
  }
  const shapeData = useShape(options)
  watch(
    () => shapeData.value?.data,
    (newData) => {
      if (newData && newData.length > 0) {
        donatedItems.value = newData.map(item => ({
          id: String(item.id),
          userid: String(item.userid),
          itemid: String(item.itemid)
        }));
      }
    },
    { immediate: true }
  )
  return donatedItems
}
