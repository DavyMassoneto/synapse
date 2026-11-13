export interface IphonePointerMove {
  type: "pointerMove"
  duration: number
  x: number
  y: number
}

export type IphonePointerButtonType = "pointerDown" | "pointerUp"

export interface IphonePointerButton {
  type: IphonePointerButtonType
  button: number
}

export interface IphonePointerPause {
  type: "pause"
  duration: number
}

export type IphonePointerAction = IphonePointerMove | IphonePointerButton | IphonePointerPause
