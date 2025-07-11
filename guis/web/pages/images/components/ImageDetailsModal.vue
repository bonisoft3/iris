<script setup lang="ts">
import haversine from 'haversine'
import type { Coordinate, Options } from 'haversine'
import { format } from 'date-fns'
import type { User } from 'firebase/auth'
import DisposalPlaceComponent from '../../your_disposal_places/components/DisposalPlaceComponent.vue'
import getDisposalPlacesFromUser from '../../../utils/getDisposalPlacesFromUser'
import { categories } from '../../../utils/imageCategories'
import getCityAndNeighborhood from '../../../utils/getCityAndNeighborhood'
import RecyclingCenterCard from './RecyclingCenterCard.vue'
import type { TrashItem } from '#build/interfaces/trashItem'
import type { DisposalInstructions } from '#build/interfaces/disposalInstructionsInterface'
import type { DisposalPlace } from '#build/interfaces/disposalPlace'
import type UserIris from '#build/interfaces/UserIris'
import { useShape } from "../../../composables/useShape";

const props = defineProps<{
  trashItem: TrashItem | null
  image: string
  donatedItems: Array<{ id: string, userid: string, itemid: string }> | null
}>()
const currentTrashItem = computed(() => props.trashItem)
const route = useRoute()
const imageSrc = computed(() => {
  if (props.image) {
    return props.image
  }
  const picture = route.query.picture
  if (Array.isArray(picture)) {
    return picture[0] || ''
  }
  return picture || ''
})
interface TranslationInterface {
  translations: {
    caption: string
    disposalInstructions: string
  }
}

interface AlreadyRegisteredInterfaceEndpoint {
  alreadyAskedForThisItem: boolean
}

const router = useRouter()
const localePath = useLocalePath()
const { locale } = useI18n()

const icon = ref('mdi-share-outline')
const user: User | null = await getCurrentUser()
const placeAlreadyRegistered = ref(false)
const show = ref(false)
const config = useRuntimeConfig()
const loading = ref(false)
const translateLoading = ref(false)
const failed = ref(false)
const triedToCreateDisposalPlace = ref(false)
const splittedSubclassifications = ref<Array<string>>([])
const splittedDisposalInstructions = ref<Array<DisposalInstructions>>()
const userDisposalPlaces = ref<DisposalPlace[] | undefined>(undefined)
const seeingOwnPicture = ref(false)
const mapPosition = ref('')
const hoursAndMinutes = format(props.trashItem?.pbjson.ts || new Date(), 'kk:mm')
const city = ref('')
const neighborhood = ref('')
const caption = ref<string | undefined>(props.trashItem?.pbjson.caption)
const disposalInstructions = ref<string | undefined>(props.trashItem?.pbjson.disposalInstructions)
const latlngAvailable = props.trashItem?.pbjson && 'latlng' in props.trashItem.pbjson
const userRegistered = ref(false)
const userAlreadyAskedForDonation = ref(true)
const relevantUnitValue = props.trashItem?.pbjson.price?.units && props.trashItem.pbjson.price.units >= 10
const { t } = useI18n()
const data = reactive({
  isExpanded: false
})
const infoLoading = ref(true)
const checkingDonability = ref(true)
const itemAvailable = ref(false)
window.sessionStorage.setItem('previousUrl', window.location.href)

async function fetchTranslatedTrashItem(language: string): Promise<string[] | null> {
  const config = useRuntimeConfig();
  const urlPath = config.public.ELECTRIC_SQL_URL + "v1/shape";
  const options = {
    url: urlPath,
    table: "trashitemtranslations",
  };
  const existingTranslations = useShape(options);
  if (existingTranslations.value?.data) {
    const foundTranslation = existingTranslations.value.data.find(
      (translation: any) =>
        translation.item_id === route.params.id &&
        translation.language === language
    );
    if (foundTranslation?.translations && typeof foundTranslation.translations === 'object' && 'caption' in foundTranslation.translations && 'disposalInstructions' in foundTranslation.translations)
    {
      return [
        String(foundTranslation.translations.caption ?? ''),
        String(foundTranslation.translations.disposalInstructions ?? '')
      ];
    }
  }

  const apiPath = 'trash.tracker.v1.TrackerService/TranslateOnDemand'
  const apiUrl = config.public.SERVICES_TRACKER_URL_PREFIX + apiPath
  const response: any = await $fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      itemId: route.params.id || (props.trashItem && props.trashItem.pbjson.id),
      targetLanguage: language
    }
  })
  const path = `trashitemtranslations?select=translations&id=eq.${response.translationId}`
  const pgUrl = config.public.SERVICES_PGRST_URL_PREFIX + path
  const data = await $fetch.raw(pgUrl, {
    headers: {
      'Range-Unit': 'items',
      Range: '0-0',
      Prefer: 'count=exact'
    }
  })

  if (data._data) {
    const translations: TranslationInterface[] = data._data as TranslationInterface[]
    return [translations[0].translations.caption, translations[0].translations.disposalInstructions]
  }
  return null
}

const imageCategories = computed(() => {
  const category = categories(props?.trashItem?.pbjson?.label?.trim() ?? '')
  return category
})

function capitalizeString(str: string | undefined) {
  if (!str) return ''
  return str.length < 1 ? str : str[0].toUpperCase() + str.slice(1)
}

function expandImage() {
  data.isExpanded = !data.isExpanded
}

function hideImageModal() {
  window.history.length > 1 ? router.back() : router.push('/gallery')
}

function clipboard() {
  navigator.clipboard.writeText(window.location.href)
  icon.value = 'mdi-check'
}

async function saveDisposalPlace() {
  const path = '/trash.tracker.v1.DisposalPlaceService/AddDisposalPlace'
  const url = config.public.SERVICES_TRACKER_URL_PREFIX + path
  triedToCreateDisposalPlace.value = true
  loading.value = true
  try {
    await $fetch(url, {
      method: 'POST',
      body: {
        disposalPlace: {
          userId: user?.uid,
          imgUrl: props.trashItem?.pbjson.picture,
          latlng: {
            latitude: props?.trashItem?.pbjson.latlng?.latitude || 0,
            longitude: props?.trashItem?.pbjson.latlng?.longitude || 0
          }
        }
      }
    })
    placeAlreadyRegistered.value = true
  } catch {
    failed.value = true
    setTimeout(() => {
      failed.value = false
    }, 3000)
  }
  loading.value = false
}

async function getDisposalPlacesRegisteredByUser(userId: string | undefined): Promise<Array<DisposalPlace>> {
  const path = `disposalplace?userid=eq.${userId ?? ''}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  const { data } = await useAsyncData(url, async () =>
    $fetch.raw(url, {
      headers: { 'Range-Unit': 'items', Prefer: 'count=exact' }
    })
  )

  return data.value?._data as Array<DisposalPlace>
}

function splitDisposalInstructions(disposalInstructions: string | undefined): Array<DisposalInstructions> | undefined {
  const splittedDisposalInstructions = disposalInstructions?.trim().split('\n')
  let formattedDisposalInstruction: Array<DisposalInstructions> | undefined = splittedDisposalInstructions?.map(
    (line) => {
      if (line.trim()) {
        const regex = /^([0-9!]+)\./
        const match = line.match(regex)
        let numberPart: string = ''
        let textPart: string = ''
        if (match) {
          numberPart = match[1]
          textPart = line.substring(match[0].length)
        }

        if (numberPart !== undefined && numberPart !== '' && textPart !== undefined && textPart !== '') {
          return {
            number: numberPart,
            title: textPart
          }
        }
      }
      return {
        number: '-',
        title: '-'
      }
    }
  )
  formattedDisposalInstruction = formattedDisposalInstruction?.filter(
    (item) => item && (item.number !== '-' || item.title !== '-')
  )
  return formattedDisposalInstruction
}

async function getNearbyUserDiposalPlaces(userId: string | undefined): Promise<DisposalPlace[] | undefined> {
  const path = `disposalplace?userid=eq.${userId ?? ''}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  const userDisposalPlaces = await getDisposalPlacesFromUser(url)
  const opts: Options = {
    threshold: 5,
    unit: 'km'
  }

  const nearbyUserDisposalPlaces = userDisposalPlaces
    ?.filter((userDisposalPlace) => {
      return haversine(props.trashItem?.pbjson?.latlng as Coordinate, userDisposalPlace.latlng, opts)
    })
    .slice(0, 4)
  return [nearbyUserDisposalPlaces]!.length > 0 ? nearbyUserDisposalPlaces : undefined
}

async function userAlreadyRegistered(firebaseId: string | undefined): Promise<boolean> {
  const path = `useriris?firebaseid=eq.${firebaseId ?? ''}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  const res = await fetch(url)
  const userIris: UserIris[] = await res.json()
  return userIris.length !== 0
}

async function registerDonation() {
  const path = 'trash.tracker.v1.TrackerService/RegisterDonation'
  const url = config.public.SERVICES_TRACKER_URL_PREFIX + path
  try {
    await $fetch(url, {
      method: 'POST',
      body: {
        firebaseId: user?.uid,
        itemId: props.trashItem?.pbjson.id
      }
    })
    userAlreadyAskedForDonation.value = true
  } catch {
    userAlreadyAskedForDonation.value = false
  }
}

function redirectSaveInfo() {
  window.location.href = '/profile'
}

async function alreadyAskedForDonation(userId: string | undefined): Promise<boolean> {
  if (!userId) {
    return false;
  }
  const itemId = props.trashItem?.pbjson.id;
  if (!itemId) {
    return false;
  }
  const isDonatedByUser = (props.donatedItems ?? []).some((donation)  => {
    return donation.userid === userId && donation.itemid === itemId;
  });
  return isDonatedByUser;
}

watch(
  () => props.trashItem,
  async (newValue) => {
    show.value = true
    seeingOwnPicture.value = newValue?.pbjson.userId === user?.uid
    if (locale.value !== 'en' && newValue && newValue.pbjson?.disposalInstructions) {
      translateLoading.value = true
      const translations = await fetchTranslatedTrashItem(locale.value)
      if (props.trashItem) {
        caption.value = translations?.[0] ?? ''
        disposalInstructions.value = translations?.[1] ?? ''
      }
      translateLoading.value = false
    }
    caption.value = newValue?.pbjson.caption
    disposalInstructions.value = newValue?.pbjson.disposalInstructions
    splittedDisposalInstructions.value = splitDisposalInstructions(disposalInstructions.value)
    splittedSubclassifications.value = newValue?.pbjson.subClassifications?.split(',') || []
    if (splittedSubclassifications.value && splittedSubclassifications.value?.length > 3)
      splittedSubclassifications.value = splittedSubclassifications.value?.slice(0, 3)
    if (newValue?.pbjson.latlng) {
      const latitude = newValue?.pbjson.latlng?.latitude || 0
      const longitude = newValue?.pbjson.latlng?.longitude || 0
      const geocode = await getCityAndNeighborhood(latitude, longitude, config)
      if (geocode.results[0].address_components.length > 4) {
        city.value = geocode.results[0].address_components[4].long_name
      }

      if (geocode.results[0].address_components.length > 2) {
        neighborhood.value = geocode.results[0].address_components[2].long_name
      }
      mapPosition.value = `https://www.google.com/maps/embed/v1/place?q=${latitude},${longitude}&key=${config.public.MAPS_EMBED_API_KEY}`
    }
    infoLoading.value = false
  },
  { deep: true }
)

onBeforeMount(async () => {
  show.value = true
  userRegistered.value = JSON.parse(localStorage.getItem('userRegistered') ?? 'false');
  seeingOwnPicture.value = props.trashItem?.pbjson.userId === user?.uid
  userAlreadyAskedForDonation.value = await alreadyAskedForDonation(user?.uid)
  if (locale.value !== 'en' && props.trashItem && props.trashItem.pbjson?.disposalInstructions) {
  translateLoading.value = true
  const translations = await fetchTranslatedTrashItem(locale.value)
  if (props.trashItem) {
    caption.value = translations?.[0] ?? ''
    disposalInstructions.value = translations?.[1] ?? ''
  }
  translateLoading.value = false
  }
  splittedDisposalInstructions.value = splitDisposalInstructions(disposalInstructions.value)
  splittedSubclassifications.value = props.trashItem?.pbjson.subClassifications?.split(',') || []
  if (splittedSubclassifications.value && splittedSubclassifications.value?.length > 3)
    splittedSubclassifications.value = splittedSubclassifications.value?.slice(0, 3)
  const disposalPlacesRegisteredByUser: Array<DisposalPlace> = await getDisposalPlacesRegisteredByUser(await user?.uid)
  if(user?.uid && props.trashItem?.pbjson.picture ){
  placeAlreadyRegistered.value = disposalPlacesRegisteredByUser.some((disposalPlace) => {
    return disposalPlace.imgurl === props.trashItem?.pbjson.picture;
  });}
  infoLoading.value = false
  if (latlngAvailable) {
    const latitude = props.trashItem?.pbjson.latlng?.latitude || 0
    const longitude = props.trashItem?.pbjson.latlng?.longitude || 0
    const geocode = await getCityAndNeighborhood(latitude, longitude, config)
    if (geocode.results[0].address_components.length > 4) {
      city.value = geocode.results[0].address_components[4].long_name
    }
    if (geocode.results[0].address_components.length > 2) {
      neighborhood.value = geocode.results[0].address_components[2].long_name
    }
    mapPosition.value = `https://www.google.com/maps/embed/v1/place?q=${latitude},${longitude}&key=${config.public.MAPS_EMBED_API_KEY}`
    userDisposalPlaces.value = await getNearbyUserDiposalPlaces(user?.uid)
  }
})
</script>
<template>
  <Transition name="slide-bottom">
    <div class="primary-bg">
      <div class="primary-bg d-flex align-center justify-space-between mb-5 mt-5">
        <div class="d-flex">
          <button class="ml-3 mr-2 modal-title text-left" @click="hideImageModal">
            <v-icon icon="mdi-arrow-left" color="#003C71" size="large" />
          </button>
          <p class="font-weight-medium text-subtitle-1" style="color: #003c71">
            <template v-if="caption && splittedSubclassifications.length">
              {{ caption.replace(/\.$/, '') }}
            </template>
            <template v-else>
              <VSkeletonLoader :loading="true" elevation="2" min-width="100px" height="100%" type="text" />
            </template>
          </p>
        </div>
        <v-icon v-if="splittedSubclassifications.length" :icon="icon" class="mr-2" @click="clipboard" />
      </div>
      <div v-if="splittedSubclassifications.length" class="d-flex ml-2 text-base">
        <img :src="imageCategories.icon || 'default-icon.png'" height="30" width="40" />
        <h1 class="text-base font-weight-medium">
          {{ t(props.trashItem?.pbjson?.label?.trim() || t('loading')) }}
        </h1>
      </div>
      <div v-else>
        <VSkeletonLoader
          :loading="true"
          class="mx-auto"
          elevation="2"
          width="100%"
          height="100%"
          type="list-item-three-line"
        />
      </div>
      <div class="font-weight-medium ml-4 mt-2">
        <template v-if="splittedSubclassifications.length">
          {{ capitalizeString(caption) }}
        </template>
      </div>
      <div class="w-100 px-2 d-flex justify-space-around">
        <template v-if="splittedSubclassifications.length">
          <div
            v-for="subclassification in splittedSubclassifications"
            :key="subclassification"
            class="subtags-border text-center text-subtitle-2 mt-2 py-1 px-3"
          >
            {{ t(subclassification.trim()) }}
          </div>
        </template>
        <template v-else-if="infoLoading" || !splittedDisposalInstructions></template>
      </div>
      <div class="d-flex justify-center px-2">
        <v-divider class="my-2 border-opacity-100" thickness="1px" color="#BFC9C3" />
      </div>

      <div>
        <div v-if="placeAlreadyRegistered" class="ml-2 mb-2">
          <v-icon icon="mdi-check" />
          {{ t('registered_as_disposal_place') }}
        </div>
      </div>
      <div class="px-2 image-container" :class="{ expanded: data.isExpanded }">
        <NuxtImg
          class="image-thumb"
          :class="{ expanded: data.isExpanded }"
          sizes="xs:100px sm:200px md:400px lg:700px xl:900px"
          provider="cloudflare"
          format="webp"
          :src="imageSrc || props.trashItem?.pbjson?.picture"
          placeholder
        />
        <button class="image-button" :class="{ expanded: data.isExpanded }" @click="expandImage">
          <img v-if="data.isExpanded" src="../../../assets/images/close-24px.svg" alt="close" />
          <img v-else src="../../../assets/images/arrow-expand-all.svg" alt="expand" />
        </button>
      </div>
      <div v-if="infoLoading || !props.trashItem?.pbjson?.disposalInstructions">
        <v-btn
          class="mx-2 mb-2 text-white"
          style="width: 95%; color: #00382c; border-radius: 10px; border: solid #006b56; background-color: #0ca385"
          :text="'...'"
          disabled
        />
      </div>
        <div v-else-if="!caption || !splittedSubclassifications.length" style="margin-top: 30px; margin-bottom: 8px;">
        <VSkeletonLoader :loading="true" elevation="2" min-width="100px" height="100%" type="text" />
      </div>

      <div v-else-if="!userRegistered && !props.trashItem?.pbjson?.isDisposalPlace">
        <div class="text-center text-subtitle-2 mt-2 py-1 px-3">
          {{ $t('item_available_for_donation') }}
        </div>
        <v-btn
          class="mx-2 mb-2 text-white"
          style="width: 95%; color: #00382c; border-radius: 10px; border: solid #006b56; background-color: #0ca385"
          :text="seeingOwnPicture ? t('i_want_to_donate_this') : t('i_want_this')"
          @click="redirectSaveInfo()"
        />
      </div>

      <div
        v-else-if="
          !userAlreadyAskedForDonation &&
          !props.trashItem?.pbjson?.isDisposalPlace &&
          !seeingOwnPicture &&
          userRegistered
        "
      >
        <div class="text-center text-subtitle-2 mt-2 py-1 px-3">
          {{ $t('item_available_for_donation') }}
        </div>
        <v-btn
          class="mx-2 mb-2 text-white"
          style="width: 95%; color: #00382c; border-radius: 10px; border: solid #006b56; background-color: #0ca385"
          :text="t('i_want_this')"
          @click="registerDonation"
        />
      </div>

      <div v-else-if="seeingOwnPicture && userRegistered">
        <div class="text-center text-subtitle-2 mt-2 py-1 px-3">
          {{ $t('item_available_for_donation') }}
        </div>
        <v-btn
          class="mx-2 mb-2 text-white"
          style="width: 95%; color: #00382c; border-radius: 10px; border: solid #006b56; background-color: #0ca385"
          :text="t('i_want_to_donate_this')"
          @click="redirectSaveInfo()"
        />
      </div>

      <div v-else>
        <div class="text-center text-subtitle-2 mt-2 py-1 px-3">
        </div>
        <v-btn
          class="mx-2 mb-2 text-white"
          style="width: 95%; color: #00382c; border-radius: 10px; border: solid #006b56; background-color: #0ca385"
          :text="t('item_not_available_for_donation')"
          disabled
        />
      </div>
      <Transition name="slide-left" mode="out-in">
        <div
          v-if="
            props.trashItem?.pbjson?.isDisposalPlace &&
            user?.uid === props.trashItem?.pbjson?.userId &&
            !placeAlreadyRegistered &&
            !infoLoading
          "
          class="add-disposal-place-card mx-2 py-5 px-2 mb-2 text-white"
        >
          <Transition name="slide-left" mode="out-in">
            <div v-if="triedToCreateDisposalPlace && failed && !loading" class="d-flex align-center mb-2">
              <v-icon class="mr-2" icon="mdi-exclamation" />
              {{ t('disposal_place_failed') }}
            </div>
          </Transition>
          <p class="ml-2 mb-3 text-sm-1xl font-weight-medium">
            {{ t('detected_trash_can') }}
          </p>
          <p class="ml-2 mb-6">
            {{ t('register_as_disposal_place') }}
          </p>
          <v-btn
            class="w-100"
            style="color: #00382c; border-radius: 50px; background-color: #f0f1f3"
            @click="saveDisposalPlace"
          >
            <span v-if="!loading">{{ t('yes') }}</span>
            <v-progress-circular v-else :size="25" color="#003C71" indeterminate />
          </v-btn>
        </div>
      </Transition>
      <div class="instructions-card mb-2 mt-0 mx-2">
        <div class="ml-4">
          <h2 class="text-left mt-5 mb-2 text-sm-1xl font-weight-medium">
            {{ t('how_to_dispose') || t('loading') }}
          </h2>
          <div v-if="splittedDisposalInstructions">
            <v-list class="primary-bg mb-4">
              <v-list-item v-for="item in splittedDisposalInstructions" :key="item.title" class="d-flex ml-n4">
                <v-list-item-title>
                  <div class="d-flex justify-space-between">
                    <div>
                      <span class="number font-weight-bold d-inline-block mr-4" v-text="item.number || '...'" />
                    </div>
                    <span class="text-wrap" v-text="item.title || t('loading')" />
                  </div>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          <div v-else>
            <VSkeletonLoader
              :loading="true"
              class="mx-auto"
              elevation="2"
              width="100%"
              height="100%"
              type="article, list-item-three-line"
            />
          </div>
        </div>
      </div>
      <div v-if="props.trashItem?.pbjson?.nearbyRecyclingPlaces" class="d-flex flex-column w-100 mb-1">
        <RecyclingCenterCard :nearby-recycling-centers="props.trashItem?.pbjson?.nearbyRecyclingPlaces" />
      </div>
      <div v-if="latlngAvailable">
        <div
          v-if="userDisposalPlaces && userDisposalPlaces.length > 0"
          class="disposal-places text-center font-weight-medium mt-5 mb-5 mr-2 ml-2"
        >
          <div class="disposal-places-header">
            <v-row>
              <v-col class="v-col-8 mb-3">
                <p>{{ t('your_disposal_places_txt') }}</p>
              </v-col>
              <v-col class="v-col-3 mb-3">
                <NuxtLink :to="localePath('your_disposal_places')" style="text-decoration: none; color: #ffd766">
                  {{ t('view_all') }}
                </NuxtLink>
              </v-col>
            </v-row>
          </div>
          <v-col v-for="(disposalPlace, idx) in userDisposalPlaces" :key="idx" class="ma-0 pa-1 d-flex" cols="12">
            <DisposalPlaceComponent v-if="idx < 2" class="mb-1" :disposal-place="disposalPlace" />
          </v-col>
        </div>
        <div v-if="seeingOwnPicture" class="px-2">
          <h2 class="text-left mb-2 text-sm-1xl font-weight-regular">
            {{ city || '...' }} - {{ neighborhood || '...' }} • {{ hoursAndMinutes || '...' }}
          </h2>
          <iframe
            :src="mapPosition || ''"
            width="100%"
            height="124"
            style="border: 0"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <div class="my-4 px-4" />
    </div>
  </Transition>
</template>

<style scoped>
.image-container {
  position: relative;
}

.image-container.expanded {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  z-index: 9998;
}

.black-bg {
  position: absolute;
  display: flex;
  height: inherit;
  top: 0;
  left: 0;
  width: 100%;
  background-color: black;
  z-index: -1;
}

@media (orientation: landscape) {
  .image-thumb {
    max-width: 100%;
    width: 100vw;
    height: 44vh;
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: 5px;
  }
}

@media (orientation: portrait) {
  .image-thumb {
    max-width: 100%;
    width: 100vw;
    height: 22vh;
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: 5px;
    /* transition: width 0.6s ease-out, height 0.3s ease-out; */
  }
}

@media (orientation: landscape) {
  .image-thumb.expanded {
    height: 100vh;
    width: fit-content;
    padding: 8px;
  }
}

@media (orientation: portrait) {
  .image-thumb.expanded {
    height: fit-content;
    width: 100vw;
    padding: 8px;
  }
}

.image-button {
  position: absolute;
  top: 8px;
  right: 14px;
}

.image-button.expanded {
  right: auto;
  top: 15px;
  left: 22px;
}

.subtags-border {
  border-radius: 24px;
  border: 1px solid #003c71;
  color: #003c71;
}

.disposal-places {
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  background-color: #0ca385;
  border-radius: 8px;
}

.number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #bfe4d2;
  color: #002018;
  text-align: center;
  line-height: 40px;
  font-size: 14px;
  margin-right: 8px;
}

.instructions-card {
  border: 1px solid #bfc9c3;
  border-radius: 8px;
}

.add-disposal-place-card {
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  background-color: #0ca385;
  border-radius: 8px;
  border: 2px solid #006b56;
}

.btn-styles {
  box-shadow:
    0px 1px 3px rgba(0, 0, 0, 0.15),
    0px 1px 2px rgba(0, 0, 0, 0.3);
  background-color: #0ca385;
  border-radius: 8px;
  border: 2px solid #006b56;
}

.disposal-places-header {
  color: white;
}

.loading-bar {
  height: 40px; /* matches the height of the subclassifications data */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
