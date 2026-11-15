import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_CLICK_OP,
  COMPUTER_UNITY_BRIDGE_SCROLL_OP,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestFofocasArguments,
  computerUnityBridgeTestOpCount,
} from "./unity-bridge-helpers"
import { computerUnityBridgeTestOptions, computerUnityBridgeTestV2Options } from "./unity-bridge-support"
import { computerUnityBridgeTestDispatchedScroll } from "./unity-bridge-tree-support"

const CAPTURE_TOOL = "get_window_state"

const CLICK_TOOL = "click"

const SCROLL_TOOL = "scroll"

function modifiedClickArguments(): ComputerDriverArguments {
  return { ...computerUnityBridgeTestFofocasArguments(), modifier: ["shift"] }
}

function modifiedScrollArguments(): ComputerDriverArguments {
  return {
    ...computerUnityBridgeTestCaptureArguments(),
    element_index: 0,
    direction: "down",
    amount: 3,
    modifier: ["ctrl"],
  }
}

async function refusesModifiedClick(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(computerUnityBridgeTestOptions())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, modifiedClickArguments()))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("modificadores")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)).toBe(0)
    expect(harness.native.calls).toHaveLength(1)
  } finally {
    await harness.dispose()
  }
}

async function refusesModifiedScroll(): Promise<void> {
  const options = computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedScroll())
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(SCROLL_TOOL, modifiedScrollArguments()))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("modificadores")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_SCROLL_OP)).toBe(0)
    expect(harness.native.calls).toHaveLength(1)
  } finally {
    await harness.dispose()
  }
}

test("clique com modificador é recusado sem degradar para clique simples", refusesModifiedClick)

test("rolagem com modificador é recusada sem degradar para rolagem simples", refusesModifiedScroll)
