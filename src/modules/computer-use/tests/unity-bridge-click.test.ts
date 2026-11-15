import { expect, test } from "vitest"
import {
  COMPUTER_EFFECT_UNVERIFIABLE,
  type ComputerDriverArguments,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_OTHER_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_SCALED_IMAGE_HEIGHT,
  COMPUTER_UNITY_BRIDGE_TEST_SCALED_IMAGE_WIDTH,
} from "./unity-bridge-constants"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestClickArguments,
  computerUnityBridgeTestClickCount,
  computerUnityBridgeTestClickPoint,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestFofocasArguments,
} from "./unity-bridge-helpers"
import { computerUnityBridgeTestOptions } from "./unity-bridge-support"

const CAPTURE_TOOL = "get_window_state"

const CLICK_TOOL = "click"

function nativeClickCalls(harness: ComputerUnityBridgeTestHarness): number {
  return harness.native.calls.filter((call) => call.name === CLICK_TOOL).length
}

async function clicksThroughBridgeAfterCapture(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(false)
    expect(envelope.effect).toBe(COMPUTER_EFFECT_UNVERIFIABLE)
    expect(computerUnityBridgeTestClickPoint(harness.server.requests)).toEqual({
      x: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
      y: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
    })
    expect(nativeClickCalls(harness)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesClickWithoutCapture(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("não há captura")
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
    expect(nativeClickCalls(harness)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesClickWhenGeometryMoved(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    harness.server.moveTo(COMPUTER_UNITY_BRIDGE_TEST_OTHER_CLIENT_Y)
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments()),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("mudou desde a última captura")
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesClickOutsideClientArea(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const argumentsValue = computerUnityBridgeTestClickArguments(4000, 1200)
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, argumentsValue))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("não permite converter o pixel")
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesInputThatBridgeDoesNotDeliver(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const argumentsValue: ComputerDriverArguments = { ...computerUnityBridgeTestCaptureArguments(), key: "return" }
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call("press_key", argumentsValue))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("não é suportada")
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
    expect(nativeClickCalls(harness)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function mapsScaledCaptureIntoClientPoint(): Promise<void> {
  const options = computerUnityBridgeTestOptions()
  options.image = {
    width: COMPUTER_UNITY_BRIDGE_TEST_SCALED_IMAGE_WIDTH,
    height: COMPUTER_UNITY_BRIDGE_TEST_SCALED_IMAGE_HEIGHT,
  }
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await harness.driver.call(CLICK_TOOL, computerUnityBridgeTestFofocasArguments())
    const point = computerUnityBridgeTestClickPoint(harness.server.requests)
    expect(point.x).toBeCloseTo(144.26, 1)
    expect(point.y).toBeCloseTo(449.45, 1)
  } finally {
    await harness.dispose()
  }
}

async function ignoresInputWithoutWindowTarget(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CLICK_TOOL, { x: COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X }),
    )
    expect(envelope.isError).toBe(false)
    expect(nativeClickCalls(harness)).toBe(1)
    expect(computerUnityBridgeTestClickCount(harness.server.requests)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

test("clique é entregue à bridge depois da captura", clicksThroughBridgeAfterCapture)

test("clique sem captura da janela é recusado", refusesClickWithoutCapture)

test("clique com geometria alterada é recusado", refusesClickWhenGeometryMoved)

test("clique fora da área cliente é recusado", refusesClickOutsideClientArea)

test("entrada que a bridge não entrega é recusada", refusesInputThatBridgeDoesNotDeliver)

test("captura escalada é mapeada para a área cliente", mapsScaledCaptureIntoClientPoint)

test("entrada sem janela alvo segue para o driver nativo", ignoresInputWithoutWindowTarget)
