<script setup lang="ts">
import { ref } from "vue";
import type { User } from "firebase/auth";
import type UserIris from "#build/interfaces/UserIris";
import type UserCityData from "#build/interfaces/UserCityData";
import { usePlacesAutocomplete, geocodeByAddress, getLatLng } from 'vue-use-places-autocomplete';
import { VPhoneInput } from 'v-phone-input';
import 'flag-icons/css/flag-icons.min.css'
import 'v-phone-input/dist/v-phone-input.css'
import { GoogleMap, Marker } from 'vue3-google-map'
import { update } from "firebase/database";
const { t } = useI18n();
const user: User | null = await getCurrentUser();
const config = useRuntimeConfig();
const phoneNumber = ref("");
const homeAddress = ref("");
const addressComplement = ref("");
const userRegistered = ref(false);
const dialog = ref(false);
const completions = ref<string[]>([]);
const showSuggestions = ref(true);
const center = ref<{ lat: number, lng: number }>({ lat: 37.44194138434798, lng: -122.14301538466479 })
const mapKey = ref(0);
const userInfo = ref<UserIris | null>(null);
const userCityData: Ref<UserCityData> = ref({ city: '' });

const { suggestions } = usePlacesAutocomplete(homeAddress, {
	debounce: 500,
	minLengthAutocomplete: 3,
	apiKey: config.public.PLACES_API_KEY as string,
})

const turnOffAutocomplete = () => {
	if (showSuggestions.value)
		showSuggestions.value = false;
	else if (!showSuggestions.value)
		showSuggestions.value = true;
};

async function setUserCity() {
	try {
		const response = await fetch('https://us-central1-trash-362115.cloudfunctions.net/geolocation');
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Failed to fetch user city:', error);
		return 'Unable to determine city.';
	}
}

async function getUserCity() {
	userCityData.value = await setUserCity();
}

async function updateCenter(address: string) {
	try {
		const results = await geocodeByAddress(String(address));
		const { lat, lng } = await getLatLng(results[0]);
		center.value.lat = lat;
		center.value.lng = lng;
	} catch (error) {
		console.error('Error geocode:', error);
	}
	mapKey.value++;
}

watch(suggestions, () => {
	completions.value = []
	suggestions.value.forEach(suggestion => completions.value.push(suggestion.description))
})

const data = reactive({
	isExpanded: false,
})
async function userAlreadyRegistered(
	firebaseId: string | undefined
): Promise<boolean> {
	const path = `useriris?firebaseid=eq.${firebaseId ?? ""}`;
	const url = config.public.SERVICES_PGRST_URL_PREFIX + path;
	const res = await fetch(url);
	const userIris: UserIris[] = await res.json();
	return userIris.length !== 0;
}

async function setUserInfo() {
	const path = "trash.tracker.v1.TrackerService/GetUserInfo";
	const url = config.public.SERVICES_TRACKER_URL_PREFIX + path;
	try {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify({
				userId: user?.uid,
			})
		});
		const data = await response.json();
		return data;
	} catch (e) {
		console.error(e);
		userRegistered.value = false;
		return null;
	}
}
async function getUserInfo() {
	userInfo.value = await setUserInfo();
}

async function saveUser() {
	const path = "trash.tracker.v1.TrackerService/SaveUser";
	const url = config.public.SERVICES_TRACKER_URL_PREFIX + path;
	try {
		await $fetch(url, {
			method: "POST",
			body: {
				user: {
					firebaseId: user?.uid,
					homeAddress: homeAddress.value,
					phoneNumber: phoneNumber.value,
					addressComplement: addressComplement.value,
				},
			},
		});
		userRegistered.value = true;
		const previousUrl = window.sessionStorage.getItem("previousUrl");
		if (previousUrl) {
			window.location.href = previousUrl;
		} else {
			window.location.href = "/gallery";
		}
	} catch (e) {
		userRegistered.value = false;
	}
	dialog.value = false;
}

async function editUser() {
	const path = "trash.tracker.v1.TrackerService/EditUser";
	const url = config.public.SERVICES_TRACKER_URL_PREFIX + path;
	try {
		await $fetch(url, {
			method: "POST",
			body: {
				user: {
					firebaseId: user?.uid,
					homeAddress: homeAddress.value,
					phoneNumber: phoneNumber.value,
					addressComplement: addressComplement.value,
				},
			},
		});
		userRegistered.value = true;
		const previousUrl = window.sessionStorage.getItem("previousUrl");
		if (previousUrl) {
			window.location.href = previousUrl;
		} else {
			window.location.href = "/gallery";
		}
	} catch (e) {
		userRegistered.value = false;
	}
	dialog.value = false;
}

onBeforeMount(async () => {
	userRegistered.value = await userAlreadyRegistered(user?.uid);
	await getUserInfo();
	await setUserCity();
	await getUserCity();
	await updateCenter(String(userCityData.value.city));
});
</script>

<template>
	<div>
		<v-container class=" pl-0 pr-0 d-flex flex-column align-center pt-1">
			<v-card class="padded-card" height="100vh" max-width="800px" width="100% !important">
				<div class="centered-container">
					<div class="content-wrapper">
						<v-card-title class="disclaimer font-weight-medium pt-4">
							{{ t('profile') }}
						</v-card-title>
						<v-card-text class="centered-container ">
							{{ t('update_profile') }}
						</v-card-text>
						<VPhoneInput v-model="phoneNumber" :label="t('phone')" country-icon-mode="svg"
							style="margin-bottom: 0px; text-align:left;"
							:hint="typeof userInfo?.address !== 'undefined' ? '' + userInfo.phoneNumber : ''"
							persistent-hint />
					</div>
				</div>
				<div class="centered-container">
					<div class="content-wrapper">
						<div style="position: relative; margin-bottom: 0px;">
							<v-text-field width="100%" v-model="homeAddress" :label="t('address')"
								:hint="typeof userInfo?.address !== 'undefined' ? '' + userInfo.address : ''"
								persistent-hint style="text-align:left;" />
							<v-btn icon="mdi-account" density="comfortable" size="small" title="Confirm Address"
								@click="turnOffAutocomplete"
								style="position: absolute; top: 34%; right: 4px; transform: translateY(-50%);">
								<v-icon>{{ showSuggestions ? 'mdi-checkbox-blank-outline' : 'mdi-checkbox-marked-outline'
								}}</v-icon>
							</v-btn>
							<div v-if="homeAddress && showSuggestions"
								style="position: absolute; top: 100%; left: 0; width: 100%; max-height: 150px; overflow-y: auto; z-index: 1000; background: white; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);">
								<v-list style="text-align:left;">
									<v-list-item @click="updateCenter(homeAddress)">
										{{ homeAddress }}
										<span style="font-size: 8px; color: gray;">(Manually Typed)</span>
									</v-list-item>
									<v-list-item v-for="(item, index) in showSuggestions ? completions : []" :key="index"
										@click="homeAddress = item; updateCenter(homeAddress)">
										{{ item }}
									</v-list-item>
								</v-list>
							</div>
						</div>
					</div>
				</div>
				<div class="centered-container">
					<div class="content-wrapper">
						<v-text-field v-model="addressComplement" :label="t('instructions')"
							style="margin-bottom: 5px; text-align:left;"
							:hint="typeof userInfo?.address !== 'undefined' ? '' + userInfo.addressComplement : ''"
							persistent-hint />
					</div>
				</div>
				<div class="centered-container">
					<div class="content-wrapper">
						<div class="map-container">
							<GoogleMap :zoom="16" :center="center" :disable-default-ui="true"
								style="width: 100%; height: 25vh;" :api-key="config.public.GOOGLE_MAPS_API_KEY"
								:key="mapKey">
								<Marker :options="{ position: center }" />
							</GoogleMap>
						</div>
					</div>
				</div>
				<template #actions v-if="userInfo?.address">
					<v-btn color="#0CA385" class="submit-button" type="submit"
						style=" text-align: center; background-color: rgb(12, 163, 133); color: rgb(255, 255, 255); caret-color: rgb(255, 255, 255); "
						:text="t('edit_info')" @click="editUser" />
				</template>
				<template #actions v-else>
					<v-btn color="#0CA385" class="submit-button" type="submit"
						style=" text-align: center; background-color: rgb(12, 163, 133); color: rgb(255, 255, 255); caret-color: rgb(255, 255, 255); "
						:text="t('save_info')" @click="saveUser" />
				</template>
			</v-card>
		</v-container>
	</div>
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
	padding: 0px;
	box-sizing: border-box;
}

.centered-container {
	display: flex;
	justify-content: center;
	text-align: center;
}

.content-wrapper {
	width: 80%;
	max-width: 800px;
	padding: 0;
	margin: 0;
}

.info-container {
	justify-content: center;
	max-width: 800px;
	margin: auto;
}

.submit-button {
	max-width: 800px;

	@media (min-width: 300px) {
		margin-left: 30px;
	}

	@media (min-width: 700px) {
		margin-left: 70px;
	}
}
</style>
