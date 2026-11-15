import { setTimeout } from "node:timers/promises"
import { expect, test } from "vitest"
import { COMPUTER_UNITY_BRIDGE_STOP_OP } from "#synapse/modules/computer-use/adapters/unity-bridge"
import { computerUnityBridgeTestSucceeded } from "./unity-bridge-command-support"
import {
  COMPUTER_UNITY_BRIDGE_TEST_BAD_TOKEN,
  COMPUTER_UNITY_BRIDGE_TEST_OTHER_INSTANCE,
  COMPUTER_UNITY_BRIDGE_TEST_TOKEN,
} from "./unity-bridge-constants"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestOpCount,
  computerUnityBridgeTestRequest,
} from "./unity-bridge-helpers"
import { computerUnityBridgeTestOptions } from "./unity-bridge-support"
import { type ComputerUnityBridgeTestHarnessOptions } from "./unity-bridge-types"

const CAPTURE_TOOL = "get_window_state"

const ATTACH_DELAY_MILLISECONDS = 100

function optionsWithoutBridge(): ComputerUnityBridgeTestHarnessOptions {
  const options = computerUnityBridgeTestOptions()
  options.bridge = false
  return options
}

async function stopsOnlyTheBridgeItAttached(): Promise<void> {
  const options = optionsWithoutBridge()
  options.attachCommand = true
  options.commands = [computerUnityBridgeTestSucceeded(), computerUnityBridgeTestSucceeded()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    const pending = harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await setTimeout(ATTACH_DELAY_MILLISECONDS)
    harness.publishHandshake()
    computerUnityBridgeTestEnvelope(await pending)
    await harness.driver.stop()
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_STOP_OP)).toBe(1)
    const stop = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_STOP_OP)
    expect(stop.token).toBe(COMPUTER_UNITY_BRIDGE_TEST_TOKEN)
    await harness.driver.stop()
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_STOP_OP)).toBe(1)
  } finally {
    await harness.dispose()
  }
}

async function doesNotStopAReplacementBridge(): Promise<void> {
  const options = optionsWithoutBridge()
  options.attachCommand = true
  options.commands = [computerUnityBridgeTestSucceeded(), computerUnityBridgeTestSucceeded()]
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    const pending = harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await setTimeout(ATTACH_DELAY_MILLISECONDS)
    harness.publishHandshake()
    computerUnityBridgeTestEnvelope(await pending)
    harness.replaceBridgeIdentity(COMPUTER_UNITY_BRIDGE_TEST_OTHER_INSTANCE, COMPUTER_UNITY_BRIDGE_TEST_BAD_TOKEN)
    await harness.driver.stop()
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_STOP_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function keepsPreexistingBridgeRunning(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await harness.driver.stop()
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_STOP_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

test("stop encerra apenas a bridge que o módulo anexou", stopsOnlyTheBridgeItAttached)

test("stop não toca em uma bridge que substituiu a instância anexada", doesNotStopAReplacementBridge)

test("stop não toca em bridge preexistente", keepsPreexistingBridgeRunning)
