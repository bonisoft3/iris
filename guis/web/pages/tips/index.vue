<script setup lang="ts">
import XButton from '../../components/XButton.vue'
import tooClose from '@/assets/images/tips/too-close.png'
import tooFar from '@/assets/images/tips/too-far.png'
import multiMaterial from '@/assets/images/tips/multi-material.png'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()

const badPictures = [
  {
    description: t('too_close'),
    file: tooClose,
  },
  {
    description: t('too_far'),
    file: tooFar,
  },
  {
    description: t('multi_material'),
    file: multiMaterial,
  },
]

function updateXButtonTips() {
  router.go(-1)
}
</script>

<template>
  <v-container fluid class="background d-flex flex-column justify-center align-center h-screen">
    <XButton @click="updateXButtonTips" />
    <v-container class="d-flex flex-column justify-end align-center pa-0 mb-8">
      <h1 class="font-weight-bold mb-6 text-white">
        {{ t('snap_tips') }}
      </h1>
      <div class="check-mark-container">
        <v-icon class="icon-component mdi mdi-check-circle" />
      </div>
      <img src="@/assets/images/tips/ideal.png">
      <p class="font-weight-bold text-caption mt-4 text-white">
        {{ t('centralize_image') }}
      </p>
    </v-container>
    <v-container class="d-flex w-auto flex-column justify-start align-center pa-0 mb-4">
      <v-row cols="3">
        <v-col
          v-for="(badpic, index) in badPictures"
          :key="index"
          class="d-flex flex-column justify-start align-center ma-0 pa-3"
        >
          <div class="exclamation-container">
            <v-icon class="mdi mdi-exclamation" color="#F0F1F3" />
          </div>
          <img :src="badpic.file">
          <p id="description" class="text-subtitle-2 text-white font-weight-bold mt-1 description">
            {{ badpic.description }}
          </p>
        </v-col>
      </v-row>
      <NuxtLink :to="localePath({ name: 'camera' })" class="w-100 text-decoration-none">
        <v-btn class="w-100 mt-4 font-weight-bold continue-btn" height="40" rounded="xl">
          {{ t('continue') }}
        </v-btn>
      </NuxtLink>
    </v-container>
  </v-container>
</template>

<style>
.check-mark-container {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: -188px;
    margin-top: 500px;
    margin-bottom: 180px;
    width: 24px;
    height: 24px;
    background-color: #F0F1F3;
}

.exclamation-container {
    position: absolute;
    width: 30px;
    height: 30px;
    margin-right: -90px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #BA1A1A;
    border-radius: 50%;
}

.icon-component {
    font-size: 40px;
    border-radius: 50%;
    color: #006B56;
}

.continue-btn {
    color: #00382C;
}

#description {
    font-size: 0.78rem !important;
}

button {
    text-transform: unset !important;
}

.background {
    background-color: #0CA385;
}
</style>
