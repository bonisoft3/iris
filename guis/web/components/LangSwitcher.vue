<script setup>
const { locale, locales, setLocale } = useI18n()
const emit = defineEmits(['close'])

const availableLocales = computed(() => {
  return (locales.value).filter(i => i.code !== locale.value)
})

const switchLanguage = (code) => {
	setLocale(code)
  emit('close')
}
</script>

<template>
  <a v-for="l in availableLocales" :key="l.code" href="#" class="menu-item py-2" style="color: #003C71;" @click.prevent.stop="switchLanguage(l.code)">
    {{ l.name }}
  </a>
</template>

<style scoped>


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
</style>
