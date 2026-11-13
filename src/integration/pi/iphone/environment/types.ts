import { type ExtensionAPI } from "@earendil-works/pi-coding-agent"
import { type IphoneModuleDependencies } from "#synapse/modules"

export type PiIphoneSimulatorExecution = IphoneModuleDependencies["executeSimulatorCommand"]

export type PiIphoneExecutionHost = Pick<ExtensionAPI, "exec">
