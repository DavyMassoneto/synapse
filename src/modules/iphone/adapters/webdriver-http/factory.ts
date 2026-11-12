import { type IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import { loadIphoneCompleteConfiguration } from "#synapse/modules/iphone/adapters/configuration-file"
import { discoverIphoneSimulators } from "#synapse/modules/iphone/adapters/simulator-discovery"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { type IphoneSessionFactory } from "#synapse/modules/iphone/internal/session-lifecycle"
import {
  IPHONE_REFUSED,
  IPHONE_SIMULATOR,
  type IphoneConfiguration,
  type IphoneModuleDependencies,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HTTP_NO_BOOTED_SIMULATOR } from "./constants"
import { createIphoneWebDriverSession } from "./create-session"
import { startIphoneServer } from "./server-start"
import { type IphoneWebDriverSession } from "./session"

export class IphoneConcreteSessionFactory implements IphoneSessionFactory<IphoneWebDriverSession> {
  private readonly dependencies: IphoneModuleDependencies

  private readonly server: IphoneAppiumProcess

  constructor(dependencies: IphoneModuleDependencies, server: IphoneAppiumProcess) {
    this.dependencies = dependencies
    this.server = server
  }

  private readConfiguration() {
    return loadIphoneCompleteConfiguration(this.dependencies.configPath, this.dependencies.host)
  }

  private async resolveTarget(signal: AbortSignal): Promise<IphoneConfiguration> {
    let config = this.readConfiguration()
    if (config.target.kind === IPHONE_SIMULATOR && !config.target.udid) {
      const discovery = await discoverIphoneSimulators(
        this.dependencies.host,
        this.dependencies.executeSimulatorCommand.bind(this.dependencies, signal),
      )
      signal.throwIfAborted()
      if (discovery.kind === IPHONE_REFUSED) {
        throw new Error(discovery.message)
      }
      const simulator = discovery.simulators[0]
      if (!simulator) {
        throw new Error(IPHONE_HTTP_NO_BOOTED_SIMULATOR)
      }
      config = { ...config, target: { ...config.target, udid: simulator.udid, deviceName: simulator.name } }
    }
    return config
  }

  async create(signal: AbortSignal): Promise<IphoneWebDriverSession> {
    const config = await this.resolveTarget(signal)
    signal.throwIfAborted()
    await startIphoneServer(config, this.dependencies, this.server, signal)
    signal.throwIfAborted()
    return createIphoneWebDriverSession(
      config.serverUrl,
      buildIphoneCapabilities(config, this.dependencies.host),
      signal,
    )
  }

  async stop(): Promise<void> {
    await this.server.stop()
  }
}
