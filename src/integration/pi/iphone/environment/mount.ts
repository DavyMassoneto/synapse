import { type IphoneModuleDependencies } from "#synapse/modules"
import { iphoneHostDependencies } from "./dependencies"
import { PiIphoneSimulatorExecutor } from "./simulator-executor"
import { type PiIphoneExecutionHost } from "./types"

export function mountIphoneDependencies(pi: PiIphoneExecutionHost): IphoneModuleDependencies {
  const executor = new PiIphoneSimulatorExecutor(pi)
  return iphoneHostDependencies(executor.execute.bind(executor))
}
