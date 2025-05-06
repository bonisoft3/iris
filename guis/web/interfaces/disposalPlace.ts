import type { ProtobufLatlng } from './trashItem'

export interface DisposalPlace {
  createdon: Date
  id: string
  imgurl: string
  latlng: ProtobufLatlng
  materialtype: string
  userid: string
}
