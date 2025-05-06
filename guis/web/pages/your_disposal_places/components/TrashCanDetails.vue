<script setup lang="ts">
import { format } from 'date-fns'
import getCityAndNeighborhood from '../../../utils/getCityAndNeighborhood'
import type { DisposalPlace } from '#build/interfaces/disposalPlace'

const props = defineProps<{
  disposalPlace: DisposalPlace
}>()

defineEmits(['closeModal'])

const config = useRuntimeConfig()
const mapPosition = `https://www.google.com/maps/embed/v1/place?q=${props.disposalPlace.latlng.latitude},${props.disposalPlace.latlng.longitude}&key=${config.public.MAPS_EMBED_API_KEY}`
const hoursAndMinutes = format(new Date(props.disposalPlace.createdon), 'kk:mm')
const city = ref('')
const neighborhood = ref('')

onMounted(async () => {
  const geocode = await getCityAndNeighborhood(props.disposalPlace.latlng.latitude, props.disposalPlace.latlng.longitude, config)
  city.value = geocode.results[0].address_components[4].long_name
  neighborhood.value = geocode.results[0].address_components[2].long_name
})
</script>

<template>
  <div class="modal-mask">
    <div class="details-wrapper pa-2 mx-auto primary-bg">
      <button class="mb-2 my-2" @click="$emit('closeModal')">
        <v-icon icon="mdi-arrow-left" color="#003C71" size="large" />
      </button>
      <p class="mb-2 ml-1 font-weight-medium">
        {{ props.disposalPlace.materialtype }}
      </p>
      <v-divider class="my-2 border-opacity-100" color="#BFC9C3" />
      <div class="image-container">
        <NuxtImg
          class="image-thumb"
          sizes="xs:100px sm:200px md:400px lg:700px xl:900px"
          provider="cloudflare"
          format="webp"
          :src="props.disposalPlace?.imgurl"
          placeholder
        />
      </div>
      <iframe :src="mapPosition" width="100%" height="124" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade" />
      <h2 class="text-left mb-2 ml-1 text-sm-1xl font-weight-medium">
        {{ city }} - {{ neighborhood }} • {{ hoursAndMinutes }}
      </h2>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  position: absolute;
  z-index: 4;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
}
.details-wrapper {
  width: 350px;
  height: 100%;
}

.image-container {
  position: relative;
}

@media (orientation: landscape) {
  .image-thumb {
    max-width: 100%;
    width: 100vw;
    height: 44vh;
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: 5px;
  }
}

@media (orientation: portrait) {
  .image-thumb {
    max-width: 100%;
    width: 100vw;
    height: 22vh;
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: 5px;
  }
}
</style>
