<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const aiModels = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Gemini', value: 'gemini' }
]

const selectedModel = ref(localStorage.getItem('ai_model') || aiModels[0].value)

function saveSettings() {
  localStorage.setItem('ai_model', selectedModel.value)
}
</script>

<template>
  <v-container class="settings-container">
    <v-card class="pa-4">
      <v-card-title>{{ t("change_ai_model") }}</v-card-title>
      <v-card-text>
        <v-select
          v-model="selectedModel"
          :items="aiModels"
          item-title="label"
          item-value="value"
          label="AI MODELS"
        />
        <v-btn class="mt-4" color="#0CA385" @click="saveSettings">
          {{ t('Save Settings') }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
}
</style>
