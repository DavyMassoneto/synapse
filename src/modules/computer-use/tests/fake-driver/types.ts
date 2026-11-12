import { type Static } from "typebox"
import { type COMPUTER_FAKE_REQUEST_SCHEMA } from "./constants"

export type ComputerFakeRequest = Static<typeof COMPUTER_FAKE_REQUEST_SCHEMA>

export interface ComputerFakeProperty {
  type: string
}

export interface ComputerFakeProperties {
  element_token: ComputerFakeProperty
  delivery_mode: ComputerFakeProperty
  x: ComputerFakeProperty
}

export interface ComputerFakeTool {
  name: string
  inputSchema: ComputerFakeInputSchema
}

export interface ComputerFakeInputSchema {
  properties: ComputerFakeProperties
}
