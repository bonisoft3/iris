<script lang="ts" setup>
import { auth as uiAuth } from 'firebaseui'
import { getAuth, getRedirectResult } from 'firebase/auth'
import * as firebaseAuth from 'firebase/auth'
import { onMounted } from 'vue'
import 'firebaseui/dist/firebaseui.css'

const loggedIn = ref(false)

definePageMeta({
  layout: 'auth',
})

const auth = getAuth()
getRedirectResult(auth)
  .then((result) => {
    if (result)
      window.location.href = '/'
  })

onMounted(async () => {
  const auth: any = useFirebaseAuth()
  if (!auth)
    throw new Error('Firebase Auth instance not found')
  let ui = uiAuth.AuthUI.getInstance()
  if (!ui)
    ui = new uiAuth.AuthUI(auth)
  else
    ui.reset()

  const signInMethod = 'redirect'
  const uiConfig = {
    signInSuccessUrl: localStorage.getItem('visitedBefore') === 'true' ? '/' : '/intro',
    signInFlow: signInMethod,
    signInOptions: [
      'apple.com',
      firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
      firebaseAuth.FacebookAuthProvider.PROVIDER_ID,
      uiAuth.AnonymousAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        loggedIn.value = true
        return true
      },
    },
  }
  ui.start('#firebaseui-auth-container', uiConfig)
  // Monkey patch firebase 9 to have firebase 8 signature
  auth.signInAnonymously = () => firebaseAuth.signInAnonymously(auth)
})
</script>

<template>
  <main>
    <LeftAnimation />
    <section id="firebaseui-auth-container" />
    <RightAnimation />
  </main>
  <div class="company-name">
    Davi de Castro Reis Consultoria em Tecnologia da Informação LTDA
  </div>
</template>

<style>
.apple-login-btn {
    text-transform: none;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: 0.4px;
    min-height: 40px;
    min-width: 64px;
    margin-top: 3em;
}

.apple-login-btn span {
    margin-left: 5px;
    margin-right: 5px;
}

.company-name {
    margin-top: 40%;
    width: 261px;
    text-align: center;
    color: white;
    font-family: Roboto;
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0.4px;
    word-wrap: break-word;
}

.firebaseui-page-provider-sign-in,
.firebaseui-page-select-tenant {
    background: inherit;
}

.firebaseui-container {
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    color: rgba(0, 0, 0, 0.87);
    direction: ltr;
    font:
        16px Roboto,
        arial,
        sans-serif;
    margin: 0 auto;
    max-width: 360px;
    overflow: visible;
    position: relative;
    text-align: left;
    width: 100%;
}
.firebaseui-card-content {
    padding: 0 24px;
}

.firebaseui-idp-list,
.firebaseui-tenant-list {
    list-style: none;
    margin: 1em 0;
    padding: 0;
}

.firebaseui-idp-list > .firebaseui-list-item,
.firebaseui-tenant-list > .firebaseui-list-item {
    margin-bottom: 15px;
    text-align: center;
}

.firebaseui-list-item {
    direction: ltr;
    margin: 0;
    padding: 0;
    text-align: left;
}

.firebaseui-idp-icon-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.firebaseui-idp-text.firebaseui-idp-text-short {
    display: none;
}

.firebaseui-idp-button {
    direction: ltr;
    font-weight: 500;
    height: auto;
    line-height: normal;
    max-width: 220px;
    min-height: 40px;
    padding: 8px 16px;
    text-align: left;
    width: 100%;
    border-radius: 100px;
    background: #fff;
}
.firebaseui-idp-google > .firebaseui-idp-text {
    color: #000;
}
.firebaseui-idp-icon {
    border: none;
    display: inline-block;
    height: 18px;
    vertical-align: middle;
    width: 18px;
}
.firebaseui-idp-text {
    display: table-cell;
    font-size: 14px;
    padding-left: 16px;
    text-transform: none;
    vertical-align: middle;
}

.firebaseui-idp-phone img {
    filter: invert(100%);
}

.firebaseui-idp-anonymous {
    background: none !important;
    color: #fff !important;
}

.firebaseui-idp-anonymous .firebaseui-idp-text {
    color: #fff !important;
}

.firebaseui-info-bar {
    background-color: #000;
    border: 1px solid #f0c36d;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    -webkit-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    left: 10%;
    padding: 8px 16px;
    position: absolute;
    right: 10%;
    text-align: center;
    top: 0;
}

.v-application {
    overflow: hidden;
}

.v-application__wrap {
    background: #0ca385;
}
</style>
