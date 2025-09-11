// https://tanstack.com/query/v5/docs/framework/vue/examples/nuxt3
import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { VueQueryPlugin, QueryClient, onlineManager, hydrate, dehydrate } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export default defineNuxtPlugin((nuxtApp) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // https://github.com/TanStack/query/discussions/7027
  // https://tanstack.com/query/latest/docs/reference/onlineManager
  // TanStack Query's 'onlineManager' incorrectly assumes the user is online when
  // initializing, setting 'onlineManager.setOnline(true)' by default, this cause
  // issues in offline scenarios, where mutations might fail due to network
  // unavailability, but TanStack Query still behaves as if the network is available.
  if (!navigator.onLine) {
    onlineManager.setOnline(false)
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24,
      },
    },
  })

  const localStoragePersister = createSyncStoragePersister({
    storage: window.localStorage,
  })

  const options: VueQueryPluginOptions = {
    queryClient: queryClient,
    clientPersister: (queryClient) => {
      return persistQueryClient({
        queryClient,
        persister: localStoragePersister,
      })
    },
    clientPersisterOnSuccess: (client) => {
      const resumeMutations = () => {
        client.resumePausedMutations();
        unsubscribe();
      }

      const unsubscribe = onlineManager.subscribe((isOnline) => {
        if (isOnline) {
          resumeMutations();
        }
      });

      if (onlineManager.isOnline()) {
        resumeMutations();
      }
    },
  }

  nuxtApp.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxtApp.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxtApp.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})