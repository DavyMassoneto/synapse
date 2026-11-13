export type {
  IphoneHomeAuditAccepted,
  IphoneHomeAuditFolder,
  IphoneHomeAuditPage,
  IphoneHomeAuditPageAccepted,
  IphoneHomeAuditPageResult,
  IphoneHomeAuditResult,
  IphoneHomeFolderRead,
  IphoneHomeFolderResult,
} from "#synapse/modules/iphone/public/contracts"

import { type IphoneHomeStateResult } from "#synapse/modules/iphone/internal/home-screen-layout"
import {
  type IPHONE_ACCEPTED,
  type IphonePoint,
  type IphoneRefused,
  type IphoneSupportResult,
} from "#synapse/modules/iphone/public/contracts"
import {
  type IPHONE_HOME_CASCADE_ABSENT,
  type IPHONE_HOME_DIRECT_DROP_PENDING,
  type IPHONE_HOME_EXTRACT_PLANNED,
} from "./constants"

export type { IphoneHomeScreenPort, IphoneHomeSwipeDirection } from "#synapse/modules/iphone/public/contracts"

export interface IphoneHomeCascadeKnown {
  kind: typeof IPHONE_ACCEPTED
  page: number
  count: number
}

export interface IphoneHomeCascadeAbsent {
  kind: typeof IPHONE_HOME_CASCADE_ABSENT
}

export type IphoneHomeCascadeSnapshot = IphoneHomeCascadeKnown | IphoneHomeCascadeAbsent | IphoneRefused

export interface IphoneHomeDirectDropPending {
  kind: typeof IPHONE_HOME_DIRECT_DROP_PENDING
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
  kind: typeof IPHONE_HOME_EXTRACT_PLANNED
  point: IphonePoint
  slot: number
  count: number
  page: number
}

export type IphoneHomeExtractPlan = IphoneHomeExtractPlanned | IphoneRefused
