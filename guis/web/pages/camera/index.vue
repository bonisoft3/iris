<script setup lang="ts">
import Camera from 'simple-vue-camera'
import { FilesetResolver, InteractiveSegmenter } from '@mediapipe/tasks-vision'
import IndeterminateQuestionBox from '../../components/IndeterminateQuestionBox.vue'
import XButton from '../../components/XButton.vue'
import prevRoute from '../../utils/prevRoute'
import { cropToCover } from '../../utils/vision/csscover'
import logger from '../../utils/logger'
import ImageModalComponents from './components/ImageModalComponents.vue'
import ImageModalInfo from './components/ImageModalInfo.vue'

const progressDisplay = ref<boolean>(true)
const progressColor = ref<string>('primary')
const maincam = ref<InstanceType<typeof Camera>>()
const snapshotUrl = ref<string>('')
const snapshotLoading = ref<boolean>(false)
const showFrame = ref<boolean>(false)
const user = useCurrentUser()
const userCity = ref('')
const { t, locale } = useI18n()
const allowedModels = ['openai', 'gemini']
const selectedModel = ref('gemini')
const localePath = useLocalePath()
const lastThumbnail = ref('')
const sendPhotoError = ref(false)
const sendingPhoto = ref(false)
const disabled = ref(false)
const config = useRuntimeConfig()
const savedPic = ref(false)
const showCameraIsReadyText = ref(false)
const hideFocalPointMessage = ref(false)
const imageId = ref<string | null>(null)

let segmenter: InteractiveSegmenter | null

async function setUserCity() {
  const data = await fetch(config.public.GEOLOCATION_URL_PREFIX + 'geolocation')
  const json = await data.json()

  userCity.value = json?.city
}

onBeforeMount(() => {
  createSegmenter()
})

onMounted(async () => {
  logger.info('mounting camera page')
  await maincam.value?.start()
  await setUserCity()
  setModel()

  progressDisplay.value = false
  showFrame.value = true
})

const showImageModal = ref(false)

async function snapshot() {
  snapshotLoading.value = true

  const video = maincam.value?.$refs.video as HTMLVideoElement
  const videoDimensions = new DOMRect(video.offsetLeft, video.offsetTop, video.videoWidth, video.videoHeight)
  const displayDimensions = video.getBoundingClientRect()
  const cropRect = cropToCover(videoDimensions, displayDimensions)
  const canvas = document.createElement('canvas')
  canvas.width = displayDimensions.width
  canvas.height = displayDimensions.height
  canvas
    .getContext('2d')
    ?.drawImage(video, cropRect.x, cropRect.y, cropRect.width, cropRect.height, 0, 0, canvas.width, canvas.height)
  snapshotUrl.value = canvas.toDataURL('image/jpeg')
  snapshotLoading.value = false
  showImageModal.value = true
}

function hideImageModal() {
  showImageModal.value = false
  const video = maincam.value?.$refs.video as HTMLVideoElement
  video.load()
}

const showsModalInfo = ref(false)

function openModalInfo() {
  showsModalInfo.value = true
}

function setModel() {
  const storedModel = localStorage.getItem('ai_model') || ""
  selectedModel.value = allowedModels.includes(storedModel) ? storedModel : 'gemini'
}

function hideModalInfo() {
  showsModalInfo.value = false
  showImageModal.value = false
}

function closeAlert() {
  sendPhotoError.value = false
}

// This is a tricky api, so we give it its own function.
async function getLatlng(): Promise<GeolocationPosition | null> {
  return (await new Promise((res) => {
    navigator.geolocation.getCurrentPosition(
      res,
      (reason) => {
        logger.warn('Failed to get gps', reason)
        res(null)
      },
      { timeout: 10000 }
    )
  })) as GeolocationPosition | null
}

function takePicture() {
  disabled.value = true
  setTimeout(() => {
    disabled.value = false
    snapshot()
  }, 600)
}

function procFeedbackMessages(): void {
  setTimeout(() => {
    savedPic.value = true
    showCameraIsReadyText.value = true
    setTimeout(() => {
      savedPic.value = false
      showCameraIsReadyText.value = false
      hideFocalPointMessage.value = false
    }, 3500)
  }, 3500)
}

async function confirmImageSaveModal() {
  sendPhotoError.value = false
  showsModalInfo.value = false
  showImageModal.value = false
  savedPic.value = true
  hideFocalPointMessage.value = true
  lastThumbnail.value = snapshotUrl.value
  const path = 'trash.tracker.v1.TrackerService/Track'
  const url = config.public.SERVICES_TRACKER_URL_PREFIX + path
  const now = Date.now()
  const nowMillis = Math.round(now % 1000)
  const nowNanos = nowMillis * 1000
  const nowSeconds = Math.round((now - nowMillis) / 1000)
  const latlng = await getLatlng()
  logger.info('Calling track at', url, ' ts', nowSeconds, ' with body len', snapshotUrl.value.length)
  try {
    procFeedbackMessages()
    sendingPhoto.value = true
    const response = await $fetch(url, {
      method: 'POST',
      body: {
        item: {
          userId: user.value?.uid,
          userLanguage: locale.value,
          picture: snapshotUrl.value,
          timestamp: { seconds: nowSeconds, nanos: nowNanos },
          ...(latlng && { latlng: { latitude: latlng.coords.latitude || 0, longitude: latlng.coords.longitude || 0 } }),
          userCity: userCity.value,
          model: selectedModel.value,
        },
      },
    })
    logger.info('Track response:', response)
    imageId.value = (response as { id: string }).id
    sendingPhoto.value = false
    sendPhotoError.value = false
  } catch {
    sendingPhoto.value = false
    sendPhotoError.value = true
    setTimeout(() => {
      sendPhotoError.value = false
    }, 7000)
  }
  savedPic.value = false
}

watch(imageId, (newId) => {})

async function createSegmenter() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  )
  segmenter = await InteractiveSegmenter.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite`,
      delegate: 'GPU',
    },
    outputCategoryMask: true,
    outputConfidenceMasks: false
  })
}
</script>

<script lang="ts">
export default {
  components: {
    XButton,
  },
  beforeRouteLeave(_to: any, _from: any) {
    if (prevRoute.value.name.search('tips') !== -1) {
      const router = useRouter()
      router.back()
    }
  },
  beforeRouteEnter(_: any, from: any) {
    prevRoute.value = from
  },
  methods: {
    updateXButtonCamera() {
      const router = useRouter()
      router.go(-2)
      prevRoute.value.name = ''
    },
  },
}
</script>

<template>
  <div :class="{ 'main-dark': showsModalInfo }">
    <div class="screen blur-filter" style="user-select: none; pointer-events: none">
      <div class="camera">
        <Camera ref="maincam" :autoplay="false" />
      </div>
    </div>
    <div v-if="showFrame" class="frame" style="user-select: none; pointer-events: none">
      <div class="top-left frame-position" />
      <div class="top-right frame-position" />
      <div class="bottom-left frame-position" />
      <div class="bottom-right frame-position" />
      <div class="target" />
      <p class="camera-disclaimer w-75">
        {{ t('disclaimer') }}
      </p>
    </div>
    <XButton @click="updateXButtonCamera" />
    <p v-if="!savedPic && !hideFocalPointMessage" class="bottom-text">
      {{ t('camera_focal_point') }}
    </p>
    <div>
      <div v-if="progressDisplay"
        v-ripple.center
        class="circle-buttom"
      >
        <div class="inner-circle-loading" />
      </div>
      <div v-else
        v-ripple.center
        class="circle-buttom"
        :class="{ 'take-photo': snapshotLoading }"
        :loading="snapshotLoading"
        @click="takePicture"
      >
        <div class="inner-circle-hidden" :class="{ snapHidden: disabled }" />
        <div class="inner-circle-button" :class="{ snap: disabled }" />
      </div>
    </div>
    <div class="d-flex justify-center alert-photo-not-sent">
      <v-alert
        v-if="sendPhotoError"
        closable
        type="warning"
        :title="t('photo_not_sent')"
        style="margin: auto"
        :text="t('resend_photo')"
      >
        <v-btn style="display: block; margin-top: 30px; margin: auto" @click="closeAlert">OK</v-btn>
      </v-alert>
    </div>
    <v-progress-circular v-if="sendingPhoto" :size="55" color="#3ED8C0" indeterminate class="sending-photo-spinner" />
    <Transition name="fade" mode="out-in">
      <div v-show="savedPic && !showCameraIsReadyText" class="tooltip-may-take-a-while pa-1 font-weight-medium">
        Your photo may take a while to upload...
      </div>
    </Transition>
    <Transition name="fade" mode="out-in">
      <div
        v-show="savedPic && showCameraIsReadyText"
        class="tooltip-may-take-a-while pa-1 font-weight-medium mx-auto"
        style="left: 0; right: 0"
      >
        But your camera is ready for a new photo
      </div>
    </Transition>
    <IndeterminateQuestionBox :loading="snapshotLoading" />
    <Transition v-if="!progressDisplay" name="bounce">
      <div>
        <ImageModalComponents
          :image="snapshotUrl"
          :show="showImageModal"
          :snapshot-loading="snapshotLoading"
          :last-thumbnail="lastThumbnail"
          :segmenter="segmenter"
          :image-id="imageId"
          :sending-photo="sendingPhoto"
          @hide-image-modal="hideImageModal"
          @confirm-image-save-modal="confirmImageSaveModal"
        />
      </div>
    </Transition>

    <ImageModalInfo
      v-if="showsModalInfo"
      :image="snapshotUrl"
      @hide-modal-info="hideModalInfo"
      @confirm-image-save-modal="confirmImageSaveModal"
    />
  </div>
</template>

<style>
video {
  /* override other styles to make responsive */
  width: 100% !important;
  height: auto !important;
  max-height: 100vh;
  min-height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  /* Check https://cs.github.com/SamChristy/sudoku-solver/blob/88dcbffea26d448f24f1d848af213cafe5161789/src/hooks/useScanner.ts?q=intrinsic-scale */
  object-fit: cover;
}

.circle-buttom {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #fff;
  color: #3ed8c0;
  position: absolute;
  z-index: 4;
  left: 50%;
  transform: translateX(-50%);
  bottom: 24px;
  padding: 3px;
  user-select: none;
}

.inner-circle-button {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #7ef8d5;
  touch-action: none;
}

.inner-circle-hidden {
  width: 25%;
  height: 25%;
  border-radius: 50%;
  background-color: #bcf0e1;
  position: absolute;
  margin: 20px;
  touch-action: none;
  z-index: -11;
}

.inner-circle-loading {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #ffffff00;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.inner-circle-loading::after {
  content: "";
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 10px solid #7ef8d5;;
  border-top-color: #ffffff00;
  position: absolute;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes snap {
  0% {
    transform: scale(0.6);
  }

  15% {
    background-color: #7ef8d5;
    transform: scale(1.2);
  }

  40% {
    background-color: #fefefe;
    transform: scale(1.2);
  }

  55% {
    background-color: #7ef8d5;
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes snapHidden {
  0% {
    z-index: -50;
  }

  15% {
    z-index: -10;
  }

  40% {
    z-index: 30;
  }

  55% {
    z-index: -10;
  }

  100% {
    z-index: -50;
  }
}

.snap {
  animation: snap 0.95s ease-out;
  z-index: 200;
}

.snapHidden {
  animation: snapHidden 0.95s ease-out;
}

.circle-photo {
  width: 42px;
  height: 42px;
  background: #d9d9d9;
  border-radius: 50%;
  border: 2px solid #fff;
  color: #fff;
  bottom: 35px;
  position: absolute;
  z-index: 4;
  right: 50px;
  overflow: hidden;
}

.tooltip-may-take-a-while {
  right: 44px;
  bottom: 95px;
  border-radius: 6px;
  position: absolute;
  width: fit-content;
  height: fit-content;
  background-color: #ffffff;
}

.sending-photo-spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #fff;
  color: #3ed8c0;
  position: absolute;
  z-index: 999;
  pointer-events: none;
  right: 44px;
  bottom: 28px;
}

.alert-photo-not-sent {
  bottom: 55px;
  position: absolute;
  z-index: 5;
  overflow: hidden;
  max-width: 2000px;
  width: 100%;
}

.circle-photo img {
  width: 100%;
  height: 50px !important;
}

.progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

div.screen {
  margin: 0;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
}

div.frame {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  height: 70%;
  /* Proportions took based on Figma */
  width: 81%;
}

.frame-position {
  position: absolute;
  height: 30%;
  width: 32%;
}

.bottom-left {
  border-bottom: solid 3px #fff;
  border-left: solid 3px #fff;
  border-bottom-left-radius: 20px;
  bottom: 0;
  left: 0;
}

.bottom-right {
  border-bottom: solid 3px #fff;
  border-right: solid 3px #fff;
  border-bottom-right-radius: 20px;
  bottom: 0;
  right: 0;
}

.top-left {
  border-top: solid 3px #fff;
  border-left: solid 3px #fff;
  border-top-left-radius: 20px;
  top: 0;
  left: 0;
}

.top-right {
  border-top: solid 3px #fff;
  border-right: solid 3px #fff;
  border-top-right-radius: 20px;
  top: 0;
  right: 0;
}

.target {
  position: absolute;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 56px;
  width: 56px;
  animation: 2s reverse 3.5s forwards fade-effect linear;
}

.target::after {
  content: ' ';
  position: absolute;
  display: block;
  background-color: #fff;
  height: 3px;
  margin-top: -3px;
  top: 50%;
  left: 5px;
  right: 5px;
  z-index: 3;
}

.target::before {
  content: ' ';
  position: absolute;
  display: block;
  background-color: #fff;
  width: 3px;
  margin-left: -2px;
  left: 50%;
  top: 5px;
  bottom: 5px;
  z-index: 3;
}

p.camera-disclaimer {
  position: absolute;
  z-index: 3;
  font-size: 16px;
  color: #fff;
  text-shadow: 0px 1px 2px black;
  opacity: 1;
  text-align: center;
  font-weight: 700;
  animation: 2s 2s forwards fade-effect linear;
}

p.bottom-text {
  width: 100%;
  font-size: 16px;
  position: absolute;
  text-shadow: 0px 1px 2px black;
  color: #fff;
  opacity: 0;
  font-weight: 700;
  z-index: 2;
  text-align: center;
  animation: 2s reverse 2s forwards fade-effect linear;
}

.camera {
  animation: camera-blur 4s linear;
}

@media only screen and (max-height: 590px) {
  .bottom-left {
    bottom: 5rem;
  }

  .bottom-right {
    bottom: 5rem;
  }

  p.bottom-text {
    bottom: 6rem;
  }
}

@media only screen and (min-height: 590px) {
  .bottom-left {
    bottom: 2rem;
  }

  .bottom-right {
    bottom: 2rem;
  }

  p.bottom-text {
    bottom: calc(6rem + 0.5%);
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(0.95);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes fade-effect {
  from {
    opacity: 1;
    user-select: none;
    pointer-events: none;
  }

  to {
    opacity: 0;
    display: none;
    user-select: none;
    pointer-events: none;
  }
}

@keyframes camera-blur {
  from {
    filter: blur(10px);
  }

  to {
    filter: none;
  }
}

.blur-filter {
  filter: blur(10px);
  animation: 1.5s 3s forwards camera-blur linear;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 3s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
