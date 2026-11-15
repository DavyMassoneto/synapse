import { type ComputerUnityBridgeConfiguration } from "#synapse/modules/computer-use/public/contracts"
import { ComputerUnityBridgeConnection } from "./bridge-connection"
import { computerUnityBridgeStopRequest } from "./bridge-request"
import { computerUnityBridgeTargetKey } from "./bridge-target"
import { computerUnityBridgeFailureDetail } from "./command-runner"
import {
  COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED,
  COMPUTER_UNITY_BRIDGE_ATTACH_FAILED,
  COMPUTER_UNITY_BRIDGE_ATTACH_INDETERMINATE,
  COMPUTER_UNITY_BRIDGE_ATTACH_NOT_UNITY,
  COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED,
  COMPUTER_UNITY_BRIDGE_ATTACH_UNITY_ONLY,
  COMPUTER_UNITY_BRIDGE_PROBE_NOT_UNITY,
  COMPUTER_UNITY_BRIDGE_PROBE_UNITY,
  COMPUTER_UNITY_BRIDGE_PROBE_UNKNOWN,
  COMPUTER_UNITY_BRIDGE_STOP_TIMEOUT_MILLISECONDS,
  COMPUTER_UNITY_BRIDGE_STRING_EMPTY,
} from "./constants"
import { computerDiscoverUnityBridge } from "./discovery"
import { type ComputerUnityBridgeDiscovery } from "./handshake"
import {
  type ComputerUnityBridgeAttachResult,
  type ComputerUnityBridgeCommandRunner,
  type ComputerUnityBridgeOwnedBridge,
  type ComputerUnityBridgeProbe,
  type ComputerUnityBridgeTarget,
} from "./types"

export class ComputerUnityBridgeAttachment {
  private readonly configuration: ComputerUnityBridgeConfiguration
  private readonly commands: ComputerUnityBridgeCommandRunner
  private readonly attempts = new Map<string, ComputerUnityBridgeAttachResult>()
  private readonly owned = new Map<string, ComputerUnityBridgeOwnedBridge>()

  constructor(configuration: ComputerUnityBridgeConfiguration, commands: ComputerUnityBridgeCommandRunner) {
    this.configuration = configuration
    this.commands = commands
  }

  async attach(target: ComputerUnityBridgeTarget, signal?: AbortSignal): Promise<ComputerUnityBridgeAttachResult> {
    const key = computerUnityBridgeTargetKey(target)
    const attempted = this.attempts.get(key)
    if (attempted) {
      return attempted
    }
    const result = await this.attempt(target, signal)
    this.attempts.set(key, result)
    return result
  }

  remember(target: ComputerUnityBridgeTarget, discovery: ComputerUnityBridgeDiscovery): void {
    const key = computerUnityBridgeTargetKey(target)
    if (!this.owned.has(key) && discovery.kind === "bridge-ready" && this.owns(target)) {
      this.owned.set(key, {
        target,
        instance: discovery.facts.instance,
        token: discovery.token,
        port: discovery.port,
      })
    }
  }

  async stopOwned(): Promise<void> {
    const entries = [...this.owned.values()]
    this.owned.clear()
    for (const entry of entries) {
      await this.stopEntry(entry)
    }
  }

  reset(): void {
    this.attempts.clear()
    this.owned.clear()
  }

  private owns(target: ComputerUnityBridgeTarget): boolean {
    const attempted = this.attempts.get(computerUnityBridgeTargetKey(target))
    return attempted?.kind === COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED
  }

  private async stopEntry(entry: ComputerUnityBridgeOwnedBridge): Promise<void> {
    const discovery = await computerDiscoverUnityBridge(this.configuration, entry.target)
    if (
      discovery.kind === "bridge-ready" &&
      discovery.facts.instance === entry.instance &&
      discovery.token === entry.token
    ) {
      const connection = new ComputerUnityBridgeConnection(
        discovery.port,
        computerUnityBridgeStopRequest(discovery.token),
        COMPUTER_UNITY_BRIDGE_STOP_TIMEOUT_MILLISECONDS,
      )
      await connection.transact()
    }
  }

  private async attempt(
    target: ComputerUnityBridgeTarget,
    signal?: AbortSignal,
  ): Promise<ComputerUnityBridgeAttachResult> {
    const probe = await this.probe(target, signal)
    if (probe === COMPUTER_UNITY_BRIDGE_PROBE_NOT_UNITY) {
      return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_NOT_UNITY, detail: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
    }
    const attach = this.configuration.attachCommand
    if (!attach) {
      if (probe === COMPUTER_UNITY_BRIDGE_PROBE_UNITY) {
        return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_UNITY_ONLY, detail: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
      }
      return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_UNCONFIGURED, detail: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
    }
    const executed = await this.commands(attach, target, signal)
    if (executed.kind === "command-succeeded") {
      return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED, detail: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
    }
    if (probe === COMPUTER_UNITY_BRIDGE_PROBE_UNITY) {
      return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_FAILED, detail: computerUnityBridgeFailureDetail(executed) }
    }
    return { kind: COMPUTER_UNITY_BRIDGE_ATTACH_INDETERMINATE, detail: COMPUTER_UNITY_BRIDGE_STRING_EMPTY }
  }

  private async probe(target: ComputerUnityBridgeTarget, signal?: AbortSignal): Promise<ComputerUnityBridgeProbe> {
    const probe = this.configuration.unityProbe
    if (!probe) {
      return COMPUTER_UNITY_BRIDGE_PROBE_UNKNOWN
    }
    const executed = await this.commands(probe, target, signal)
    if (executed.kind === "command-succeeded") {
      return COMPUTER_UNITY_BRIDGE_PROBE_UNITY
    }
    if (executed.kind === "command-exited") {
      return COMPUTER_UNITY_BRIDGE_PROBE_NOT_UNITY
    }
    return COMPUTER_UNITY_BRIDGE_PROBE_UNKNOWN
  }
}
