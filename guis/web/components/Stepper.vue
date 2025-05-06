<script setup>
const props = defineProps({
  initialStep: {
    type: Number,
    default: 0,
  },
  steps: {
    type: Array,
    required: true,
  },
})

const currentStep = ref(props.initialStep)
const formData = reactive({})

const router = useRouter()

function previousStep() {
  currentStep.value--
}

function nextStep() {
  currentStep.value++
}

function finalize() {
  const route = '/'
  router.push(route)
}
</script>

<template>
  <div>
    <component
      :is="steps[currentStep].component"
      v-bind="formData"
      v-if="currentStep >= 0 && currentStep < steps.length"
      v-model="formData"
      @next="nextStep"
      @skip="previousStep"
      @finalize="finalize"
    />
  </div>
</template>

<style>
.step-progress {
  display: flex;
  justify-content: space-between;
}
.step-bar {
  flex: 1;
  height: 4px;
  margin-right: 8px;
  border-radius: 100px;
  background-color: rgba(103, 80, 164, 0.16);
}
.step-bar.active {
  background-color: var(--bg-color-blue);
}
</style>
