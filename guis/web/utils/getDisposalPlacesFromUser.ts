import type { DisposalPlace } from '#build/interfaces/disposalPlace'

export default async function getDisposalPlacesFromUser(reqUrl: string): Promise<Array<DisposalPlace> | null> {
  const res = await fetch(reqUrl)
  const disposalPlace: Array<DisposalPlace> = await res.json()

  return disposalPlace.length > 0 ? disposalPlace : null
}
