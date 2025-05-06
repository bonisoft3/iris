<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const { t } = useI18n()

const router = useRouter()
const shouldDisplayHeading = computed(() => {
  return router.currentRoute.value.path.split('/').pop() !== t('intro')
    && router.currentRoute.value.path.split('/').pop() !== t('camera')
    && router.currentRoute.value.path.split('/').pop() !== t('tips')
    && router.currentRoute.value.path.split('/').pop() !== t('your_disposal_places')
})

const shouldDisplayNavFooter = computed(() => {
  return router.currentRoute.value.path.split('/').pop() !== t('intro')
    && router.currentRoute.value.path.split('/').pop() !== t('camera')
    && router.currentRoute.value.path.split('/').pop() !== t('tips')
    && router.currentRoute.value.path.split('/').pop() !== t('your_disposal_places')
})
</script>

<template>
  <div class="app-wrapper">
    <Heading v-if="shouldDisplayHeading" />
    <slot />
    <NavFooter v-if="shouldDisplayNavFooter" />
  </div>
</template>

<style>
.app-wrapper {
  background: linear-gradient(0deg, rgba(0, 107, 86, 0.05), rgba(0, 107, 86, 0.05)), var(--secondary-color);
}
</style>
