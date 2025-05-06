<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath({ name: 'tips' })">
    <button class="indeterminate-question-box" style="display: flex; justify-content: center;">
      <img src="@/assets/images/indeterminate-question-box.svg" style="align-self: center;">
    </button>
  </NuxtLink>
</template>

<style>
.indeterminate-question-box {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid #fff;
  color: #fff;
  font-size: 18px;
  position: absolute;
  left: 50px;
  bottom: 35px;
  z-index: 50002;
}
</style>
