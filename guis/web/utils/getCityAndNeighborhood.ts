import type { RuntimeConfig } from 'nuxt/schema'
import type { GeocodeResponse } from '#build/interfaces/geocodeResponse'

export default async function getCityAndNeighborhood(lat: number, long: number, config: RuntimeConfig): Promise<GeocodeResponse> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${config.public.GOOGLE_MAPS_API_KEY}`
  const res = await fetch(url)

  return await res.json()
}
