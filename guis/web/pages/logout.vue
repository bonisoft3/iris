<script lang="ts" setup>
import 'firebaseui/dist/firebaseui.css'

definePageMeta({
  layout: 'auth',
})

onMounted(async () => {
  const auth = useFirebaseAuth()!
  await auth.signOut()
})
</script>

<template>
  <main>
    <LeftAnimation />
    <a class="text-white text-body-1">Thanks for using <v-btn to="/login" rounded="xl" class="home-button">Iris!</v-btn></a>
    <RightAnimation />
  </main>
</template>

<style>
.v-application__wrap {
  background: #0CA385
}

.v-application {
  overflow: hidden;
}

.home-button {
  background: #0CA385;
  color: #fff;
}
</style>
