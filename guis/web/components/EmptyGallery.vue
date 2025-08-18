<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps({
  useTitleForEmptyGallery: Boolean,
})

const router = useRouter()
const { t } = useI18n()

function openCamera() {
  router.push('/camera')
}
</script>

<template>
  <div class="flex justify-center items-center w-100">
    <div class="rounded-lg shadow-lg px-4 max-w-md w-full flex flex-col justify-center text-center mt-4">
      <img src="../assets/images/icon-empty-camera.png" style="height: 72px;">
      <div class="text-left">
        <h2 class="primary-text text-center font-weight-400 text-base mb-2">
          {{ props.useTitleForEmptyGallery ? t('ops_empty') : t('welcome_to_iris') }}
        </h2>
        <p class="text-sm primary-text text-center font-weight-400 w-100 mb-8 mx-auto">
          {{ t('well_lit_empty_gallery') }}
        </p>
        <button class="d-flex align-center btn-primary mx-auto" @click="openCamera" v-ripple>
          <v-icon icon="mdi-camera" color="#fff" size="large" />
          <p class="ml-2 font-weight-700 text-white">
            {{ t('start_here') }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
