<script setup lang="ts">
import LoggedAsGuest from '../../../components/LoggedAsGuest.vue'
import EmptyGallery from '../../../components/EmptyGallery.vue'
import MasonryWallComponent from '../../../components/MasonryWallComponent.vue'
import type { TrashItem } from '#build/interfaces/trashItem'

const props = defineProps<{
  loggedAsGuest: boolean
  trashItems: TrashItem[]
}>()

const itemsPerPage = 15
const currentPage = ref(Number(sessionStorage.getItem('userGallery-savedPage')) || 1)
const savedScroll = ref(Number(sessionStorage.getItem('userGallery-savedScroll')) || 0)

const end = computed(() => currentPage.value * itemsPerPage)
const paginedPictures = computed(() => props.trashItems.slice(0, end.value) || [])

function handleScroll() {
  savedScroll.value = window.scrollY

  if (paginedPictures.value.length >= props.trashItems.length) return

  const bottomOfWindow = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
  if (bottomOfWindow) {
    currentPage.value++
  }
}

watchEffect(() => {
  sessionStorage.setItem('userGallery-savePage', String(currentPage.value))
  sessionStorage.setItem('userGallery-saveScroll', String(savedScroll.value))
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
  <div v-if="loggedAsGuest" class="center-container">
    <LoggedAsGuest />
  </div>
  <div v-else-if="trashItems.length === 0" class="empty-container">
    <EmptyGallery :use-title-for-empty-gallery="true" />
  </div>
  <MasonryWallComponent v-else :items="paginedPictures" />
</template>

<style scoped>
h1 {
  color: var(--text-primary-color);
  font-size: 18px;
  margin-top: 2rem;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
}

.row {
  margin: 4px 10px 4px 10px;
  margin-left: 0;
  padding-left: 0;
  display: block;
}
</style>
