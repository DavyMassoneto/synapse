import { type IphoneHomeIcon } from "#synapse/modules/iphone/public/contracts"

export type {
  IphoneHomeFolderCount,
  IphoneHomeIcon,
  IphoneHomeLayout,
  IphoneHomeLayoutResult,
  IphoneHomePage,
  IphoneHomePageMissing,
  IphoneHomeStateAccepted,
  IphoneHomeStateResult,
} from "#synapse/modules/iphone/public/contracts"

import { type IphoneElement, type IphonePoint, type IphoneRefused } from "#synapse/modules/iphone/public/contracts"

export interface IphoneHomeInput {
  viewport: IphonePoint
  elements: IphoneElement[]
}

export interface IphoneHomeMove {
  kind: "move"
  icon: IphoneHomeIcon
  column: number
  row: number
}

export interface IphoneHomeAdjacent {
  kind: "adjacent"
}

export type IphoneHomePlan = IphoneHomeMove | IphoneHomeAdjacent | IphoneRefused

export interface IphoneHomeGrid {
  width: number
  height: number
  columns: number[]
  rows: number
  rowStart: number
  rowSpacing: number
  iconOffset: number
  dockY: number
}

export interface IphoneHomeIndicators {
  edit: boolean
  alert: boolean
  inFolder: boolean
  clearText: boolean
}
