import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

const prevRoute = ref<RouteLocationNormalized>()

export default prevRoute
