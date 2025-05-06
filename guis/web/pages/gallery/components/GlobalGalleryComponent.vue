<script setup lang="ts">
import MasonryWallComponent from '../../../components/MasonryWallComponent.vue'
import EmptyGallery from '../../../components/EmptyGallery.vue'
import type { TrashItem } from '#build/interfaces/trashItem'

const { t } = useI18n()
const props = defineProps<{
  trashItems: TrashItem[]
}>()

const itemsPerPage = 15
const currentPage = ref(Number(sessionStorage.getItem('globalGallery-savePage')) || 1)
const savedScroll = ref(Number(sessionStorage.getItem('globalGallery-saveScroll')) || 0)

const end = computed(() => currentPage.value * itemsPerPage)
const paginedPictures = computed(() => props.trashItems.slice(0, end.value))

function handleScroll() {
  savedScroll.value = window.scrollY
  if (paginedPictures.value.length >= props.trashItems.length) return

  const bottomOfWindow = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
  if (bottomOfWindow) {
    currentPage.value++
  }
}

watchEffect(() => {
  sessionStorage.setItem('globalGallery-savePage', String(currentPage.value))
  sessionStorage.setItem('globalGallery-saveScroll', String(savedScroll.value))
})

onMounted(() => {
  // Waits before restoring the scroll position to ensure the page has loaded properly
  setTimeout(() => {
    window.scrollTo({ top: savedScroll.value, behavior: 'instant' })
  }, 50)
})

onActivated(() => {
  window.scrollTo({ top: savedScroll.value, behavior: 'instant' })
  window.addEventListener('scroll', handleScroll)
})

onDeactivated(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div>
    <p class="disclaimer font-weight-medium pt-4">
      {{ t('disclaimer') }}
    </p>
    <div v-if="trashItems.length === 0" class="empty-container">
      <EmptyGallery :use-title-for-empty-gallery="true" />
    </div>
    <MasonryWallComponent v-else :items="paginedPictures" />
  </div>
</template>

<style scoped>
.disclaimer {
  text-align: center;
  color: #003C71BF;
}

.row {
  margin: 4px 10px 4px 10px;
  margin-left: 0;
  padding-left: 0;
  display: block;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}
</style>
