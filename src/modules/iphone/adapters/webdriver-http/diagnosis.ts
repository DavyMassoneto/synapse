import { discoverIphoneSimulators } from "#synapse/modules/iphone/adapters/simulator-discovery"
import { type IphoneDiagnosisPort } from "#synapse/modules/iphone/internal/diagnosis"
import { IPHONE_REFUSED, type IphoneModuleDependencies } from "#synapse/modules/iphone/public/contracts"
import { IPHONE_HTTP_STATUS, IPHONE_HTTP_TIMEOUT_MS } from "./constants"

export class IphoneHttpDiagnosis implements IphoneDiagnosisPort {
  private readonly serverUrl: string

  private readonly dependencies: IphoneModuleDependencies

  constructor(serverUrl: string, dependencies: IphoneModuleDependencies) {
    this.serverUrl = serverUrl
    this.dependencies = dependencies
  }

  async serverResponds(signal: AbortSignal): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/${IPHONE_HTTP_STATUS}`, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(IPHONE_HTTP_TIMEOUT_MS)]),
      })
      return response.ok
    } catch {
      signal.throwIfAborted()
      return false
    }
  }

  async hasBootedSimulator(signal: AbortSignal): Promise<boolean> {
    const result = await discoverIphoneSimulators(
      this.dependencies.host,
      this.dependencies.executeSimulatorCommand.bind(this.dependencies, signal),
    )
    signal.throwIfAborted()
    return result.kind !== IPHONE_REFUSED && result.simulators.length > 0
  }
}
