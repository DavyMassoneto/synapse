import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PROTOCOL,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_STATE,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET,
  COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_WINDOW_CLASS,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  type ComputerUnityBridgeHandshakeRecord,
  type ComputerUnityBridgeTarget,
  computerReadUnityBridgeHandshake,
  computerUnityBridgeHandshakePath,
  computerValidateUnityBridgeHandshake,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import {
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_PORT,
  COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
} from "./unity-bridge-constants"
import { computerUnityBridgeTestRejectedReason } from "./unity-bridge-helpers"
import { computerUnityBridgeTestGeometry, computerUnityBridgeTestHandshake } from "./unity-bridge-support"

const ARTIFACT_PREFIX = "synapse-unity-bridge-handshake-"

function targetRecord(): ComputerUnityBridgeTarget {
  return { pid: COMPUTER_UNITY_BRIDGE_TEST_PID, windowId: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID }
}

function handshakeRecord(): ComputerUnityBridgeHandshakeRecord {
  return computerUnityBridgeTestHandshake({
    port: COMPUTER_UNITY_BRIDGE_TEST_PORT,
    instance: COMPUTER_UNITY_BRIDGE_TEST_INSTANCE,
    token: COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
    geometry: computerUnityBridgeTestGeometry(COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y),
    screen: { width: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_WIDTH, height: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_HEIGHT },
    protocol: COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  })
}

async function makeDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), ARTIFACT_PREFIX))
}

async function readsHandshakePublishedByBridge(): Promise<void> {
  const directory = await makeDirectory()
  try {
    const path = computerUnityBridgeHandshakePath(directory)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, JSON.stringify(handshakeRecord()))
    const result = await computerReadUnityBridgeHandshake(directory)
    expect(result.kind).toBe("handshake-read")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function reportsAbsentHandshake(): Promise<void> {
  const directory = await makeDirectory()
  try {
    const result = await computerReadUnityBridgeHandshake(directory)
    expect(result.kind).toBe("handshake-absent")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

async function reportsUnreadableHandshake(): Promise<void> {
  const directory = await makeDirectory()
  try {
    const path = computerUnityBridgeHandshakePath(directory)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, "{")
    const result = await computerReadUnityBridgeHandshake(directory)
    expect(result.kind).toBe("handshake-unread")
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
}

function rejectsHandshakeForOtherProtocol(): void {
  const record = handshakeRecord()
  record.protocol = 3
  expect(computerUnityBridgeTestRejectedReason(computerValidateUnityBridgeHandshake(record, targetRecord()))).toBe(
    COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PROTOCOL,
  )
}

function rejectsHandshakeThatIsNotListening(): void {
  const record = handshakeRecord()
  record.state = "starting"
  expect(computerUnityBridgeTestRejectedReason(computerValidateUnityBridgeHandshake(record, targetRecord()))).toBe(
    COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_STATE,
  )
}

function rejectsHandshakeForOtherWindow(): void {
  const record = handshakeRecord()
  const validation = computerValidateUnityBridgeHandshake(record, { ...targetRecord(), pid: 1 })
  expect(computerUnityBridgeTestRejectedReason(validation)).toBe(COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_TARGET)
}

function rejectsHandshakeWithoutWindowClass(): void {
  const record = handshakeRecord()
  record.geometry.window_class = "NotUnity"
  expect(computerUnityBridgeTestRejectedReason(computerValidateUnityBridgeHandshake(record, targetRecord()))).toBe(
    COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_WINDOW_CLASS,
  )
}

function rejectsHandshakeWithoutMainThreadPump(): void {
  const record = handshakeRecord()
  record.main_thread_captured = false
  expect(computerUnityBridgeTestRejectedReason(computerValidateUnityBridgeHandshake(record, targetRecord()))).toBe(
    COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_PUMP,
  )
}

function rejectsHandshakeWithoutClickCapability(): void {
  const record = handshakeRecord()
  record.capabilities.click = false
  expect(computerUnityBridgeTestRejectedReason(computerValidateUnityBridgeHandshake(record, targetRecord()))).toBe(
    COMPUTER_UNITY_BRIDGE_HANDSHAKE_REASON_CAPABILITIES,
  )
}

test("handshake publicado pela bridge é lido", readsHandshakePublishedByBridge)

test("handshake ausente é reportado", reportsAbsentHandshake)

test("handshake ilegível é reportado", reportsUnreadableHandshake)

test("handshake de outro protocolo é rejeitado", rejectsHandshakeForOtherProtocol)

test("handshake fora de listening é rejeitado", rejectsHandshakeThatIsNotListening)

test("handshake de outra janela é rejeitado", rejectsHandshakeForOtherWindow)

test("handshake sem classe de janela Unity é rejeitado", rejectsHandshakeWithoutWindowClass)

test("handshake sem bomba de thread principal é rejeitado", rejectsHandshakeWithoutMainThreadPump)

test("handshake sem capacidade de clique é rejeitado", rejectsHandshakeWithoutClickCapability)
