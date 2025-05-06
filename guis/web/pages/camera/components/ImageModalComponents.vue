<script setup lang="ts">
import { useRoute } from 'vue-router'
import ImageDetailsModal from '../../images/components/ImageDetailsModal.vue'
import { useFetchElectricImage } from '../../../composables/useFetchElectricImage'
import type { TrashItem } from '#build/interfaces/trashItem'
import { getCurrentInstance, ref } from 'vue'
import type { InteractiveSegmenter, MPMask } from '@mediapipe/tasks-vision'

const route = useRoute()
const instance = getCurrentInstance()
const imageId = ref<string | null>(null)
const localImageId = ref<string | null>(null)
const trashItem = ref<TrashItem | null>(null)
const cameraoverlay = ref<InstanceType<typeof HTMLCanvasElement>>()
const showDetailsModal = ref(false)
const props = defineProps<{
  image: string
  lastThumbnail: string
  snapshotLoading: boolean
  segmenter?: InteractiveSegmenter | null
  show: boolean
  imageId: string | null
  sendingPhoto: boolean
}>()
const emits = defineEmits(['hideImageModal', 'update:show', 'confirmImageSaveModal'])
const donatedItems = null
watch(
  trashItem,
  (newTrashItem) => {
    if (!newTrashItem) return

    const imgUuid = newTrashItem.pbjson.picture.endsWith('.jpg')
      ? newTrashItem.pbjson.picture.split('/')?.pop()?.slice(0, -4)
      : newTrashItem.pbjson.picture.split('/').pop()

    const domain = `https://iris.cleaning/images/${imgUuid}`

    useHead({
      meta: [
        { property: 'og:description', content: newTrashItem.pbjson.caption },
        { property: 'og:url', content: domain },
        { property: 'og:image', content: newTrashItem.pbjson.picture }
      ]
    })
  },
  { immediate: true }
)

watch(
  () => props.imageId,
  (newId) => {
    if (newId) {
      localImageId.value = newId
      handleImageSaved(newId)
    }
  },
  { immediate: true }
)

watch(
  () => props.image,
  async () => {
    const imgAsBlob: Blob = await $fetch(props.image)
    const img: HTMLCanvasElement = await blobToCanvas(imgAsBlob)
    if (!img || !img.height || !img.width) return
    props.segmenter?.segment(
      img,
      {
        keypoint: {
          x: 0.5,
          y: 0.5
        }
      },
      (result) => {
        if (result.categoryMask == null) return
        drawSegmentation(result.categoryMask)
      }
    )
  }
)

async function handleImageSaved(id: string) {
  imageId.value = id
  const fetchedTrashItem = useFetchElectricImage(id as string)
  watch(
    fetchedTrashItem,
    (newValue) => {
      if (newValue) {
        trashItem.value = newValue
      }
    },
    { immediate: true }
  )
}

function drawSegmentation(mask: MPMask) {
  const width = mask.width
  const height = mask.height
  const maskData = mask.getAsFloat32Array()
  const canvas = document.getElementById('cameraoverlay') as HTMLCanvasElement
  if (!canvas) {
    console.error('Canvas element not found')
    return
  }
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (ctx == null) return
  ctx.fillStyle = '#00000000'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(255, 203, 61, 0.7)'

  maskData.forEach((category, index) => {
    if (Math.round(category * 255.0) === 0) {
      const x = (index + 1) % width
      const y = (index + 1 - x) / width
      ctx.fillRect(x, y, 1, 1)
    }
  })
}

function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.addEventListener('load', () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx!.drawImage(img, 0, 0)
      resolve(canvas)
    })

    img.addEventListener('error', () => {
      reject(new Error('Failed to load the image.'))
    })

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') img.src = reader.result
      else reject(new Error('Invalid result type.'))
    }
    reader.onerror = () => {
      reject(new Error('Failed to read the Blob.'))
    }
    reader.readAsDataURL(blob)
  })
}

function hideImageModal() {
  showDetailsModal.value = false
  instance!.emit('hideImageModal')
}

function confirmImageSaveModal() {
  trashItem.value = null
  instance!.emit('update:show', false)
  if (!imageId.value) {
    console.warn('No imageId set before emitting event')
  }
  instance!.emit('confirmImageSaveModal', imageId.value)
}

function openDetailsModal() {
  showDetailsModal.value = true
}
</script>

<template>
  <div v-if="show" class="modal">
    <div class="modal-background" />
    <div id="content" class="modal">
      <canvas id="cameraoverlay" ref="cameraoverlay" />
      <img :src="props.image" />
    </div>
    <IndeterminateQuestionBox />
    <button
      class="circle-buttom"
      :loading="snapshotLoading"
      style="display: flex; justify-content: center"
      @click="confirmImageSaveModal"
    >
      <v-icon icon="mdi-check-circle" style="align-self: center" />
    </button>
    <XButton :loading="snapshotLoading" style="z-index: 104" @click="hideImageModal" />
  </div>
  <button
    v-if="!show"
    class="circle-photo"
    :loading="snapshotLoading"
    style="z-index: 104"
    @click="openDetailsModal"
  >
    <img v-if="lastThumbnail" :src="lastThumbnail" />
    <v-progress-circular :size="55" color="#3ED8C0" indeterminate class="sending-photo-spinner" />
  </button>
  <div v-if="showDetailsModal" id="image-modal-gtm" class="image-container modal">
    <div class="modal-content">
      <ClientOnly>
        <div class="transparent-button" @click="hideImageModal"></div>
        <ImageDetailsModal
          :trash-item="trashItem"
          :image="lastThumbnail || ''"
          :donated-items="donatedItems"
          :key="trashItem?.id"
        />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
.transparent-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
  background-color: transparent;
  border: none;
  z-index: 104;
  cursor: pointer;
}
.sending-photo-spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #fff;
  color: #3ed8c0;
  position: absolute;
  z-index: 4;
  right: 44px;
  bottom: 28px;
}
.loading-bar {
  height: 40px; /* matches the height of the subclassifications data */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
#cameraoverlay {
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

#cameraoverlay {
  z-index: 100;
  padding: 8px;
  /* Needed to fit the 8px padding on the image */
}

.modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 101;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
}

.modal-content {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  z-index: 102;
  display: flex;
  flex-direction: column;
  position: relative;
  background:rgb(234, 245, 244);
  box-sizing: border-box;
}

.modal-content img {
  width: 100%;
  height: 100vh;
  display: block;
  border-radius: 16px;
  padding: 8px;
}

.circle-photo img {
  padding: 0px !important;
}

.circle-buttom {
  color: #7ef8d5;
  font-size: 42px;
  z-index: 104;
}

.circle-buttom:active {
  color: #006b56bf;
}

.footer__nav {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  max-width: 800px;
  flex-wrap: nowrap;
  background-color: #fff;
  border-top: 1px solid #c0c0c0;
}

@media only screen and (min-width: 768px) {
  .modal-content {
    width: 350px;
  }
}
</style>
