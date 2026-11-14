import { type IphoneAppiumProcess } from "#synapse/modules/iphone/adapters/appium-process"
import { loadIphoneCompleteConfiguration } from "#synapse/modules/iphone/adapters/configuration-file"
import { discoverIphoneSimulators } from "#synapse/modules/iphone/adapters/simulator-discovery"
import {
  IPHONE_WDA_EXTERNAL,
  IPHONE_WDA_REQUIRED,
  IphoneWdaAdmission,
  type IphoneWdaAdmissions,
  type IphoneWdaSelection,
} from "#synapse/modules/iphone/adapters/wda-admission"
import { buildIphoneCapabilities } from "#synapse/modules/iphone/internal/session-capabilities"
import { isIphoneLocalSimulatorWda } from "#synapse/modules/iphone/internal/wda-endpoint"
import {
  IPHONE_REFUSED,
  IPHONE_SIMULATOR,
  type IphoneConfiguration,
  type IphoneModuleDependencies,
  type IphoneSessionFactory,
} from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HTTP_NO_BOOTED_SIMULATOR } from "./constants"
import { createIphoneWebDriverSession } from "./create-session"
import { startIphoneServer } from "./server-start"
import { type IphoneWebDriverSession } from "./session"

export class IphoneConcreteSessionFactory implements IphoneSessionFactory<IphoneWebDriverSession> {
  private readonly dependencies: IphoneModuleDependencies

  private readonly server: IphoneAppiumProcess

  private readonly admissions: IphoneWdaAdmissions = new Set<IphoneWdaAdmission>()

  private lifecycle = new AbortController()

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
    const lifecycleSignal = AbortSignal.any([signal, this.lifecycle.signal])
    const config = await this.resolveTarget(lifecycleSignal)
    lifecycleSignal.throwIfAborted()
    const selection = this.admit(config)
    const combined =
      selection.kind === IPHONE_WDA_REQUIRED
        ? AbortSignal.any([lifecycleSignal, selection.admission.signal])
        : lifecycleSignal
    try {
      if (selection.kind === IPHONE_WDA_REQUIRED) {
        await selection.admission.reserve(combined)
      }
      await startIphoneServer(config, this.dependencies, this.server, combined)
      combined.throwIfAborted()
      if (selection.kind === IPHONE_WDA_REQUIRED) {
        await selection.admission.handoff(combined)
      }
      return await createIphoneWebDriverSession(
        config.serverUrl,
        buildIphoneCapabilities(config, this.dependencies.host),
        combined,
        selection,
      )
    } catch (error) {
      if (selection.kind === IPHONE_WDA_REQUIRED) {
        await selection.admission.release()
      }
      throw error
    }
  }

  private admit(config: IphoneConfiguration): IphoneWdaSelection {
    const port = config.capabilities?.wdaLocalPort
    if (isIphoneLocalSimulatorWda(config) && port) {
      return { kind: IPHONE_WDA_REQUIRED, admission: new IphoneWdaAdmission(port, this.admissions) }
    }
    return { kind: IPHONE_WDA_EXTERNAL }
  }

  async stop(): Promise<void> {
    this.lifecycle.abort()
    const releases: Promise<void>[] = []
    for (const admission of this.admissions) {
      releases.push(admission.release())
    }
    await Promise.all(releases)
    await this.server.stop()
    this.lifecycle = new AbortController()
  }
}
