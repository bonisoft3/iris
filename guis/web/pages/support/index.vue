<script setup lang="ts">
import { ref } from 'vue'

const { t } = useI18n()
const name = ref('')
const email = ref('')
const message = ref('')

function submitForm() {
	const mailto = `mailto:iris.anacarolina@gmail.com?subject=Mensagem de ${name.value}&body=Nome: ${name.value}%0AEmail: ${email.value}%0A%0AMensagem:%0A${message.value}`
	window.location.href = mailto
}
</script>

<template>
	<v-container class="app-content" style="max-width: 800px; padding: 100px 0 0 0; height: 100vh;">
		<v-card class="d-flex align-center">
			<v-card-title class="disclaimer font-weight-medium pt-4">
				{{ t('contact_us') }}
			</v-card-title >
			<v-card-text style="margin: 0px 20px 0px 20px; text-align: center;">
				{{ t('doubts_and_suggestions') }}
			</v-card-text>
			<v-form class="modal" @submit.prevent="submitForm">
				<v-text-field v-model="name" :label="t('your_name')" required />
				<v-text-field v-model="email" :label="t('your_email')" required />
				<v-textarea v-model="message" :label="t('your_message')" required />
				<v-btn type="submit" color="#0CA385">
					{{ t('write_email') }}
				</v-btn>
			</v-form>
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
	margin-top: 2%;
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
