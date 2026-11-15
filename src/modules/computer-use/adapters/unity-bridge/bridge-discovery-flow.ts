import { type ComputerUnityBridgeConfiguration } from "#synapse/modules/computer-use/public/contracts"
import { type ComputerUnityBridgeAttachment } from "./attachment"
import {
  COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED,
  COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTS,
  COMPUTER_UNITY_BRIDGE_ATTACH_POLL_MILLISECONDS,
} from "./constants"
import { computerUnityBridgeDelay } from "./delay"
import { computerDiscoverUnityBridge } from "./discovery"
import { type ComputerUnityBridgeDiscovery } from "./handshake"
import { type ComputerUnityBridgeTarget } from "./types"

export async function computerUnityBridgeEnsureBridge(
  configuration: ComputerUnityBridgeConfiguration,
  attachment: ComputerUnityBridgeAttachment,
  target: ComputerUnityBridgeTarget,
  signal?: AbortSignal,
): Promise<ComputerUnityBridgeDiscovery> {
  const discovery = await computerDiscoverUnityBridge(configuration, target)
  if (discovery.kind === "bridge-ready") {
    return discovery
  }
  const attached = await attachment.attach(target, signal)
  if (attached.kind !== COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTED) {
    return discovery
  }
  return computerUnityBridgeAwaitBridge(configuration, target)
}

export async function computerUnityBridgeAwaitBridge(
  configuration: ComputerUnityBridgeConfiguration,
  target: ComputerUnityBridgeTarget,
): Promise<ComputerUnityBridgeDiscovery> {
  let discovery = await computerDiscoverUnityBridge(configuration, target)
  for (let attempt = 0; attempt < COMPUTER_UNITY_BRIDGE_ATTACH_ATTEMPTS; attempt += 1) {
    if (discovery.kind === "bridge-ready") {
      return discovery
    }
    await computerUnityBridgeDelay(COMPUTER_UNITY_BRIDGE_ATTACH_POLL_MILLISECONDS)
    discovery = await computerDiscoverUnityBridge(configuration, target)
  }
  return discovery
}
