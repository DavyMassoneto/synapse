import { type IphoneModuleDependencies } from "#synapse/modules/iphone/public/contracts"
import { noDataCommand } from "./data-support"

export const IPHONE_DATA_DEPENDENCIES: IphoneModuleDependencies = {
  host: "darwin",
  configPath: "fake",
  stateDirectory: "fake",
  path: "fake",
  executeSimulatorCommand: noDataCommand,
}

export const IPHONE_DATA_XML = '<root><XCUIElementTypeButton label="Abrir" x="1" y="2" width="10" height="20"/></root>'

export const IPHONE_DATA_FAKE_RESPONSE = '{"value":null}'
