import {
  type IphoneHomeStateResult,
  type IphonePoint,
  type IphoneRefused,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"

export interface IphoneHomeCascadeKnown {
  kind: "accepted"
  page: number
  count: number
}

export interface IphoneHomeCascadeAbsent {
  kind: "cascade-absent"
}

export type IphoneHomeCascadeSnapshot = IphoneHomeCascadeKnown | IphoneHomeCascadeAbsent | IphoneRefused

export interface IphoneHomeDirectDropPending {
  kind: "direct-drop-pending"
  cascade: IphoneHomeCascadeSnapshot
}

export type IphoneHomeHopResult = IphoneSupportResult | IphoneHomeDirectDropPending

export interface IphoneHomeHopRequest {
  name: string
  folder: boolean
  from: number
  to: number
}

export type IphoneHomeReadResult = IphoneHomeStateResult

export interface IphoneHomeExtractPlanned {
  kind: "extract_planned"
  point: IphonePoint
  slot: number
  count: number
  page: number
}

export type IphoneHomeExtractPlan = IphoneHomeExtractPlanned | IphoneRefused
