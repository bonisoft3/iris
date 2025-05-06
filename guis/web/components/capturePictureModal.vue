<script setup lang="ts">
const props = defineProps({
  label: { type: String, required: false },
  score: { type: String, required: false },
  pictureBlob: { type: Blob, required: true },
})

defineEmits(['uploaded'])

const pictureDataUrl = ref<string>('')

/*
onUpdated(async () => {
  if (uploading.value) return;
  console.log("Capturing blob for " + props.pictureBlob)
  const base64string = await blobToBase64(props.pictureBlob)
  pictureDataUrl.value = 'data:' + props.pictureBlob.type + ';base64,' + base64string
  await nextTick(async () => {
     uploading.value = true
     await upload()
     uploading.value = false
     console.log("emitted uploaded")
  })
  emit('uploaded')
})
*/

async function upload() {
  const config = useRuntimeConfig()
  const path = '/trash.tracker.v1.TrackerService/Track'
  const url = config.public.SERVICES_TRACKER_URL_PREFIX + path
  const now = Date.now()
  const nowMillis = (now % 1000)
  const nowNanos = nowMillis * 1000
  const nowSeconds = (now - nowMillis) / 1000
  await $fetch(url, {
    method: 'POST',
    body: {
      item: {
        description: props.label,
        bytes: pictureDataUrl.value,
        timestamp: { seconds: nowSeconds, nanos: nowNanos },
      },
    },
  })
}
defineExpose([upload])
</script>

<template>
  <v-dialog persistent width="800px">
    teste davi
    <v-card class="modal-container">
      <img :src="pictureDataUrl">
    </v-card>

    <div> teste davi2</div>
  </v-dialog>
</template>

<style>
.picture-container {
  padding: 15px 25px;
}
</style>
