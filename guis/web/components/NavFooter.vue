<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
function isActive(route: string) {
  return useRoute().path === route
}
</script>

<template>
  <footer class="footer footer-fixed">
    <div class="circle mb-12" />
    <nav class="footer__nav">
      <v-container class="d-flex pa-0 justify-space-evenly align-center">
        <NuxtLink id="home-gtm" :to="localePath({ name: 'index' })" class="footer__nav-item pr-3">
          <div class="footer__nav-item-container" v-ripple>
            <div class="footer__nav-item-image">
              <v-icon :icon="isActive(localePath({ name: 'index' })) ? 'mdi-home-variant' : 'mdi-home-variant-outline'" size="x-large" />
            </div>
            <span>Home</span>
          </div>
        </NuxtLink>
        <NuxtLink :to="localePath({ name: 'tips' })" class="footer__nav-item">
          <button alt="Scan" elevation="0" stacked variant="text" class="footer__nav-item-camera-container">
            <div class="footer__nav-item-image pl-1" v-ripple>
              <v-icon icon="mdi-camera" color="#fff" size="x-large" />
            </div>
          </button>
        </NuxtLink>
        <NuxtLink id="gallery-gtm" :to="localePath({ name: 'gallery' })" class="footer__nav-item pl-2">
          <div class="footer__nav-item-container" v-ripple>
            <div class="footer__nav-item-image">
              <v-icon :icon="isActive(localePath({ name: 'gallery' })) ? 'mdi-image-multiple' : 'mdi-image-multiple-outline'" size="x-large" />
            </div>
            <span>{{ t('gallery') }}</span>
          </div>
        </NuxtLink>
      </v-container>
    </nav>
  </footer>
</template>

<style>
.circle {
  width: 70px;
  height: 70px;
  border-radius: 900px;
  position: fixed;
  background-color: #fff;
  z-index: 3;
  margin-top: 32px;
  margin-right: 1.1px;
  border-top: 1px solid #C0C0C0;
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.footer__nav {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  max-width: 800px;
  flex-wrap: nowrap;
  background-color: #fff;
  border-top: 1px solid #C0C0C0;
}

.footer__nav-item {
  color: #fff;
  font-weight: bold;
  text-decoration: none;
  font-size: 13px;
  border-radius: 9999px;
  z-index: 5;
}

.footer__nav-item-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  /* align spans to center */
  color: var(--m-3-ref-neutral-neutral-50, #75777A);
}

.footer__nav-item-camera-container {
  background: linear-gradient(160deg, #01875F 0%, #7EF8D5 100%);
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.50);
  border-radius: 9999px;
  margin-bottom: 20px;
  font-size: 13px;
  flex-shrink: 0;
  align-self: stretch;
  height: 40px;
  width: 40px;
}

.footer__nav-item-image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
}
</style>
