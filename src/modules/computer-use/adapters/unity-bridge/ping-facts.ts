import { Value } from "typebox/value"
import {
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_GEOMETRY,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_RESPONSE,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET,
  COMPUTER_UNITY_BRIDGE_OK_STATUS,
} from "./constants"
import { computerUnityBridgeGeometry } from "./geometry"
import {
  type ComputerUnityBridgeFactsInvalid,
  type ComputerUnityBridgeFactsResult,
  type ComputerUnityBridgePingParse,
} from "./handshake"
import { COMPUTER_UNITY_BRIDGE_PING_SCHEMA } from "./schemas"
import { type ComputerUnityBridgeHandshakeRecord, type ComputerUnityBridgePingRecord } from "./types"

export function computerUnityBridgePingFacts(
  body: string,
  record: ComputerUnityBridgeHandshakeRecord,
): ComputerUnityBridgeFactsResult {
  const parsed = computerUnityBridgePingParse(body)
  if (parsed.kind === "facts-invalid") {
    return parsed
  }
  return computerUnityBridgePingValidatedFacts(parsed.record, record)
}

function computerUnityBridgePingValidatedFacts(
  ping: ComputerUnityBridgePingRecord,
  record: ComputerUnityBridgeHandshakeRecord,
): ComputerUnityBridgeFactsResult {
  const identity =
    ping.status === COMPUTER_UNITY_BRIDGE_OK_STATUS &&
    ping.protocol === record.protocol &&
    ping.instance === record.instance &&
    ping.pid === record.pid &&
    ping.geometry.hwnd === record.geometry.hwnd
  if (!identity) {
    return computerUnityBridgeInvalidFacts(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET)
  }
  const pumping =
    ping.gameobject_created && ping.main_thread_captured && ping.event_system && ping.main_thread_ticks > 0
  if (!pumping) {
    return computerUnityBridgeInvalidFacts(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP)
  }
  if (!ping.capabilities.click) {
    return computerUnityBridgeInvalidFacts(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES)
  }
  return computerUnityBridgeFacts(ping)
}

function computerUnityBridgeFacts(ping: ComputerUnityBridgePingRecord): ComputerUnityBridgeFactsResult {
  const geometry = computerUnityBridgeGeometry(ping.geometry)
  if (geometry.client.width <= 0 || geometry.client.height <= 0) {
    return computerUnityBridgeInvalidFacts(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_GEOMETRY)
  }
  return {
    kind: "facts-valid",
    facts: {
      protocol: ping.protocol,
      instance: ping.instance,
      screen: ping.screen,
      geometry,
      capabilities: {
        tree: ping.capabilities.tree,
        hit: ping.capabilities.hit,
        click: ping.capabilities.click,
        key: ping.capabilities.key,
        text: ping.capabilities.text,
        scroll: ping.capabilities.scroll === true,
        drag: ping.capabilities.drag === true,
        ids: ping.capabilities.ids === true,
        texts: ping.capabilities.texts === true,
        generation: ping.capabilities.generation === true,
      },
      generation: computerUnityBridgeGeneration(ping),
    },
  }
}

function computerUnityBridgeGeneration(ping: ComputerUnityBridgePingRecord): number {
  if (typeof ping.generation === "number") {
    return ping.generation
  }
  return 0
}

function computerUnityBridgePingParse(body: string): ComputerUnityBridgePingParse {
  try {
    return { kind: "ping-parsed", record: Value.Parse(COMPUTER_UNITY_BRIDGE_PING_SCHEMA, JSON.parse(body)) }
  } catch {
    return computerUnityBridgeInvalidFacts(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_RESPONSE)
  }
}

function computerUnityBridgeInvalidFacts(reason: string): ComputerUnityBridgeFactsInvalid {
  return { kind: "facts-invalid", reason }
}
