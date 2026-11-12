import { type ComputerDeliveryMode, type ComputerInputScope, type ComputerScrollDirection } from "../actions"
import { type ComputerApplication, type ComputerElement, type ComputerImage, type ComputerWindow } from "../capture"
import { type ComputerActionCode, type ComputerActionEffect, type ComputerRecommendedAction } from "../results"
import {
  type COMPUTER_DRIVER_DISCONNECTED,
  type COMPUTER_DRIVER_ERROR,
  type COMPUTER_DRIVER_INVALID,
  type COMPUTER_DRIVER_RESPONSE,
  type COMPUTER_DRIVER_TIMEOUT,
} from "./constants"

export interface ComputerDriverArguments {
  session?: string
  pid?: number
  window_id?: number
  element_index?: number
  element_token?: string
  from_element?: number
  to_element?: number
  from_x?: number
  from_y?: number
  to_x?: number
  to_y?: number
  x?: number
  y?: number
  text?: string
  value?: string
  key?: string
  keys?: string[]
  modifier?: string[]
  button?: string
  direction?: ComputerScrollDirection
  amount?: number
  scope?: ComputerInputScope
  delivery_mode?: ComputerDeliveryMode
  max_elements?: number
  on_screen_only?: boolean
  max_image_dimension?: number
  format?: string
  quality?: number
  enabled?: boolean
  cursor_id?: string
}

export interface ComputerDriverTool {
  name: string
  inputProperties: string[]
}

export interface ComputerDriverEnvelope {
  message: string
  isError: boolean
  windows: ComputerWindow[]
  applications: ComputerApplication[]
  elements: ComputerElement[]
  tree: string
  image: ComputerImage
  verified?: boolean
  effect?: ComputerActionEffect
  code?: ComputerActionCode
  recommended?: ComputerRecommendedAction
  deliveredChars?: number
  requestedChars?: number
}

export interface ComputerDriverResponse {
  kind: typeof COMPUTER_DRIVER_RESPONSE
  envelope: ComputerDriverEnvelope
}

export interface ComputerDriverFailure {
  kind: ComputerDriverFailureKind
  message: string
}

export type ComputerDriverCallResult = ComputerDriverResponse | ComputerDriverFailure

export interface ComputerDriverPort {
  start(): Promise<ComputerDriverTool[]>
  call(name: string, argumentsValue: ComputerDriverArguments): Promise<ComputerDriverCallResult>
  stop(): Promise<void>
}

export interface ComputerWaitPort {
  wait(milliseconds: number): Promise<void>
}

export interface ComputerDriverLaunch {
  command: string
  arguments: string[]
  environment: NodeJS.ProcessEnv
  timeoutMilliseconds: number
  windowsHide: boolean
}

export type ComputerDriverFailureKind =
  | typeof COMPUTER_DRIVER_TIMEOUT
  | typeof COMPUTER_DRIVER_DISCONNECTED
  | typeof COMPUTER_DRIVER_INVALID
  | typeof COMPUTER_DRIVER_ERROR
