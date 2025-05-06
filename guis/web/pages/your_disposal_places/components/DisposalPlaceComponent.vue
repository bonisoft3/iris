<script setup lang="ts">
import ImageComponent from '../../images/components/ImageComponent.vue'
import type { DisposalPlace } from '#build/interfaces/disposalPlace'

const _props = defineProps<{
  disposalPlace: DisposalPlace
}>()

const config = useRuntimeConfig()
</script>

<template>
  <div class="disposal-place-card ml-3">
    <v-row>
      <v-col class="v-col-4 p-5 mb-5">
        <ImageComponent class="img-component  mt-2 ml-2 " :image-bucket-url="disposalPlace.imgurl" props-height="108px" props-width="108px" :label="null" />
      </v-col>
      <v-col class="v-col-8">
        <iframe
          :src="`https://www.google.com/maps/embed/v1/place?q=${disposalPlace.latlng.latitude},${disposalPlace.latlng.longitude}&key=${config.public.MAPS_EMBED_API_KEY}`"
          width="190px"
          height="108px"
          style="border:0; border-radius: 4px;"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          class="mt-2"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
 .v-col {
  padding: 0px;
}
</style>
