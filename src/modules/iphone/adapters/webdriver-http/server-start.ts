import { IPHONE_APPIUM_LOCAL_NAMES, type IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import {
  type IphoneAppiumProvisionRequest,
  provisionIphoneAppium,
  runIphoneProvisionCommand,
} from "#synapse/modules/iphone/adapters/appium-provision"
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
  const running = await diagnosis.serverResponds(signal)
  signal.throwIfAborted()
  if (!running) {
    const local = IPHONE_APPIUM_LOCAL_NAMES.includes(new URL(config.serverUrl).hostname)
    if (local) {
      const request: IphoneAppiumProvisionRequest = {
        stateDirectory: dependencies.stateDirectory,
        path: dependencies.path,
        host: dependencies.host,
      }
      if (config.appiumHome) {
        request.appiumHome = config.appiumHome
      }
      const installation = await provisionIphoneAppium(request, signal, runIphoneProvisionCommand)
      signal.throwIfAborted()
      server.start(
        config.serverUrl,
        dependencies.stateDirectory,
        dependencies.path,
        dependencies.host,
        installation.appiumHome,
        installation.executable,
      )
    }
    try {
      await waitIphoneServer(diagnosis, signal)
    } catch (error) {
      await server.stop()
      throw error
    }
  }
}
