<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function openCamera() {
  router.push('/camera')
}

const { t } = useI18n()
</script>

<template>
  <div class="flex justify-center items-center w-100">
    <div class="rounded-lg shadow-lg px-4 max-w-md w-full flex flex-col justify-center text-center mt-4">
      <div class="text-left">
        <h2 class="primary-text text-center font-weight-400 text-base mb-2">
          {{ t('welcome_title') }}
        </h2>
        <p class="text-sm primary-text text-center font-weight-400 mb-6 w-75 mx-auto">
          {{ t('welcome_subtitle') }}
        </p>
        <button class="d-flex align-center btn-primary mx-auto" @click="openCamera">
          <v-icon icon="mdi-camera" color="#FFFFFF" size="large" />
          <p class="ml-2 font-weight-700 text-white">
            {{ t('start_here') }}
          </p>
        </button>
      </div>
    </div>
  </div>
</template>
