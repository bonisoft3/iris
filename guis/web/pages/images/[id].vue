<script setup lang="ts">
import { useRoute } from 'vue-router'
import ImageDetailsModal from './components/ImageDetailsModal.vue'
import { useTrashItemById } from '../../composables/useTrashItemById'
import type { TrashItem } from '#build/interfaces/trashItem'
import { useFetchElectricDonate } from '../../composables/useFetchElectricDonate'

const { t, locale } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const donatedItems = useFetchElectricDonate()
const trashItem = useTrashItemById(route.params.id as string)

async function fetchImageById(imageId: string): Promise<TrashItem | null> {
  const path = 'trashitempb?select=pbjson,id&id=eq.'
  const url = `${config.public.SERVICES_PGRST_URL_PREFIX + path}${imageId}`
  try {
    const response = await $fetch.raw(url, {
      headers: {
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact',
      },
    })

    return response.ok ? (response._data as TrashItem[])[0]! : null
  }
  catch (error) {
    console.error('Network error:', error)
    return null
  }
}

interface TranslationInterface {
  translations: {
    caption: string
    disposalInstructions: string
  }
}

async function fetchTranslatedTrashItem(language: string): Promise<string[] | null> {
  const apiPath = 'trash.tracker.v1.TrackerService/TranslateOnDemand'
  const apiUrl = config.public.SERVICES_TRACKER_URL_PREFIX + apiPath
  const response: any = await $fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      itemId: route.params.id,
      targetLanguage: language,
    },
  })
  const path = `trashitemtranslations?select=translations&id=eq.${response.translationId}`
  const pgUrl = config.public.SERVICES_PGRST_URL_PREFIX + path
  const data = await $fetch.raw(pgUrl, {
    headers: {
      'Range-Unit': 'items',
      'Range': '0-0',
      'Prefer': 'count=exact',
    },
  })

  if (data._data) {
    const translations: TranslationInterface[] = data._data as TranslationInterface[]
    return [translations[0]!.translations.caption, translations[0]!.translations.disposalInstructions]
  }
  return null
}

if (import.meta.server) {
  const metaData = await fetchImageById(route.params.id as string)

  if (metaData?.pbjson?.caption && locale.value !== 'en') {
    const translations = await fetchTranslatedTrashItem(locale.value)
    if (translations) {
      metaData.pbjson.caption = translations[0] ?? ''
      metaData.pbjson.disposalInstructions = translations[1] ?? ''
    }
  }

  if (metaData?.pbjson) {
    const { caption, disposalInstructions, picture, id } = metaData.pbjson
    const description = disposalInstructions
      ? `${t('how_to_dispose')}:\n${disposalInstructions}`
      : caption

    useHead({
      title: caption,
      meta: [
        { name: 'description', content: description },
        { property: 'og:title', content: caption },
        { property: 'og:description', content: description },
        { property: 'og:image', content: picture },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: `https://iris.cleaning/images/images/${id}` },
      ],
    })
  }
}
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
