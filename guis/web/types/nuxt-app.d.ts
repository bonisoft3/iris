// This module declaration is used to fix typecheck errors related to the internal Nuxt 3 module `#app`.
// It declares `useNuxtApp` with the correct return type, `NuxtApp`, to resolve TypeScript errors.
// This is a workaround until proper type definitions are available.
declare module '#app' {
  import type { NuxtApp } from '@nuxt/types';

  export function useNuxtApp(): NuxtApp;
}

// The below declarations are used to fix typecheck errors related to the internal @vite-pwa/nuxt module during pnpm assemble command.
declare module '#imports' {
  export * from '#app'
  export * from '@vueuse/core'
  export * from 'vue'

  import { defineNuxtPlugin as dnp } from '#app'
  export const defineNuxtPlugin: typeof dnp
}
declare module '#pwa' {
  export const useApplePwaIcon: any
  export const useAppleSplashScreenPwaIcon: any
  export const useFaviconPwaIcon: any
  export const useMaskablePwaIcon: any
  export const useTransparentPwaIcon: any
}

declare module '#build/pwa-icons/*' {
  const component: any
  export default component

  export type PWAIcons = any
  export type PwaAppleImageProps = any
  export type PwaAppleSplashScreenImageProps = any
  export type PwaFaviconImageProps = any
  export type PwaMaskableImageProps = any
  export type PwaTransparentImageProps = any
}
