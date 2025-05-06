<script lang="ts">
export default {
  name: 'AuthLayout',
}
</script>

<template>
  <v-app class="auth-layout">
    <v-card class="auth-container">
      <img src="../assets/images/logo-colorful.svg" alt="Logo">
      <slot />
    </v-card>
  </v-app>
</template>

<style scoped>
.auth-container {
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 600px;
  width: 100%;
  margin: auto;
  padding: 40px 40px 20px 40px;
  box-shadow: 0 0px 0px 0;
  background: #0CA385;
}

.auth-container img{
  width: 90%;
  margin-left:22%;
}
</style>
