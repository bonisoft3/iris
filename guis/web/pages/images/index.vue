<script setup lang="ts">
import { useRoute } from 'vue-router'
import ImageDetailsModal from './components/ImageDetailsModal.vue'
import { useTrashItemById } from '../../composables/useTrashItemById'
import type { TrashItem } from '#build/interfaces/trashItem'
import { useFetchElectricDonate } from '../../composables/useFetchElectricDonate'

const route = useRoute()
const donatedItems = await useFetchElectricDonate()
const trashItem = useTrashItemById(route.params.id as string)
function updateMetaTags(item: TrashItem) {
  const imgUuid = item.pbjson.picture.endsWith('.jpg')
    ? item.pbjson.picture.split('/')?.pop()?.slice(0, -4)
    : item.pbjson.picture.split('/').pop()

  const domain = `https://iris.cleaning/images/${imgUuid}`

  useHead({
    meta: [
      { property: 'og:description', content: item.pbjson.caption },
      { property: 'og:url', content: domain },
      { property: 'og:image', content: item.pbjson.picture }
    ]
  })
}

watch(
  trashItem,
  (newTrashItem) => {
    if (newTrashItem) updateMetaTags(newTrashItem)
  },
  { immediate: true }
)
</script>

<template>
  <div id="image-modal-gtm" class="image-container modal" style="background-color: black">
    <div class="modal-content">
      <ClientOnly>
        <ImageDetailsModal
          :trash-item="trashItem"
          :image="trashItem?.pbjson.picture || ''"
          :donated-items="donatedItems"
          :key="trashItem?.id"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.modal {
  min-height: 100vh;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

:deep(#page-wrapper) {
  width: inherit !important;
}

:deep(#page) {
  width: inherit !important;
}

:deep(.details) {
  width: inherit !important;
}

.modal-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(234, 245, 244);
}

.modal-title {
  margin-top: 2%;
  font-size: 22px;
  color: #fff;
  font-weight: 400;
}

.modal-title i {
  color: #fff;
  text-decoration: none;
  font-size: 22px;
  align-self: center;
}

.modal-content img {
  min-height: 10%;
  object-fit: contain;
  border-radius: 3%;
}

.modal-button-right v-icon {
  margin-right: 5px;
}

@media only screen and (min-width: 768px) {
  .modal-content {
    width: 350px;
  }
}
</style>
