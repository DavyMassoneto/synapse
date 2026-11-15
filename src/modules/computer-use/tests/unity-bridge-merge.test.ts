import { expect, test } from "vitest"
import {
  COMPUTER_UNITY_BRIDGE_CLICK_OP,
  COMPUTER_UNITY_BRIDGE_PROTOCOL_V2,
} from "#synapse/modules/computer-use/adapters/unity-bridge"
import { type ComputerDriverArguments } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
  COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_LABEL,
  COMPUTER_UNITY_BRIDGE_TEST_OTHER_CLIENT_Y,
  COMPUTER_UNITY_BRIDGE_TEST_PID,
  COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
} from "./unity-bridge-constants"
import { ComputerUnityBridgeTestHarness } from "./unity-bridge-harness"
import {
  computerUnityBridgeTestCaptureArguments,
  computerUnityBridgeTestEnvelope,
  computerUnityBridgeTestOpCount,
  computerUnityBridgeTestRequest,
} from "./unity-bridge-helpers"
import {
  computerUnityBridgeTestDispatchedClick,
  computerUnityBridgeTestOptions,
  computerUnityBridgeTestV2Options,
} from "./unity-bridge-support"
import {
  COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID,
  COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION,
  COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT,
  computerUnityBridgeTestTree,
  computerUnityBridgeTestTreeV1,
} from "./unity-bridge-tree-support"

const CAPTURE_TOOL = "get_window_state"

const CLICK_TOOL = "click"

const NATIVE_ELEMENT_INDEX = 50

function v2Options() {
  return computerUnityBridgeTestV2Options(
    computerUnityBridgeTestDispatchedClick(
      COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_X,
      COMPUTER_UNITY_BRIDGE_TEST_FOFOCAS_CLIENT_Y,
    ),
  )
}

function elementArguments(index: number): ComputerDriverArguments {
  return {
    pid: COMPUTER_UNITY_BRIDGE_TEST_PID,
    window_id: COMPUTER_UNITY_BRIDGE_TEST_WINDOW_ID,
    element_index: index,
  }
}

async function mergesTreeElementsIntoCapture(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    const envelope = computerUnityBridgeTestEnvelope(
      await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments()),
    )
    expect(envelope.elements).toHaveLength(3)
    expect(envelope.elements.filter((element) => element.label === COMPUTER_UNITY_BRIDGE_TEST_LABEL)).toHaveLength(1)
    expect(envelope.elements[0]).toMatchObject({
      index: 0,
      role: "Toggle",
      label: COMPUTER_UNITY_BRIDGE_TEST_LABEL,
      token: COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID,
    })
    expect(envelope.elements[0]?.bounds).toEqual({
      kind: "bounds-known",
      rectangle: {
        x: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_X + 72,
        y: COMPUTER_UNITY_BRIDGE_TEST_CLIENT_Y + 346,
        width: 134,
        height: 26,
      },
    })
    expect(envelope.elements[2]).toMatchObject({ index: 2, role: "text", label: COMPUTER_UNITY_BRIDGE_TEST_TREE_TEXT })
  } finally {
    await harness.dispose()
  }
}

async function clicksElementById(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, elementArguments(0)))
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)
    expect(request.id).toBe(COMPUTER_UNITY_BRIDGE_TEST_TREE_FOFOCAS_ID)
    expect(request.generation).toBe(COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION)
    expect(harness.native.calls.filter((call) => call.name === CLICK_TOOL)).toHaveLength(0)
  } finally {
    await harness.dispose()
  }
}

async function clicksV1ElementByPoint(): Promise<void> {
  const options = computerUnityBridgeTestOptions()
  options.tree = computerUnityBridgeTestTreeV1()
  const harness = await ComputerUnityBridgeTestHarness.create(options)
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, elementArguments(0)))
    expect(envelope.isError).toBe(false)
    const request = computerUnityBridgeTestRequest(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)
    expect(request.x).toBe(139)
    expect(request.y).toBe(359)
    expect(request.id).toBeUndefined()
  } finally {
    await harness.dispose()
  }
}

async function refusesElementClickAfterGenerationChange(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    harness.server.bumpGeneration()
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, elementArguments(0)))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("geração da bridge diferente")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function refusesElementClickAfterGeometryChange(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    harness.server.moveTo(COMPUTER_UNITY_BRIDGE_TEST_OTHER_CLIENT_Y)
    const envelope = computerUnityBridgeTestEnvelope(await harness.driver.call(CLICK_TOOL, elementArguments(0)))
    expect(envelope.isError).toBe(true)
    expect(envelope.message).toContain("mudou desde a última captura")
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function routesUnknownElementToNativeDriver(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    await harness.driver.call(CLICK_TOOL, elementArguments(NATIVE_ELEMENT_INDEX))
    expect(harness.native.calls.filter((call) => call.name === CLICK_TOOL)).toHaveLength(1)
    expect(computerUnityBridgeTestOpCount(harness.server.requests, COMPUTER_UNITY_BRIDGE_CLICK_OP)).toBe(0)
  } finally {
    await harness.dispose()
  }
}

async function keepsProtocolOnTreeCapture(): Promise<void> {
  const harness = await ComputerUnityBridgeTestHarness.create(v2Options())
  try {
    await harness.driver.call(CAPTURE_TOOL, computerUnityBridgeTestCaptureArguments())
    expect(harness.protocol).toBe(COMPUTER_UNITY_BRIDGE_PROTOCOL_V2)
    expect(computerUnityBridgeTestTree().generation).toBe(COMPUTER_UNITY_BRIDGE_TEST_TREE_GENERATION)
  } finally {
    await harness.dispose()
  }
}

test("captura mescla elementos do tree depois dos elementos nativos", mergesTreeElementsIntoCapture)

test("clique por elemento Unity usa id e geração", clicksElementById)

test("clique por elemento na bridge v1 cai no ponto central", clicksV1ElementByPoint)

test("clique por elemento com geração diferente é recusado", refusesElementClickAfterGenerationChange)

test("clique por elemento com geometria alterada é recusado", refusesElementClickAfterGeometryChange)

test("índice fora do tree segue para o driver nativo", routesUnknownElementToNativeDriver)

test("captura v2 mantém o protocolo do handshake", keepsProtocolOnTreeCapture)
