<script setup lang="ts">
import Step1Component from './stepper/Step1Component.vue'
import Step2Component from './stepper/Step2Component.vue'
import Step3Component from './stepper/Step3Component.vue'

definePageMeta({
  middleware: ['vuefire-auth'],
})

const steps = [
  {
    component: Step1Component,
  },
  {
    component: Step2Component,
  },
  {
    component: Step3Component,
  },
]
localStorage.setItem('visitedBefore', 'true')
</script>

<template>
  <div class="">
    <Stepper :steps="steps" />
  </div>
</template>
