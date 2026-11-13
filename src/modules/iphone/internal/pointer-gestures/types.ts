import {
  type IphoneDragSpec,
  type IphonePointerAction,
  type IphoneRefused,
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
  kind: "accepted"
  actions: IphonePointerAction[]
}

export type IphoneGestureResult = IphoneGestureAccepted | IphoneRefused
