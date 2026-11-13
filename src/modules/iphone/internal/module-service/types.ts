import { type IphoneRefused } from "#synapse/modules/iphone/public/contracts"

export interface IphoneAcrossPagesRequest {
  source: string
  destination: string
  fromPage: number
  toPage: number
}

export interface IphoneDirectDropDone {
  kind: "direct-drop"
}

export interface IphoneHopsDone {
  kind: "hops-done"
}

export type IphoneAcrossPagesResult = IphoneDirectDropDone | IphoneHopsDone | IphoneRefused
