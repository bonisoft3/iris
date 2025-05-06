<template>
  <div class="animation-right">
    <img src="@/assets/images/Vector01.svg">
    <img src="@/assets/images/Vector02.svg">
    <img src="@/assets/images/Vector03.svg">
  </div>
</template>

<style>
.animation-right{
  position: absolute;
  z-index: -1;
  right: -50px;
  bottom: -150px;
  width: 350px;
}
.animation-right img {
  position: absolute;
  bottom: -100px;
  right: -90px;
  width: 100%;
}

.animation-right img:nth-child(1) {
  animation: rotate-1 30s linear infinite;
}

.animation-right img:nth-child(2) {
  animation: rotate-2 30s linear infinite;
}

.animation-right img:nth-child(3) {
  animation: rotate-3 30s linear infinite;
}

@keyframes rotate-1 {
  0% {
    transform: rotate(200deg);
  }
  33% {
    transform: rotate(120deg);
  }
  66% {
    transform: rotate(240deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotate-2 {
  0% {
    transform: rotate(120deg);
  }
  33% {
    transform: rotate(240deg);
  }
  66% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes rotate-3 {
  0% {
    transform: rotate(240deg);
  }
  33% {
    transform: rotate(360deg);
  }
  66% {
    transform: rotate(120deg);
  }
  100% {
    transform: rotate(240deg);
  }
}
</style>
