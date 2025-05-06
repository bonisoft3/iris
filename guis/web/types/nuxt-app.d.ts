// This module declaration is used to fix typecheck errors related to the internal Nuxt 3 module `#app`.
// It declares `useNuxtApp` with the correct return type, `NuxtApp`, to resolve TypeScript errors.
// This is a workaround until proper type definitions are available.
declare module '#app' {
  import type { NuxtApp } from '@nuxt/types';

  export function useNuxtApp(): NuxtApp;
}
