interface Place {
  name: string
  formattedAddress: string
  distance: string
  placeId: string
  phoneNumber: string
}

export interface ProtobufLatlng {
  latitude: number
  longitude: number
}

interface Money {
  currencyCode: string
  units: number
}

interface TrashItemPbjson {
  id: string
  caption: string
  disposalInstructions: string
  label: string
  latlng: ProtobufLatlng | undefined
  nearbyRecyclingPlaces: Array<Place>
  picture: string
  subClassifications: string
  ts: Date
  userId: string
  userLanguage: string
  isDisposalPlace: number | null
  price: Money | null
}

export interface TrashItem {
  id: string
  pbjson: TrashItemPbjson
  componentHeight: string
  ts: string | Date
}
