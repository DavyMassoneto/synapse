import { type ComputerUnityBridgeConfiguration } from "#synapse/modules/computer-use/public/contracts"
import { ComputerUnityBridgeConnection } from "./bridge-connection"
import { computerUnityBridgePingRequest } from "./bridge-request"
import {
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ABSENT,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PING,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_UNREADABLE,
  COMPUTER_UNITY_BRIDGE_PING_TIMEOUT_MILLISECONDS,
} from "./constants"
import {
  type ComputerUnityBridgeDiscovery,
  type ComputerUnityBridgeFactsResult,
  type ComputerUnityBridgeValidatedHandshake,
} from "./handshake"
import { computerReadUnityBridgeHandshake } from "./handshake-reading"
import { computerValidateUnityBridgeHandshake } from "./handshake-validation"
import { computerUnityBridgePingFacts } from "./ping-facts"
import { type ComputerUnityBridgeHandshakeRecord, type ComputerUnityBridgeTarget } from "./types"

export async function computerDiscoverUnityBridge(
  configuration: ComputerUnityBridgeConfiguration,
  target: ComputerUnityBridgeTarget,
): Promise<ComputerUnityBridgeDiscovery> {
  const validated = await computerReadValidatedHandshake(configuration, target)
  if (validated.kind === "bridge-rejected") {
    return validated
  }
  const record = validated.record
  const facts = await computerPingUnityBridge(record)
  if (facts.kind === "facts-invalid") {
    return { kind: "bridge-rejected", reason: facts.reason }
  }
  return { kind: "bridge-ready", port: record.port, token: record.token, facts: facts.facts }
}

async function computerReadValidatedHandshake(
  configuration: ComputerUnityBridgeConfiguration,
  target: ComputerUnityBridgeTarget,
): Promise<ComputerUnityBridgeValidatedHandshake> {
  const handshake = await computerReadUnityBridgeHandshake(configuration.handshakeDirectory)
  if (handshake.kind === "handshake-absent") {
    return { kind: "bridge-rejected", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_ABSENT }
  }
  if (handshake.kind === "handshake-unread") {
    return { kind: "bridge-rejected", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_UNREADABLE }
  }
  const validation = computerValidateUnityBridgeHandshake(handshake.record, target)
  if (validation.kind === "handshake-invalid") {
    return { kind: "bridge-rejected", reason: validation.reason }
  }
  return { kind: "handshake-validated", record: handshake.record }
}

async function computerPingUnityBridge(
  record: ComputerUnityBridgeHandshakeRecord,
): Promise<ComputerUnityBridgeFactsResult> {
  const connection = new ComputerUnityBridgeConnection(
    record.port,
    computerUnityBridgePingRequest(record.token),
    COMPUTER_UNITY_BRIDGE_PING_TIMEOUT_MILLISECONDS,
  )
  const response = await connection.transact()
  if (response.kind !== "transport-response") {
    return { kind: "facts-invalid", reason: COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PING }
  }
  return computerUnityBridgePingFacts(response.body, record)
}
