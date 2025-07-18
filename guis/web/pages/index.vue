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
import { useQuery } from '@tanstack/vue-query'


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
const show = ref(false)
const curiosity = ref('')
const curiosities: Post[] = tm('posts')
const curiositiesLength = curiosities.length
const userData = await getCurrentUser()
const config = useRuntimeConfig()


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

  const topDiscardingKeys = predominantDiscardingTypes.slice(0, 3).map(a => Object.keys(a)).flat()

  return topDiscardingKeys.map(discardingType => getWasteCategoryFromLabel(discardingType))
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

const { isPending: isPendingPredominantTypes, data: predominantTypesData } = useQuery({
  queryKey: ['predominantDiscardingTypes'],
  queryFn: getPredominantDiscardingTypes,
  enabled: !!userData,
  staleTime: 0
})

const {
  isPending: isPendingDisposalPlaces,
  data: disposalPlacesData
} = useQuery({
  queryKey: ['disposalPlaces'],
  queryFn: async () => {
    const path = `disposalplace?userid=eq.${userData.uid}`
    const url = config.public.SERVICES_PGRST_URL_PREFIX + path
    return getDisposalPlacesFromUser(url)
  },
  enabled: !!userData,
  staleTime: 0
})

const wasteCategories = computed(() => predominantTypesData.value || [])
const centerDisposalPlaces = computed(() => getCenterForDisposalPlace(disposalPlacesData.value as DisposalPlace[]))

function generatePersonalizedCuriosity(userData : any) {
  const randomCuriosity = randomizeCuriosity()
  if (!userData || userData.isAnonymous || !userData.displayName) return randomCuriosity
  const formattedCuriosity = randomCuriosity.charAt(0).toLowerCase() + randomCuriosity.substring(1)
  return `Hey, ${userData.displayName}, ${formattedCuriosity}`
}

function initLogRocket() {
  LogRocket.init('v8rkrf/iris')
  if (userData) {
    LogRocket.identify(userData.uid, {
      name: userData.displayName ?? 'ERR_GETTING_USER',
      email: userData.email ?? 'ERR_GETTING_EMAIL',
    })
  }
}

onMounted(() => {
  show.value = true
  logger.info('Welcome to Iris!')
  initLogRocket()
  curiosity.value = generatePersonalizedCuriosity(userData)
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
          <div v-if="wasteCategories.length > 0" class="waste-categories-wrapper py-5">
            <WasteCategory v-for="(wasteCategory, index) in wasteCategories" :key="index" :waste-category="wasteCategory" />
            <NuxtLink v-if="centerDisposalPlaces.lat != 0 && centerDisposalPlaces.lng != 0" :to="localePath('your_disposal_places')">
              <GoogleMap
                :zoom="16"
                :center="centerDisposalPlaces"
                :disable-default-ui="true"
                style="width: 100%; height: 25vh;"
                :api-key="config.public.GOOGLE_MAPS_API_KEY"
              >
                <Marker :options="{ position: centerDisposalPlaces }" />
              </GoogleMap>
            </NuxtLink>
            <div v-else class="empty-box d-flex w-100 pa-10 flex-column justify-center">
              <span class="empty-icon">
                <v-icon>mdi-trash-can-outline</v-icon>
              </span>
              <h2 class="primary-text text-center font-weight-400 text-base mb-2">
                {{ t('ops_empty') }}
              </h2>
              <p class="text-center">
                {{ t('you_can_keep_a_record') }}
              </p>
            </div>
          </div>
          <div v-else class="waste-categories-wrapper py-5 d-flex justify-center flex-column">
            <EmptyGallery :use-title-for-empty-gallery="false" />
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
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
  color: #222;
  min-height: 145px;
  border-radius: 18px;
  box-shadow: 0 4px 16px #0002;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: box-shadow 0.2s;
}

.empty-box:hover {
  box-shadow: 0 8px 24px #0003;
}

.empty-box .empty-icon {
  font-size: 2.5rem;
  color: #90caf9;
  margin-bottom: 0.5rem;
}

.empty-box p {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.01em;
}

.empty-box p:last-child {
  font-size: 1rem;
  font-weight: 400;
  color: #666;
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
