<script setup>
defineProps({
  post: Object,
})

const emit = defineEmits(['closePost'])

function closePost() {
  emit('closePost', { id: null })
}
</script>

<template>
  <div class="content-post">
    <header class="pa-4">
      <button @click="closePost()">
        <v-icon class="primary-text">
          mdi-arrow-left
        </v-icon>
      </button>
      <h1 class="text-1xl mt-6 primary-text font-weight-400">
        {{ post.title }}
      </h1>
    </header>
    <section class="content">
      <p class="pa-4" v-html="post.text" />
    </section>
  </div>
</template>

<style scoped>
header{
  display: block
}
.content{
  background: #fff;
  font-size: 14px;
  margin-bottom: 100px;
}
@media only screen and (min-width: 768px) {
  .content-post{
    max-width: 768px;
    margin: 0 auto
  }
}
</style>
