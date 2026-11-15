import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_DRAG_OP,
  COMPUTER_UNITY_BRIDGE_KEY_OP,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V1,
  COMPUTER_UNITY_BRIDGE_SCROLL_OP,
  COMPUTER_UNITY_BRIDGE_TEXT_OP,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import { COMPUTER_UNITY_BRIDGE_TEST_PID, COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID } from "./unity-bridge-constants"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestOpCount,
  computerUnityBridgeTestRequest,
} from "./unity-bridge-helpers"
import { computerUnityBridgeTestOptions, computerUnityBridgeTestV2Options } from "./unity-bridge-support"
import {
  computerUnityBridgeTestDispatchedDrag,
  computerUnityBridgeTestDispatchedKey,
  computerUnityBridgeTestDispatchedScroll,
  computerUnityBridgeTestDispatchedText,
} from "./unity-bridge-tree-support"

const CAPTURE_TOOL = "get_window_state"

const SCROLL_TOOL = "scroll"

const DRAG_TOOL = "drag"

const TYPE_TOOL = "type_text"

const KEY_TOOL = "press_key"

const HOTKEY_TOOL = "hotkey"

const SCROLL_PIXEL_X = 117

const SCROLL_PIXEL_Y = 385

const SCROLL_CLIENT_Y = 360

function elementArguments(extra: ComputerDriverArguments): ComputerDriverArguments {
  return { pid: COMPUTER_UNITY_BRIDGE_TEST_PID, window_id: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID, ...extra }
}

async function scrollsElementThroughBridge(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedScroll()),
  )
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(SCROLL_TOOL, elementArguments({ element_index: 0, direction: "down", amount: 3 })),
    )
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_SCROLL_OP)
    expect(request.x).toBe(139)
    expect(request.y).toBe(359)
    expect(request.direction).toBe("down")
    expect(request.amount).toBe(3)
    expect(envelope.message).toContain("rolagem")
    expect(envelope.message).toContain("0.62")
    expect(envelope.message).toContain("cursor inalterado")
    expect(envelope.message).toContain("foreground inalterado")
  } finally {
    await harness.dispose()
  }
}

async function scrollsCoordinateThroughBridge(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedScroll()),
  )
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await harness.driver.call(
      SCROLL_TOOL,
      elementArguments({ x: SCROLL_PIXEL_X, y: SCROLL_PIXEL_Y, direction: "up", amount: 2 }),
    )
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_SCROLL_OP)
    expect(request.x).toBe(SCROLL_PIXEL_X)
    expect(request.y).toBe(SCROLL_CLIENT_Y)
    expect(request.direction).toBe("up")
  } finally {
    await harness.dispose()
  }
}

async function dragsElementsThroughBridge(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedDrag()),
  )
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(DRAG_TOOL, elementArguments({ from_element: 0, to_element: 1 })),
    )
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_DRAG_OP)
    expect(request.from_x).toBe(139)
    expect(request.from_y).toBe(359)
    expect(request.to_x).toBe(173)
    expect(request.to_y).toBe(205)
    expect(envelope.message).toContain("arrasto")
  } finally {
    await harness.dispose()
  }
}

async function typesTextThroughBridge(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedText()),
  )
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(TYPE_TOOL, elementArguments({ text: "abc" })),
    )
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_TEXT_OP)
    expect(request.text).toBe("abc")
    expect(envelope.message).toContain("texto")
  } finally {
    await harness.dispose()
  }
}

async function pressesKeyThroughBridge(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedKey()),
  )
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(KEY_TOOL, elementArguments({ key: "return" })),
    )
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_KEY_OP)
    expect(request.key).toBe("Return")
    expect(envelope.message).toContain("tecla")
  } finally {
    await harness.dispose()
  }
}

async function refusesHotkey(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(
    computerUnityBridgeTestV2Options(computerUnityBridgeTestDispatchedKey()),
  )
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(HOTKEY_TOOL, elementArguments({ keys: ["ctrl", "s"] })),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("combinações")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_KEY_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesScrollOnV1Bridge(): Promise<void> {
  const options = computerUnityBridgeTestOptions()
  options.protocol = COMPUTER_UNITY_BRIDGE_PROTOCOL_V1
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(SCROLL_TOOL, elementArguments({ element_index: 0, direction: "down", amount: 3 })),
    )
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("não é suportada")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_SCROLL_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

test("rolagem por elemento Unity vai para a bridge", scrollsElementThroughBridge)

test("rolagem por coordenada é mapeada para o cliente", scrollsCoordinateThroughBridge)

test("arrasto entre elementos Unity vai para a bridge", dragsElementsThroughBridge)

test("texto vai para a bridge sem captura", typesTextThroughBridge)

test("tecla isolada vai para a bridge", pressesKeyThroughBridge)

test("atalho é recusado com limitação explícita", refusesHotkey)

test("rolagem na bridge v1 é recusada", refusesScrollOnV1Bridge)
