<script setup lang="ts">
import UserGalleryComponent from "./components/UserGalleryComponent.vue";
import GlobalGalleryComponent from "./components/GlobalGalleryComponent.vue";
import type UserIris from '#build/interfaces/UserIris'
import type { User } from 'firebase/auth'

const config = useRuntimeConfig()
const user: User | null = await getCurrentUser()
const { t } = useI18n()
const show = ref(false)
// const loggedAsGuest = user.isAnonymous
const loggedAsGuest = false
const defaultGallery = loggedAsGuest ? 'global' : 'user'
const galleryState = ref(localStorage.getItem('galleryState') || defaultGallery)
const isUserGallery = computed(() => galleryState.value === 'user')
const isGlobalGallery = computed(() => galleryState.value === 'global')

const { trashItems: globalTrashItems, isPending } = useTrashItems()
const userTrashItems = computed(() => globalTrashItems.value?.filter((item) => item.pbjson.userId === user?.uid) || [])
const isRegistered = await userAlreadyRegistered(user?.uid);

async function userAlreadyRegistered(firebaseId: string | undefined): Promise<boolean> {
  const path = `useriris?firebaseid=eq.${firebaseId ?? ''}`
  const url = config.public.SERVICES_PGRST_URL_PREFIX + path
  const res = await fetch(url)
  const userIris: UserIris[] = await res.json()
  return userIris.length !== 0
}

function switchGallery() {
	galleryState.value = isGlobalGallery.value ? 'user' : 'global'
	localStorage.setItem('galleryState', galleryState.value)
}

onMounted(() => {
	show.value = true;
  localStorage.setItem('userRegistered', JSON.stringify(isRegistered));
});
</script>

<template>
	<Transition name="slide-right" mode="out-in">
		<div v-if="show">
			<div class="app-content slide-right">
				<div class="gallery primary-bg">
					<div class="heading-wrapper">
						<div class="d-flex pt-1">
							<div class="w-50 text-center font-weight-medium" :class="{ highlight: isUserGallery }"
								@click="switchGallery">
								<p class="gallery-text pt-3" :class="{ 'selected-gallery': isUserGallery }">
									{{ t("your_pics") }}
								</p>
								<div class="mb-2">
									<VSkeletonLoader v-if="isPending" class="mx-auto" elevation="2" min-width="50px" width="20px"
										height="20px" />
									<p v-else class="pictures-count font-weight-regular mb-2">{{ userTrashItems.length }}</p>
								</div>
							</div>
							<div class="w-50 text-center font-weight-medium" :class="{ highlight: isGlobalGallery }"
								@click="switchGallery">
								<p class="gallery-text pt-3" :class="{ 'selected-gallery': isGlobalGallery }">
									IRIS Global
								</p>
								<div class="mb-2">
									<VSkeletonLoader v-if="isPending" class="mx-auto" elevation="2" min-width="50px" width="20px"
										height="20px" />
									<p v-else class="pictures-count font-weight-regular mb-2">{{ globalTrashItems.length }}</p>
								</div>
							</div>
						</div>
					</div>
					<div class="mr-0 mt-2">
						<v-row v-if="isPending" no-gutters>
							<v-col v-for="_ in 8" :key="_" cols="6" class="pa-1">
								<VSkeletonLoader :loading="true" class="mx-auto" elevation="2" min-width="50px" height="100%" type="image" />
							</v-col>
						</v-row>
						<KeepAlive v-else class="mr-0 mt-2">
							<component v-if="isGlobalGallery" :is="GlobalGalleryComponent" :trashItems="globalTrashItems" />
							<component v-else :is="UserGalleryComponent" :trashItems="userTrashItems"
								:logged-as-guest="loggedAsGuest" />
						</KeepAlive>
					</div>
				</div>
			</div>
		</div>
	</Transition>
</template>

<style scoped>
.highlight {
	border-bottom: 3px solid #006b56;
	background: #fbfcff !important;
}

.selected-gallery {
	color: #006b56 !important;
}

.heading-wrapper {
	top: 0;
	z-index: 10;
	position: sticky;
	background-color: white;
	max-width: 800px;
	width: 100%;
}

.gallery-text {
	color: #6f7975;
	font-size: 15px;
}

.gallery {
	max-width: 800px;
	margin: 0 auto;
	overscroll-behavior: none;
}

.pictures-count {
	color: #6f7975;
}
</style>
