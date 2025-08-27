<script setup lang="ts">
import ImageComponent from '../pages/images/components/ImageComponent.vue'
import type { TrashItem } from '#build/interfaces/trashItem'

const props = defineProps<{
  items: TrashItem[]
}>()

const localePath = useLocalePath()
</script>

<template>
  <div class="mt-4 masonry">
    <NuxtLink
      v-for="(item, index) in props.items"
      :key="index"
      :to="
        localePath({
          name: 'images-id',
          params: { id: item.id }
        })
      "
      class="item"
      :style="{ gridRowEnd: `span ${(index % 2) + 1}` }"
    >
      <ImageComponent :image-bucket-url="item.pbjson.picture" :label="String(item.pbjson.label)"  v-ripple="{  class: 'text-grey'  }"/>
    </NuxtLink>
  </div>
</template>

<style scoped>
.masonry {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  grid-auto-rows: 250px;
}

@media (max-width: 600px) {
  .masonry {
    grid-auto-rows: 200px;
  }
}

.item {
  padding: 4px;
  display: flex;
  height: 100%;
}
</style>
