<script setup lang="ts">
import { categories } from '../../../utils/imageCategories'

const props = defineProps<{
  imageBucketUrl: string
  label: string | null
}>()

const imageCategories = computed(() => {
  const category = categories(props.label?.trim() || '')
  return category
})

const backgroundStyle = computed(() => {
  return { 'background-color': imageCategories.value.color }
})
</script>

<template>
  <div class="image-container">
    <NuxtImg
      sizes="xs:100px sm:200px md:400px lg:700px xl:900px"
      provider="cloudflare"
      format="webp"
      :src="props.imageBucketUrl"
      placeholder
    />
    <div v-if="props.label" class="tag" :style="backgroundStyle">
      <img :src="imageCategories.icon" style="opacity: 0.5;" height="18" width="18">
    </div>
  </div>
</template>

<style scoped>
.tag {
  width: 32px;
  height: 32px;
  position: absolute;
  top: 10px;
  left: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tag img {
  width: 16px !important;
  height: 16px !important;
}

.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  width: 500px;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
  border-radius: 5px;
}
</style>
