import {
  type IphoneAlertAction,
  type IphoneApplicationAction,
  type IphoneCloseAction,
  type IphoneDeviceAction,
  type IphoneDragAction,
  type IphoneElement,
  type IphoneHomeAction,
  type IphoneInfoAction,
  type IphoneInstallAction,
  type IphoneLongPressAction,
  type IphoneOrientationAction,
  type IphonePressAction,
  type IphoneScreenshotAction,
  type IphoneSwipeDirection,
  type IphoneTapAction,
  type IphoneTreeAction,
  type IphoneUrlAction,
  type IphoneWaitAction,
} from "#synapse/modules/iphone/public/contracts"

export type {
  IphoneAlertAction,
  IphoneAlertKind,
  IphoneApplicationAction,
  IphoneApplicationKind,
  IphoneClearAction,
  IphoneCloseAction,
  IphoneDeviceAction,
  IphoneDeviceActionOutput,
  IphoneDoubleTapAction,
  IphoneDragAction,
  IphoneHomeAction,
  IphoneInfoAction,
  IphoneInstallAction,
  IphoneLongPressAction,
  IphoneOrientationAction,
  IphoneOrientationKind,
  IphonePressAction,
  IphoneRectangle,
  IphoneScreenshotAction,
  IphoneSwipeAction,
  IphoneSwipeDirection,
  IphoneSwipeKind,
  IphoneTapAction,
  IphoneTreeAction,
  IphoneTypeAction,
  IphoneUrlAction,
  IphoneWaitAction,
} from "#synapse/modules/iphone/public/contracts"

export type IphoneMaybeElement = IphoneElement | null

export type { IphoneActionArguments, IphoneDeviceActionPort } from "#synapse/modules/iphone/public/contracts"

export interface IphoneSwipeEndpoints {
  fromX: number
  fromY: number
  toX: number
  toY: number
  duration: number
}

export interface IphoneApplicationScripts {
  launch: string
  terminate: string
  activate: string
}

export type IphoneFallbackOperation = () => Promise<void>

export interface IphoneOppositeDirections {
  up: IphoneSwipeDirection
  down: IphoneSwipeDirection
  left: IphoneSwipeDirection
  right: IphoneSwipeDirection
}

export type IphoneSimpleDeviceAction =
  | IphoneInstallAction
  | IphoneHomeAction
  | IphonePressAction
  | IphoneAlertAction
  | IphoneWaitAction
  | IphoneCloseAction
  | IphoneOrientationAction

export type IphonePointerDeviceAction = IphoneTapAction | IphoneLongPressAction | IphoneDragAction

export type IphoneDispatchedAction = Exclude<
  IphoneDeviceAction,
  IphoneTreeAction | IphoneScreenshotAction | IphoneInfoAction
>

export type IphoneRemainingAction = IphoneApplicationAction | IphoneUrlAction | IphoneSimpleDeviceAction
