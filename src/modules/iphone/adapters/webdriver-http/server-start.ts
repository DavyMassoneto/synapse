import { type IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import { type IphoneConfiguration, type IphoneModuleDependencies } from "#synapse/modules/iphone/public/contracts"
import { IphoneHttpDiagnosis } from "./diagnosis"
import { waitIphoneServer } from "./wait-server"

export async function startIphoneServer(
  config: IphoneConfiguration,
  dependencies: IphoneModuleDependencies,
  server: IphoneAppiumProcess,
  signal: AbortSignal,
): Promise<void> {
  const diagnosis = new IphoneHttpDiagnosis(config.serverUrl, dependencies)
  if (!(await diagnosis.serverResponds(signal))) {
    server.start(config.serverUrl, dependencies.stateDirectory, dependencies.path, dependencies.host, config.appiumHome)
    try {
      await waitIphoneServer(diagnosis, signal)
    } catch (error) {
      await server.stop()
      throw error
    }
  }
}
