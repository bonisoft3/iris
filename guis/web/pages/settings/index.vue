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
  <v-container class="app-content" style="max-width: 800px; padding: 65px 0 0 0; height: 100vh;">
    <v-card class="d-flex align-center">
      <v-card-title class="disclaimer font-weight-medium pt-4">{{ t("change_ai_model") }}</v-card-title>
      <v-card-text class="modal">
        <v-select
          v-model="selectedModel"
          :items="aiModels"
          item-title="label"
          item-value="value"
          :label="t('ia_model')"
        />
        <v-btn color="#0CA385" @click="saveSettings">
          {{ t("save_settings") }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>

.disclaimer {
	text-align: center;
	color: #003C71BF;
	font-size: 20px;
}

.app-content {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20px;
	box-sizing: border-box;
}

.align-center {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
}

.modal {
	min-height: 100vh;
	overflow-y: auto;
	top: 50;
	left: 50;
	width: 80%;

	justify-content: center;
	align-items: center;
}

:deep(#page-wrapper) {
	width: inherit !important;
}

:deep(#page) {
	width: inherit !important;
}

:deep(.details) {
	width: inherit !important;
}

.modal-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.modal-title {
	margin-top: 0%;
	font-size: 22px;
	color: #fff;
	font-weight: 400;
}

.modal-title i {
	color: #fff;
	text-decoration: none;
	font-size: 22px;
	align-self: center;
}

.modal-content img {
	min-height: 10%;
	object-fit: contain;
	border-radius: 3%;
}

.modal-button-right v-icon {
	margin-right: 5px;
}

@media only screen and (min-width: 768px) {
	.modal-content {
		width: 350px;
	}
}
</style>
