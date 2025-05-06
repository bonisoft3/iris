<script setup lang="ts">
import type { DisposalPlace } from '../../interfaces/disposalPlace'
import getDisposalPlacesFromUser from '../../utils/getDisposalPlacesFromUser'
import ImageComponent from '../images/components/ImageComponent.vue'
import TrashCanDetails from './components/TrashCanDetails.vue'

const { t } = useI18n()
const config = useRuntimeConfig()
const router = useRouter()
const user = await getCurrentUser()
const disposalPlaces = ref<Array<DisposalPlace> | null>(null)
const show = ref(false)
const showTrashCanDetails = ref(false)
const disposalPlaceToShow = ref<DisposalPlace | null>(null)

function openTrashCanDetails(idx: number) {
  if (disposalPlaces.value)
    disposalPlaceToShow.value = disposalPlaces.value[idx]
  showTrashCanDetails.value = true
}

onMounted(async () => {
  const path = `disposalplace?userid=eq.${user.uid}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  disposalPlaces.value = await getDisposalPlacesFromUser(url)
  show.value = true
})
</script>

<template>
  <Transition name="slide-left" mode="out-in">
    <v-row v-if="show" class="component-wrapper mx-auto mt-3">
      <div class="d-flex pa-4 font-weight-medium">
        <v-icon icon="mdi-arrow-left mr-5" @click="router.go(-1)" />
        {{ t('your_disposal_places_txt') }}
      </div>
      <v-col v-for="(disposalPlace, idx) in disposalPlaces" :key="disposalPlace.id" class="ma-0 pa-1 d-flex" cols="12">
        <ImageComponent class="img-component mr-2 w-50" :image-bucket-url="disposalPlace.imgurl" props-height="180px" :label="null" @click="openTrashCanDetails(idx)" />
        <iframe
          :src="`https://www.google.com/maps/embed/v1/place?q=${disposalPlace.latlng.latitude},${disposalPlace.latlng.longitude}&key=${config.public.MAPS_EMBED_API_KEY}`"
          width="50%"
          height="100%"
          frameborder="5px"
          style="border: 0;"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </v-col>
      <p class="py-2 w-100 font-weight-medium text-center">
        {{ t('info_not_shared_with_others') }}
      </p>
    </v-row>
  </Transition>
  <TrashCanDetails v-if="showTrashCanDetails && disposalPlaceToShow" :disposal-place="disposalPlaceToShow" @close-modal="() => { showTrashCanDetails = !showTrashCanDetails }" />
</template>

<style scoped>
.component-wrapper {
  max-width: 800px;
  color: #003C71BF;
}

.img-component {
  cursor: pointer;
}
</style>
