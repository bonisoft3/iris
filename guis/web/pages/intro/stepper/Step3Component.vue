<script setup lang="ts">
const { t } = useI18n()
const currentStep = ref(2)
const show = ref(false)
const router = useRouter()

function startIris() {
  router.push('/')
}

onMounted(() => {
  show.value = true
})
</script>

<template>
  <Transition name="slide-left" mode="out-in">
    <div v-if="show" class="flex justify-center items-center h-screen bg-color">
      <div class="step-progress pt-6 px-6 intro">
        <div class="step-bar" :class="{ active: currentStep >= 0 }" />
        <div class="step-bar" :class="{ active: currentStep >= 1 }" />
        <div class="step-bar" :class="{ active: currentStep >= 2 }" />
      </div>
      <div class="rounded-lg shadow-lg p-6 max-w-md w-full flex flex-col justify-center text-center px-8 intro content-intro">
        <img src="~/assets/images/Illustration-stepper-3.svg">
        <h2 class="primary-text font-weight-400">
          {{ t('everything_through_your_camera') }}
        </h2>
        <p class="text-sm primary-text font-weight-400 mt-4">
          {{ t('find_well_lit_place') }}
        </p>
      </div>
      <div class="flex flex-col justify-center text-center px-8 pb-6 intro buttons-intro">
        <button id="finish-intro-gtm" class="bg-white btn-empty" @click="startIris">
          {{ t('start_iris') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.bg-color{
  background: #FDEBFF !important;
}

.content-intro {
  position: relative;
  top: 10vh;
  font-size: 1.325rem;
}

.buttons-intro {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

img {
  object-fit: contain;
  height: 30vh;
}

@media only screen and (min-width: 400px) and (min-height: 500px) {
  .content-intro {
    top: 20vh;
  }
}

@media only screen and (max-height: 650px) {
  .content-intro {
    font-size: 1rem;
  }
  img {
   object-fit: contain;
   height: 26.9vh;
  }
}

@media only screen and (min-width: 768px) {
  .intro{
    max-width: 768px;
    margin: 0 auto
  }
}
</style>
