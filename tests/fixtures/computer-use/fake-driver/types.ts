import { type Static } from "typebox"
import { type COMPUTER_FIXTURE_DRIVER_REQUEST_SCHEMA } from "./constants"

export type ComputerFixtureDriverRequest = Static<typeof COMPUTER_FIXTURE_DRIVER_REQUEST_SCHEMA>

export interface ComputerFixtureDriverProperty {
  type: string
}

export interface ComputerFixtureDriverProperties {
  element_token: ComputerFixtureDriverProperty
  delivery_mode: ComputerFixtureDriverProperty
  x: ComputerFixtureDriverProperty
}

export interface ComputerFixtureDriverTool {
  name: string
  inputSchema: ComputerFixtureDriverInputSchema
}

export interface ComputerFixtureDriverInputSchema {
  properties: ComputerFixtureDriverProperties
}
