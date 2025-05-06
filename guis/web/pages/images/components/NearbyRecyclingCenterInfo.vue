<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  recyclingCenter: Object as PropType<RecyclingCenter>,
})

interface PlaceOpenRes {
  open: boolean
}

const link = ref('')
const config = useRuntimeConfig()
const placeOpen = ref(false)
const show = ref(false)
const { t } = useI18n()

interface RecyclingCenter {
  name: string
  formattedAddress: string
  distance: string
  placeId: string
  phoneNumber: string
}
async function getPlaceOpen(): Promise<boolean> {
  if (!props.recyclingCenter)
    return false
  const path = '/trash.tracker.v1.TrackerService/PlaceOpen'
  const url = config.public.SERVICES_TRACKER_URL_PREFIX + path

  try {
    const response: PlaceOpenRes = await $fetch(url, {
      method: 'POST',
      body: {
        placeId: props.recyclingCenter.placeId,
      },
    })

    placeOpen.value = response.open
    return placeOpen.value
  } catch (error) {
    console.error('Error fetching place open status:', error)
    return false
  }
}

onMounted(async () => {
  placeOpen.value = await getPlaceOpen()
  link.value = `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${props.recyclingCenter?.placeId}`
  show.value = true
})
</script>

<template>
  <div class="d-flex align-center ml-4">
    <v-icon class="mr-3" icon="mdi-map-marker" size="small" />
    <p class="text-left text-subtitle-2 font-weight-medium pr-4">
      {{ props.recyclingCenter?.name }}
    </p>
  </div>
  <p class="ml-12 pr-4 text-caption">
    {{ props.recyclingCenter?.formattedAddress }} • {{ props.recyclingCenter?.distance }}
  </p>
  <div v-if="props.recyclingCenter?.phoneNumber" class="d-flex align-center ml-4 mt-2 mb-2">
    <v-icon icon="mdi-phone mr-3" size="small" />
    <p class="text-caption">
      {{ t('phone') }}: {{ props.recyclingCenter?.phoneNumber }}
    </p>
  </div>
  <div class="mb-2">
    <a :href="link" target="_blank" class="text-left text-decoration-none ml-4">
      <v-icon class="mr-3" icon="mdi-arrow-top-right" color="#FFFFFF" size="small" />
      <span class="address-maps text-white text-decoration-none text-caption">{{ t('address_on_maps') }}</span>
    </a>
  </div>
  <Transition name="slide-left">
    <div v-if="show" class="d-flex ml-4 align-center mb-2">
      <v-icon icon="mdi-circle" :color="placeOpen ? '#00FF00' : '#FF0000'" class="mr-4" size="x-small" />
      <span class="text-caption">{{ placeOpen ? t('open') : t('closed') }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.address-maps {
  vertical-align: middle;
}
</style>
