<script setup>
import { ref } from 'vue'
import ListPosts from './components/ListPosts.vue'

const showPost = ref(false)
const news = ref([])
const config = useRuntimeConfig()

onMounted(async () => {
  const query = 'newsitem?select=*&limit=200&lang=eq.'
  const url = config.public.SERVICES_PGRST_URL_PREFIX + query + lang
  const { data } = await useFetch(url, async () => $fetch.raw(url))
  if (data.value !== undefined)
    news.value = data.value
})
</script>

<template>
  <div>
    <ListPosts v-if="!showPost" :posts="news" />
  </div>
</template>

<style scoped>
.rounded {
  border-radius: 12px !important;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active em versões anteriores a 2.1.8 */
  {
  transform: translateX(10px);
  opacity: 0;
}
</style>
