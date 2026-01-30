<script setup lang="ts">
import LogRocket from 'logrocket'
import { deleteUser, getAuth, reauthenticateWithCredential } from 'firebase/auth'
import { useRouter } from 'vue-router'
import * as firebaseAuth from 'firebase/auth'
import * as firebaseui from 'firebaseui'
import { onMounted } from 'vue'
import 'firebaseui/dist/firebaseui.css'
import { UAParser } from 'ua-parser-js'
import XButton from '../../components/XButton.vue'

const { t } = useI18n()
const router = useRouter()
const user = useCurrentUser()
const reauthenticated = ref(false)
LogRocket.log('user logged', user)
const config = useRuntimeConfig()

function closeModal() {
  router.go(-1)
}

async function deleteAccount() {
  const auth = getAuth()
  const user = auth.currentUser
  if (user != null) {
    deleteUser(user).then(() => {
      return true
    }).catch(() => {
      return false
    })
  }
}

async function dropout() {
  try {
    const path = '/trash.tracker.v1.TrackerService/Dropout'
    const url = config.public.SERVICES_TRACKER_URL_PREFIX + path
    if (!user.value?.uid)
      return
    $fetch(url, {
      method: 'POST',
      body: {
        userId: user.value?.uid,
      },
    })
    await deleteAccount()
    router.push('/login')
  }
  catch (error) {
    return null
  }
}

function isSafariAndNotMobile() {
  const parser = new UAParser()
  const result = parser.getResult()
  return result.browser.name === 'Safari' && result.device.type !== 'mobile'
}

onMounted(async () => {
  const auth = useFirebaseAuth()

  if (!auth)
    throw new Error('Firebase Auth instance not found')

  let ui = firebaseui.auth.AuthUI.getInstance()
  if (!ui)
    ui = new firebaseui.auth.AuthUI(auth)
  else
    ui.reset()

  const signInMethod = isSafariAndNotMobile() ? 'popup' : 'redirect'
  const uiConfig = {
    signInSuccessUrl: '/dropout',
    signInFlow: signInMethod,
    signInOptions: [
      firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
      firebaseAuth.FacebookAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: (authResult: any, _redirectUrl: string) => {
        reauthenticateWithCredential(authResult.user, authResult.credential)
        router.push({ path: '/dropout' })
        reauthenticated.value = true
        return false
      },
    },
  }
  ui.start('#firebaseui-auth-container', uiConfig)
})
</script>

<template>
  <div v-if="!reauthenticated" class="container login mt-4 mb-4">
    <div class="modal-content primary-bg">
      <v-card
        width="100%"
        color="#BFE4D2"
        variant="elevated"
        min-width="300"
        min-height="300"
        class="mx-auto"
      >
        <div class="card-items d-flex align-center justify-center mt-4 ">
          <v-card-item flat class="d-flex align-center justify-center mt-4" style="width: auto; padding-inline: 4rem;">
            <div class="text-h6">
              {{ t('confirm_identity') }}
            </div>
          </v-card-item>
        </div>
        <div class="card-actions d-flex align-center justify-center mt-4">
          <v-card-actions>
            <section id="firebaseui-auth-container" />
          </v-card-actions>
        </div>
      </v-card>
    </div>
  </div>

  <div v-else class="container confirmation mt-4 mb-4">
    <div class="modal-content primary-bg">
      <v-card
        width="100%"
        color="#BFE4D2"
        variant="elevated"
        min-width="300"
        min-height="300"
        class="mx-auto"
      >
        <v-card-item class="mb-4">
          <XButton @x-button-clicked="closeModal" />
        </v-card-item>
        <div class="card-items d-flex align-center justify-center mt-4">
          <v-card-item>
            <div class="text-h6" style="margin-top: 50%;">
              {{ t('are_you_sure') }}
            </div>
          </v-card-item>
        </div>
        <div class="card-actions d-flex align-center justify-center mt-4">
          <v-card-actions>
            <v-btn style="background-color: #0CA385; color: white;" @click="dropout">
              {{ t('yes_delete_account') }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.container{
  display: flex;
  align-content: center;
  justify-content: center;
  margin: auto;
  width: 100%;
}
</style>
