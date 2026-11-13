import { type ExtensionContext, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import {
  type IphoneActionTarget,
  type IphoneDeviceActionOutput,
  type IphoneInfoOutput,
  type IphonePoint,
  type IphoneTextOutput,
  type IphoneTreeOutput,
} from "#synapse/modules"
import { type PI_IPHONE_PARAMETERS } from "./parameters"

export type PiIphoneInput = Omit<Static<typeof PI_IPHONE_PARAMETERS>, "alert_action"> & PiIphoneAlertInput

export interface PiIphoneAlertInput {
  alert_action?: string
}

export interface PiIphoneText {
  type: "text"
  text: string
}

export interface PiIphoneImage {
  type: "image"
  data: string
  mimeType: string
}

export type PiIphoneContent = PiIphoneText | PiIphoneImage

export interface PiIphoneDetails {
  operation: string
  completed?: IphoneDeviceActionOutput
}

export interface PiIphoneOutput {
  content: PiIphoneContent[]
  details: PiIphoneDetails
  isError: boolean
}

export type PiIphoneUpdate = Parameters<ToolDefinition<typeof PI_IPHONE_PARAMETERS, PiIphoneDetails>["execute"]>[3]

export type PiIphoneContext = Pick<ExtensionContext, "model">

export type PiIphoneSignal = Parameters<ToolDefinition<typeof PI_IPHONE_PARAMETERS, PiIphoneDetails>["execute"]>[2]

export type PiIphoneTextResult = IphoneInfoOutput | IphoneTreeOutput | IphoneTextOutput

export interface PiIphoneTargetFound {
  kind: "found"
  target: IphoneActionTarget
}

export interface PiIphoneTargetMissing {
  kind: "missing"
}

export type PiIphoneTargetSource = PiIphoneTargetFound | PiIphoneTargetMissing

export interface PiIphoneTargets {
  source: PiIphoneTargetSource
  destination: PiIphoneTargetSource
}

export interface PiIphonePointOption {
  point?: IphonePoint
}
