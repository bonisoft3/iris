<script setup lang="ts">
import type { User } from 'firebase/auth'
import logo from '../assets/images/logo-white.svg'
import LangSwitcher from './LangSwitcher.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const showMenu = ref(false)
const showLang = ref(false)
const user = ref<User | null>(null)
const photo = ref('')
const version = ref(config.public.IRIS_VERSION)
const anonymousUser = ref(false)
const menuItems = [
  { name: 'log_out', href: '/logout' },
  { name: 'support', link: 'support' },
  { name: 'profile', link: 'profile' },
  { name: 'settings', link: 'settings', line: true },
  { name: 'delete_account', link: 'dropout', line: true, condition: '!anonymousUser' },
];
function userMenu() {
  if (showLang.value)
    showLang.value = !showLang.value
  showMenu.value = !showMenu.value
}

function langSwitcher() {
  if (showMenu.value)
    showMenu.value = !showMenu.value
  showLang.value = !showLang.value
}

function closeMenu() {
  if (showMenu.value)
    showMenu.value = !showMenu.value
  if (showLang.value)
    showLang.value = !showLang.value
}

onMounted(async () => {
  user.value = await getCurrentUser()
  if (user.value) {
    photo.value = user.value?.photoURL ?? ''
    if (user.value.isAnonymous)
      anonymousUser.value = true
  }
})
</script>

<template>
  <ClientOnly>
    <div class="header-container d-flex">
      <header class="pl-4 d-flex" style="position: relative;">
        <div class="logo" v-ripple>
          <NuxtLink :to="localePath('index')">
            <picture>
              <img :src="logo" height="26" width="45" alt="Logo">
            </picture>
          </NuxtLink>
        </div>
        <div v-click-outside="closeMenu" class="d-flex w-100">
          <div class="pr-1 py-2 mb-1 button">
            <v-btn class="pa-2" :ripple="false" size="x-medium" variant="text" color="#0000" @click="langSwitcher"
              @touch="langSwitcher">
              <v-icon style="color: white;" icon="mdi-web" size="x-large" v-ripple/>
            </v-btn>
            <v-btn class="btn-user mx-auto pa-2" :ripple="false" size="x-medium" variant="text" color="#0000"
              @click="userMenu" @touch="langSwitcher">
              <v-avatar v-if="photo" :image="photo"  v-ripple/>
              <v-icon v-else style="color: white;" icon="mdi-account-circle-outline" size="x-large"  v-ripple/>
            </v-btn>
          </div>
          <div v-show="showMenu" class="user-menu px-0 py-2">
            <div v-for="item in menuItems" :key="item.name" :class="{ 'line': item.line }">
              <NuxtLink v-if="item.link" :to="localePath({ name: item.link })" @click="closeMenu">
                <p class="menu-item" style="color: #003C71;">
                  {{ t(item.name) }}
                </p>
              </NuxtLink>
              <a v-else class="menu-item" :href="item.href" @click="closeMenu">
                <button>
                  <p style="color: #003C71;">{{ t(item.name) }}</p>
                </button>
              </a>
            </div>
            <div class="pl-2 py-1">
              <span class="text-caption">{{ version }}</span>
            </div>
          </div>
          <div v-show="showLang" class="user-menu px-0 py-2">
            <LangSwitcher @close="closeMenu" />
          </div>
          <div v-show="showLang" class="user-menu px-0 py-2">
            <LangSwitcher @close="closeMenu" />
          </div>
        </div>
      </header>
    </div>
  </ClientOnly>
</template>

<style>
header {
  background-color: #0CA385;
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-around;
  box-shadow: 0px 4px 0px 0px #0CA385;
}

.header-container {
  background-color: #0CA385;
  justify-content: around;
  max-width: 800px;
  margin: auto;
}

.button {
  margin-left: auto;
}

.button i {
  color: rgba(0, 60, 113, 0.75);
}

.text {
  color: #003c71;
  font-weight: normal;
}

.line {
  flex-grow: 1;
  border-style: solid;
  border-width: 0px 0px 0.02px;
  border-color: #bfc9c3;
}

.menu-item {
  padding: 8px;
  display: block;
  color: #8FACC0;
  font-weight: 400;
  text-decoration: none;
}

.menu-item:hover {
  background-color: #DBE5DF;
  color: #003C71;
  font-weight: 700;
}

.user-menu {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 200px;
  z-index: 10000;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  background-color: #e7f0f1;
  user-select: none;
  right: 0;
  top: 50px;
  box-shadow: 0px 2px 6px 2px #00000026,
    0px 1px 2px 0px #0000004D;
}

.user-menu a {
  color: #8FACC0;
  font-weight: 400;
  text-decoration: none;
}

@media (max-width: 600px) {
  .user-menu {
    position: absolute;
    right: 0;
    transform: translateX(calc(100% - 180px));
    display: flex;
    flex-direction: column;
    width: 168px;
    z-index: 10000;
    background: #fff;
    border-radius: 4px 4px 0px 0px;
    padding: 16px;
    background-color: #e7f0f1;
    user-select: none;
  }
}
</style>
