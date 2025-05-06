<script setup>
import { getCurrentInstance } from 'vue'

defineProps({
  image: String,
})

const instance = getCurrentInstance()

const itemsList = [
  { number: '1', title: 'Empty and dry the packaging.' },
  { number: '2', title: 'Leave the caps and labels.' },
  { number: '3', title: 'Crush if necessary.' },
]

function hideModalInfo() {
  instance.emit('hideModalInfo')
}

function confirmImageSaveModal() {
  instance.emit('confirmImageSaveModal')
}
</script>

<template>
  <div class="overlap mx-auto px-8">
    <div class="content primary-bg pb-4">
      <div class="content-image">
        <img :src="image">
      </div>
      <div class="d-flex text-base pa-4">
        <v-icon icon="mdi-recycle" />
        <h1 class="text-base ml-2">
          Recyclable Material
        </h1>
      </div>
      <div class="d-flex flex-wrap tag px-4" style="width: 80%;">
        <tag class="d-flex pa-2 ml-1 mt-2">
          <v-icon icon="mdi-hand-water" color="#006B56" />
          <span class="primary-text font-weight-500">Dry</span>
        </tag>
        <tag class="d-flex pa-2 ml-1 mt-2">
          <v-icon icon="mdi-bottle-soda-classic-outline" color="#006B56" />
          <span class="primary-text font-weight-500">Plastic</span>
        </tag>
        <tag class="d-flex pa-2 ml-1 mt-2">
          <v-icon icon="mdi-medication-outline" color="#006B56" />
          <span class="primary-text font-weight-500">Medicine packaging</span>
        </tag>
      </div>
      <div class="list px-4">
        <v-divider class="my-4" />
        <h2 class="text-left mb-2 text-sm-1xl font-weight-regular">
          How to dispose
        </h2>
        <v-list class="primary-bg mb-6">
          <v-list-item v-for="item in itemsList" :key="item.title" class="d-flex ml-n4">
            <v-list-item-title>
              <span class="number" v-text="item.number" />
              <span v-text="item.title" />
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
      <div class="my-8 px-8 text-end">
        <a class="secundary-text text-decoration-none mr-8" @click="hideModalInfo">Discard</a>
        <a class="secundary-text text-decoration-none" @click="confirmImageSaveModal">Save</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlap {
  z-index: 50010;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 28px;
  width: 100%
}

.content {
  border-radius: 28px;
}

.content-image {
  max-width: 100%;
  max-height: 180px;
  width: 100%;
  position: relative;
  border-radius: 28px 28px 0px 0px;
  overflow: hidden;
}

.content-image img {
  width: 100%;
  height: 60vh;
  margin-top: -50%;
}

.tag tag {
  border-radius: 8px;
  border: 1px solid #6F7975;
  text-align: center;
  justify-content: center;
  max-width: max-content;
}

.list .number {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #7EF8D5;
  color: #002018;
  text-align: center;
  line-height: 40px;
  font-size: 14px;
  font-weight: bold;
  margin-right: 8px;
}
</style>
