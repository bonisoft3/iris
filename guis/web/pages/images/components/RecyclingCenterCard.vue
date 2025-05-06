<script setup lang="ts">
import NearbyRecyclingCenterInfo from './NearbyRecyclingCenterInfo.vue'

const props = defineProps({
  nearbyRecyclingCenters: Array<Place>,
})

const { t } = useI18n()

interface Place {
  name: string
  formattedAddress: string
  distance: string
  placeId: string
  phoneNumber: string
}
</script>

<template>
  <div class="mx-2 text-white card">
    <h2 class="text-subtitle-1 px-4 pt-4 mb-2 font-weight-medium">
      {{ t('who_could_receive') }}
    </h2>
    <div v-for="(recyclingCenter, index) in props.nearbyRecyclingCenters" :key="index">
      <NearbyRecyclingCenterInfo :recycling-center="recyclingCenter" />
      <v-divider v-if="index < props.nearbyRecyclingCenters!.length - 1" class="w-100 border-opacity-100 my-3" color="#BFC9C3" thickness="1px" />
    </div>
  </div>
</template>

<style scoped>
.card {
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15),
  0px 1px 2px rgba(0, 0, 0, 0.3);
  background-color: #0CA385;
  border-radius: 8px;

}
</style>
