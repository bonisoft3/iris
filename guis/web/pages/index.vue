<script lang="ts">
import { onMounted } from 'vue'
import LogRocket from 'logrocket'
import { GoogleMap, Marker } from 'vue3-google-map'
import WasteCategory from '../components/WasteCategory.vue'
import EmptyGallery from '../components/EmptyGallery.vue'
import prevRoute from '../utils/prevRoute'
import type { Map, MapN } from '../interfaces/Map'
import logger from '../utils/logger'
import type { DisposalPlace } from '../interfaces/disposalPlace'
import getDisposalPlacesFromUser from '../utils/getDisposalPlacesFromUser'

export default {
  beforeRouteEnter(_: any, from: any) {
    prevRoute.value = from
  },
}
</script>

<script setup lang="ts">
const localePath = useLocalePath()

definePageMeta({
  middleware: ['vuefire-auth'],
})

interface Label {
  label: string
}

interface WasteCategoryInterface {
  icon: string
  style: string
  title: string
  description: string
}

interface Post {
  id: number
  title: string
  text: string
}

const { t, tm } = useI18n()
const contentReady = ref(false)
const show = ref(false)
const prefix = ref('')
const curiosity = ref('')
const curiosities: Post[] = tm('posts')
const curiositiesLength = curiosities.length
const userData = await getCurrentUser()
const config = useRuntimeConfig()
const wasteCategories: Ref<Array<WasteCategoryInterface>> = ref([])
const wasteCategoriesLength = ref(0)
const wasteCategoriesText = ref('')
const disposalPlaces = ref<Array<DisposalPlace> | null>(null)
const center = ref<{ lat: number, lng: number }>({ lat: 0, lng: 0 })

function getWasteCategoryFromLabel(label: string) {
  const icon: Map = {
    organic: 'mdi-compost',
    recyclable: 'mdi-recycle',
    trash: 'mdi-trash-can-outline',
    non_recyclable: 'mdi-alert-rhombus-outline',
    eletronic: 'mdi-devices',
  }
  const style: Map = {
    organic: 'background-color: #3EBF9E;',
    recyclable: 'background-color: #C4E7FF;',
    trash: 'background-color: #E1E2E5;',
    non_recyclable: 'background-color: #FF897D;',
    eletronic: 'background-color: #B37BCC;',
  }
  const title: Map = {
    organic: t('waste_category_organic'),
    recyclable: t('waste_category_recyclable'),
    trash: t('waste_category_trash'),
    non_recyclable: t('waste_category_non_recyclable'),
    eletronic: t('waste_category_ewaste'),
  }
  const description: Map = {
    organic: t('waste_category_organic_desc'),
    recyclable: t('waste_category_recyclable_desc'),
    trash: t('waste_category_trash_desc'),
    non_recyclable: t('waste_category_non_recyclable_desc'),
    eletronic: t('waste_category_ewaste_desc'),
  }

  return {
    icon: icon[label],
    style: `${style[label]} border-radius: 50%;`,
    title: title[label],
    description: description[label],
  }
}

async function fetchPredominantDiscardingTypes(): Promise<Label[]> {
  const path = `trashitempb?select=pbjson->>label&pbjson->>userId=eq.${userData.uid}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  const data = await $fetch.raw(url)

  return data._data as Label[]
}

async function getPredominantDiscardingTypes() {
  const discardingTypesArray: Array<Label> = await fetchPredominantDiscardingTypes()
  const labels: Array<string> = discardingTypesArray.filter(label => label.label != null).map(label => label.label.trim().replace(/\n$/, ''))

  const countObj = labels.reduce((accumulator: MapN, str) => {
    accumulator[str] = (accumulator[str] || 0) + 1
    return accumulator
  }, {})

  const predominantDiscardingTypes = Object.entries(countObj).map(([key, value]) => ({ [key]: value }))

  predominantDiscardingTypes.sort((a, b) => {
    const keyA = Object.keys(a)[0]
    const keyB = Object.keys(b)[0]

    return b[keyB] - a[keyA]
  })

  return predominantDiscardingTypes.slice(0, 3).map(a => Object.keys(a)).flat()
}

function randomizeCuriosity() {
  const curiosity = curiosities[Math.floor(Math.random() * curiositiesLength)]
  return `${curiosity.title}`
}

function getCenterForDisposalPlace(disposalPlaces: DisposalPlace[]): { lat: number, lng: number } {
   if (!disposalPlaces || disposalPlaces.length === 0) {
    return { lat: 0, lng: 0 };
  }
  const randomIndex = Math.floor(Math.random() * disposalPlaces.length)
  const disposalPlace = disposalPlaces[randomIndex]
  const lat = disposalPlace.latlng.latitude
  const long = disposalPlace.latlng.longitude

  return { lat, lng: long }
}

onMounted(async () => {
  show.value = true
  const predominantDiscardingTypes = await getPredominantDiscardingTypes()
  logger.info('Welcome to Iris!')
  LogRocket.init('v8rkrf/iris')
  const userData = useCurrentUser()
  if (userData.value) {
    LogRocket.identify(userData.value.uid, {
      name: userData.value.displayName ?? 'ERR_GETTING_USER',
      email: userData.value.email ?? 'ERR_GETTING_EMAIL',
    })
  }
  curiosity.value = randomizeCuriosity()
  if (!userData.value?.isAnonymous && userData.value?.displayName)
    curiosity.value = curiosity.value.charAt(0).toLowerCase() + curiosity.value.substring(1)
  userData.value?.isAnonymous || !userData.value?.displayName ? prefix.value = '' : prefix.value = `Hey, ${userData.value?.displayName}, `
  curiosity.value = prefix.value + curiosity.value
  wasteCategories.value = predominantDiscardingTypes.map(discardingType => getWasteCategoryFromLabel(discardingType))
  wasteCategoriesLength.value = wasteCategories.value.length
  wasteCategoriesText.value = `${t('your_top')}${wasteCategoriesLength.value}${t('waste_categories')}`
  const path = `disposalplace?userid=eq.${userData.value?.uid}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  disposalPlaces.value = await getDisposalPlacesFromUser(url)
  center.value = getCenterForDisposalPlace(disposalPlaces.value as DisposalPlace[])

  contentReady.value = true
})
</script>

<template>
  <div v-if="show" class="d-flex flex-column w-100 align-center">
    <div class="w-100" style="max-width: 800px">
      <div class="header">
        <div class="secundary-bg pa-3 pb-8 w-100 bg-image-logo" style="position: relative;">
          <h1 class="white--text font-weight-400 text-base ml-4 mr-1 mb-4">
            {{ curiosity }}
          </h1>
          <div class="d-flex justify-end pr-6 mb-2">
            <NuxtLink :to="localePath({ name: 'posts' })">
              <v-icon class="mr-2 mt-1 text-sm">
                mdi-arrow-right
              </v-icon>
              <span class="white--text text-sm">{{ t('learn_more') }}</span>
            </NuxtLink>
          </div>
          <div v-show="contentReady" class="waste-categories-wrapper py-5">
            <WasteCategory v-for="(wasteCategory, index) in wasteCategories" :key="index" :waste-category="wasteCategory" />
            <div class="d-flex px-4 mt-2 flex-column" style="color: #003C71BF">
              <p class="my-4">
                Your disposal places
              </p>
              <div v-if="!disposalPlaces" class="empty-box d-flex w-100 pa-10 flex-column justify-center">
                <p class="text-center">
                  {{ t('ops_empty') }}
                </p>
                <p class="text-center">
                  {{ t('you_can_keep_a_record') }}
                </p>
              </div>
              <NuxtLink v-if="disposalPlaces" :to="localePath('your_disposal_places')">
                <GoogleMap
                  :zoom="16"
                  :center="center"
                  :disable-default-ui="true"
                  style="width: 100%; height: 25vh;"
                  :api-key="config.public.GOOGLE_MAPS_API_KEY"
                >
                  <Marker :options="{ position: center }" />
                </GoogleMap>
              </NuxtLink>
            </div>
          </div>
          <div v-if="!contentReady" class="waste-categories-wrapper py-5 d-flex justify-center align-items-center">
            <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  color: #fff;
  width: 100%;
  max-width: 800px;
}

.empty-box {
  background-color: #003C711A;
  height: 145px;
}

.header a {
  color: #fff;
  text-decoration: none;
}

.bg-image-logo {
  background-image: url('../assets/images/logo-animated.png');
  background-repeat: no-repeat;
  background-position: right 25%;
  box-shadow: 0px 4px 4px 0px #00000040;
}

.waste-categories-wrapper {
  background-color: #FFFFFF;
  position: absolute;
  left: 0;
  width: 100%;
  height: calc(99vh - 76px - 120px); /* Header height and banner height, respectively */
  border-radius: 32px 32px 0px 0px;
}

@media (max-height: 750px) {
  .waste-categories-wrapper {
    height: 75vh;
  }
}
</style>