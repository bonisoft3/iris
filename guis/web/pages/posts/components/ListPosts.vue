<script setup>
defineProps({
  posts: Object,
})

const { t } = useI18n()

function fallbackImage(event) {
  event.target.src = ''
}

const show = ref(false)

onMounted(() => {
  show.value = true
})
</script>

<template>
  <Transition name="slide-right" mode="out-in">
    <v-container v-if="show" class="app-content">
      <v-row>
        <v-col v-for="(post, index) in posts" :key="index" cols="12" md="4">
          <v-card v-if="post.title && post.title !== '[Removed]' && (post.sourcename !== 'Noticiasautomotivas.com.br' && post.sourcename !== 'Desencadenado.com')" class="rounded">
            <img v-if="post.urltoimage" class="pl-4 pr-4 pt-4" :src="post.urltoimage" @error="fallbackImage">
            <p class="px-4 text-base font-weight-regular primary-text">
              {{ post.title }}
            </p>
            <p class="px-4">
              {{ post.description }}
            </p>
            <v-card-actions class="justify-end">
              <a :href="post.url" target="_blank" rel="noopener noreferrer">
                <v-btn class="text-capitalize">
                  <v-icon class="mr-2 mt-1 text-sm primary-text">
                    mdi-arrow-right
                  </v-icon>
                  <span class="primary-text text-sm">{{ t('learn_more') }}</span>
                </v-btn>
              </a>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Transition>
</template>

<style scoped>
img{
  width:100%;
}
.rounded {
  border-radius: 12px !important;
}

@media only screen and (min-width: 768px) {
  .app-content{
    max-width: 768px;
  }
  .v-col-md-4{
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}
</style>
