<script setup lang="ts">
import loggedAsGuest from '~/assets/images/logged-as-guest.svg'
</script>

<template>
  <div class="d-flex justify-center">
    <div class="d-inline-flex align-center justify-center flex-column" style="height: 80vh">
      <img :src="loggedAsGuest" width="55" height="68" alt="User Logged as Guest">
      <h2 class="font-weight-regular mt-6 mb-1">
        Ops. Empty but not for long!
      </h2>
      <p class="font-size font-weight-regular">
        You are here as a visitor.
      </p>
      <p class="font-size font-weight-regular">
        Unlock your own gallery.
      </p>
      <div class="login px-4 py-2 mt-4 rounded-pill w-75">
        <router-link to="/login" class="text-white text-center text-decoration-none">
          <p>Sign in</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-size {
  color: var(--text-primary-color);
  font-size: 16px;
}

h2 {
  font-size: 22px;
  color: var(--text-primary-color);
}

.login {
  background-color: #468A76;
}
</style>
