import { type IphoneModuleDependencies } from "#synapse/modules/iphone/public/contracts"
import { noIphoneLifecycleCommand } from "./lifecycle-support"

export const IPHONE_LIFECYCLE_DEPENDENCIES: IphoneModuleDependencies = {
  host: "darwin",
  configPath: "fake",
  stateDirectory: "fake",
  path: "fake",
  executeSimulatorCommand: noIphoneLifecycleCommand,
}

export const IPHONE_TEST_UTF8_BOM = "\uFEFF"
