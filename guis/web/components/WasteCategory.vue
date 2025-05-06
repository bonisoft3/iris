<script setup lang="ts">
import type { PropType } from 'vue'

interface WasteCategory {
  icon: string
  style: string
  title: string
  description: string
}

const props = defineProps({
  wasteCategory: Object as PropType<WasteCategory>,
})
</script>

<template>
  <div class="d-flex align-center px-4 py-1">
    <div :style="props.wasteCategory?.style" class="pa-2 mr-4">
      <v-icon :icon="props.wasteCategory?.icon" color="#627480" size="x-large" />
    </div>
    <div>
      <p class="font-weight-bold txt-color">
        {{ props.wasteCategory?.title }}
      </p>
      <p class="font-weight-regular txt-color text-subtitle-2">
        {{ props.wasteCategory?.description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.txt-color {
  color: #003C71BF;
}
</style>
