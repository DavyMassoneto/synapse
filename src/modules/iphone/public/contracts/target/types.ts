import { type IphoneDeviceAction } from "../actions"
import { type IphonePoint } from "../geometry"

export interface IphoneElementTarget {
  kind: "element"
  index: number
}

export interface IphoneTextTarget {
  kind: "text"
  text: string
}

export interface IphonePointTarget {
  kind: "point"
  point: IphonePoint
}

export type IphoneActionTarget = IphoneElementTarget | IphoneTextTarget | IphonePointTarget

export interface IphoneTargetedAction {
  action: IphoneDeviceAction
  target: IphoneActionTarget
  destination?: IphoneActionTarget
}
