import {
  type IPHONE_ACCEPTED,
  type IphoneDragSpec,
  type IphonePointerAction,
  type IphoneRefused,
} from "#synapse/modules/iphone/public/contracts"

export type {
  IphonePointerAction,
  IphonePointerButton,
  IphonePointerButtonType,
  IphonePointerMove,
  IphonePointerPause,
} from "#synapse/modules/iphone/public/contracts"

export type IphoneEdge = "left" | "right"

export interface IphonePageDragSpec {
  drag: IphoneDragSpec
  edge: IphoneEdge
  viewportWidth: number
  flips: number
  flipWaitMs: number
  releaseAtEdge?: boolean
}

export interface IphoneGestureAccepted {
  kind: typeof IPHONE_ACCEPTED
  actions: IphonePointerAction[]
}

export type IphoneGestureResult = IphoneGestureAccepted | IphoneRefused
