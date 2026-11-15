import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import { COMPUTER_UNITY_BRIDGE_PROTOCOL_V2 } from "#synapse/modules/computer-use/adapters/unity-bridge"
import { COMPUTER_DRIVER_DISCONNECTED } from "#synapse/modules/computer-use/public/contracts"
import {
  computerUnityBridgeTestAttachFailed,
  computerUnityBridgeTestProbeNotUnity,
  computerUnityBridgeTestSucceeded,
} from "./unity-bridge-command-support"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestClickCount,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestFofocasArguments,
} from "./unity-bridge-helpers"
import { computerUnityBridgeTestOptions, computerUnityBridgeTestRefusedClick } from "./unity-bridge-support"
import { computerUnityBridgeTestTree } from "./unity-bridge-tree-support"

const CAPTURE_TOOL = "get_window_state"

const CLICK_TOOL = "click"

const ATTACH_DELAY_MILLISECONDS = 100

function nativeClickCalls(harness: ComputerUnityBridgeTestHarness): number {
  return harness.native.calls.filter((call) => call.name === CLICK_TOOL).length
}

function optionsWithoutBridge() {
  const options = computerUnityBridgeTestOptions()
  options.bridge = false
  return options
}

async function keepsNativeRouteForTargetThatIsNotUnity(): Promise<void> {
  const options = optionsWithoutBridge()
  options.commands = [computerUnityBridgeTestProbeNotUnity()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(false)
    expect(nativeClickCalls(harness)).toBe(1)
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesUnityTargetWithoutBridge(): Promise<void> {
  const options = optionsWithoutBridge()
  options.commands = [computerUnityBridgeTestSucceeded()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("é um aplicativo Unity")
    expect(envelope.message).toContain("computer-use-unity-bridge.json")
    expect(nativeClickCalls(harness)).toBe(0)
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesUnityTargetWhenAttachFails(): Promise<void> {
  const options = optionsWithoutBridge()
  options.attachCommand = true
  options.commands = [computerUnityBridgeTestSucceeded(), computerUnityBridgeTestAttachFailed()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("anexo")
    expect(nativeClickCalls(harness)).toBe(0)
    expect(harness.commands.calls).toHaveLength(2)
  } finally {
    await harness.dispose()
  }
}

async function capturesAfterAttachPublishesHandshake(): Promise<void> {
  const options = optionsWithoutBridge()
  options.protocol = COMPUTER_UNITY_BRIDGE_PROTOCOL_V2
  options.tree = computerUnityBridgeTestTree()
  options.attachCommand = true
  options.commands = [computerUnityBridgeTestSucceeded(), computerUnityBridgeTestSucceeded()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    const pending = harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await setTimeout(ATTACH_DELAY_MILLISECONDS)
    harness.publishHandshake()
    const envelope = computerUnityBridgeTestEnvelope(await pending)
    expect(envelope.elements).toHaveLength(3)
    expect(harness.commands.calls).toHaveLength(2)
    const again = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments()),
    )
    expect(again.elements).toHaveLength(3)
    expect(harness.commands.calls).toHaveLength(2)
  } finally {
    await harness.dispose()
  }
}

async function routesAfterAttachPublishesHandshake(): Promise<void> {
  const options = optionsWithoutBridge()
  options.attachCommand = true
  options.commands = [computerUnityBridgeTestSucceeded(), computerUnityBridgeTestSucceeded()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const pending = harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments())
    await setTimeout(ATTACH_DELAY_MILLISECONDS)
    harness.publishHandshake()
    const attached = computerUnityBridgeTestEnvelope(await pending)
    expect(attached.isError).toBe(true)
    expect(attached.message).toContain("não há captura")
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(false)
    expect(harness.commands.calls).toHaveLength(2)
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(1)
  } finally {
    await harness.dispose()
  }
}

async function reportsOutcomeUnknownWhenBridgeDropsTheClick(): Promise<void> {
  const options = computerUnityBridgeTestOptions()
  options.clickDrop = true
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const result = await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments())
    expect(result.kind).toBe(COMPUTER_DRIVER_DISCONNECTED)
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(1)
    expect(nativeClickCalls(harness)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function rejectsClickRefusedByBridge(): Promise<void> {
  const options = computerUnityBridgeTestOptions()
  options.click = computerUnityBridgeTestRefusedClick("ponto fora do alvo")
  options.action = options.click
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("ponto fora do alvo")
  } finally {
    await harness.dispose()
  }
}

test("alvo que não é Unity mantém a rota nativa", keepsNativeRouteForTargetThatIsNotUnity)

test("alvo Unity sem bridge e sem anexo gera limitação", refusesUnityTargetWithoutBridge)

test("falha do anexo gera limitação", refusesUnityTargetWhenAttachFails)

test("captura anexa a bridge e mescla elementos após o handshake", capturesAfterAttachPublishesHandshake)

test("anexo publicado roteia pela bridge depois de nova captura", routesAfterAttachPublishesHandshake)

test("queda da bridge no clique é resultado desconhecido", reportsOutcomeUnknownWhenBridgeDropsTheClick)

test("recusa da bridge vira rejeição", rejectsClickRefusedByBridge)
