import { type IphoneDeviceAction } from "../actions"
import { type IPHONE_TARGET_ELEMENT, type IPHONE_TARGET_POINT, type IPHONE_TARGET_TEXT } from "../constants"
import { type IphonePoint } from "../geometry"

export interface IphoneElementTarget {
  kind: typeof IPHONE_TARGET_ELEMENT
  index: number
}

export interface IphoneTextTarget {
  kind: typeof IPHONE_TARGET_TEXT
  text: string
}

export interface IphonePointTarget {
  kind: typeof IPHONE_TARGET_POINT
  point: IphonePoint
}

export type IphoneActionTarget = IphoneElementTarget | IphoneTextTarget | IphonePointTarget

export interface IphoneTargetedAction {
  action: IphoneDeviceAction
  target: IphoneActionTarget
  destination?: IphoneActionTarget
}
