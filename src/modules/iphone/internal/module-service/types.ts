import { type IphoneRefused } from "#synapse/modules/iphone/public/contracts"
import { type IPHONE_MODULE_DIRECT_DROP, type IPHONE_MODULE_HOPS_DONE } from "./constants"

export interface IphoneAcrossPagesRequest {
  source: string
  destination: string
  fromPage: number
  toPage: number
}

export interface IphoneDirectDropDone {
  kind: typeof IPHONE_MODULE_DIRECT_DROP
}

export interface IphoneHopsDone {
  kind: typeof IPHONE_MODULE_HOPS_DONE
}

export type IphoneAcrossPagesResult = IphoneDirectDropDone | IphoneHopsDone | IphoneRefused
