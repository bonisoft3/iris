interface AddressInfo {
  address_components: AddressComponent[]
}

interface AddressComponent {
  long_name: string
}

export interface GeocodeResponse {
  results: AddressInfo[]
}
