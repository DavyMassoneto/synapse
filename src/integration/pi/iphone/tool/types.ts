import { type ExtensionContext, type ToolDefinition } from "@earendil-works/pi-coding-agent"
import { type Static } from "typebox"
import {
  type IphoneActionTarget,
  type IphoneInfoOutput,
  type IphonePoint,
  type IphoneTextOutput,
  type IphoneTreeOutput,
} from "#synapse/modules"
import { type PI_IPHONE_DESTINATION_FOUND, type PI_IPHONE_DESTINATION_MISSING } from "./constants"
import { type PI_IPHONE_PARAMETERS } from "./parameters"

export type PiIphoneInput = Static<typeof PI_IPHONE_PARAMETERS>

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

export interface PiIphoneDestinationFound {
  kind: typeof PI_IPHONE_DESTINATION_FOUND
  target: IphoneActionTarget
}

export interface PiIphoneDestinationMissing {
  kind: typeof PI_IPHONE_DESTINATION_MISSING
}

export type PiIphoneDestination = PiIphoneDestinationFound | PiIphoneDestinationMissing

export interface PiIphonePointOption {
  point?: IphonePoint
}
