import { type IphoneRefused } from "../result"

export interface IphonePointAccepted {
  kind: "accepted"
  point: IphonePoint
}

export type IphonePointResult = IphonePointAccepted | IphoneRefused

export interface IphoneDragSpec {
  from: IphonePoint
  destination: IphonePoint
  holdMs: number
  liftDistance: number
  liftMs: number
  moveMs: number
  hoverMs: number
}

export interface IphonePoint {
  x: number
  y: number
}

export interface IphoneRectangle extends IphonePoint {
  width: number
  height: number
}

export interface IphoneElement {
  index: number
  type: string
  name: string
  label: string
  value: string
  rect: IphoneRectangle
  enabled: boolean
  interactive: boolean
}
