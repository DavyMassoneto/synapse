import { describe, expect, test } from "vitest"
import {
  COMPUTER_INPUT_ELEMENT_TOKEN,
  computerConvertEnvelope,
  computerConvertTools,
} from "#synapse/modules/computer-use/adapters/driver-response-validation"
import {
  COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY,
  COMPUTER_DRIVER_TREE_FORMAT_PROPERTY,
  COMPUTER_MODE_SOM,
  COMPUTER_MODE_VISION,
  COMPUTER_TREE_FORMAT_ELEMENTS,
} from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_DISPATCH_DESKTOP_STATE,
  COMPUTER_DISPATCH_MAX_ELEMENTS,
  COMPUTER_DISPATCH_WINDOW_STATE,
  COMPUTER_EXACT_TARGET_SELECTED,
  COMPUTER_TARGET_SCREEN,
  COMPUTER_TARGET_SELECTED,
  computerCaptureFromEnvelope,
  computerPrepareCapture,
} from "../internal"
import {
  computerCurrentWindowStateTools,
  computerLegacyWindowStateTools,
} from "./driver-current-contract-capabilities-support"
import {
  COMPUTER_CURRENT_MM_APP,
  COMPUTER_CURRENT_MM_PID,
  COMPUTER_CURRENT_MM_WINDOW_ID,
  computerCurrentMmCaptureEnvelope,
  computerCurrentMmWindow,
} from "./driver-current-contract-support"

function requestsElementsForSelectedWindow(): void {
  const prepared = computerPrepareCapture(
    { action: "capture" },
    { kind: COMPUTER_TARGET_SELECTED, window: computerCurrentMmWindow() },
    computerCurrentWindowStateTools(),
  )

  expect(prepared.tool).toBe(COMPUTER_DISPATCH_WINDOW_STATE)
  expect(prepared.mode).toBe(COMPUTER_MODE_SOM)
  expect(prepared.app).toBe(COMPUTER_CURRENT_MM_APP)
  expect(prepared.arguments.pid).toBe(COMPUTER_CURRENT_MM_PID)
  expect(prepared.arguments.window_id).toBe(COMPUTER_CURRENT_MM_WINDOW_ID)
  expect(prepared.arguments.tree_format).toBe(COMPUTER_TREE_FORMAT_ELEMENTS)
  expect(prepared.arguments.max_elements).toBe(COMPUTER_DISPATCH_MAX_ELEMENTS)
}

function requestsElementsForExactWindow(): void {
  const prepared = computerPrepareCapture(
    { action: "capture" },
    { kind: COMPUTER_EXACT_TARGET_SELECTED, pid: COMPUTER_CURRENT_MM_PID, windowId: COMPUTER_CURRENT_MM_WINDOW_ID },
    computerCurrentWindowStateTools(),
  )

  expect(prepared.arguments.tree_format).toBe(COMPUTER_TREE_FORMAT_ELEMENTS)
  expect(prepared.arguments.max_elements).toBe(COMPUTER_DISPATCH_MAX_ELEMENTS)
}

function omitsUndeclaredArgumentsForLegacyWindowState(): void {
  const prepared = computerPrepareCapture(
    { action: "capture" },
    { kind: COMPUTER_EXACT_TARGET_SELECTED, pid: COMPUTER_CURRENT_MM_PID, windowId: COMPUTER_CURRENT_MM_WINDOW_ID },
    computerLegacyWindowStateTools(),
  )

  expect(prepared.arguments).toEqual({ pid: COMPUTER_CURRENT_MM_PID, window_id: COMPUTER_CURRENT_MM_WINDOW_ID })
  const capture = computerCaptureFromEnvelope(prepared, computerConvertEnvelope(computerCurrentMmCaptureEnvelope()))
  expect(capture.axMaxElements).toBe(COMPUTER_DISPATCH_MAX_ELEMENTS)
}

function omitsElementsForDesktopCapture(): void {
  const prepared = computerPrepareCapture(
    { action: "capture" },
    { kind: COMPUTER_TARGET_SCREEN },
    computerCurrentWindowStateTools(),
  )

  expect(prepared.tool).toBe(COMPUTER_DISPATCH_DESKTOP_STATE)
  expect(prepared.mode).toBe(COMPUTER_MODE_VISION)
  expect(prepared.arguments).toEqual({})
}

function capturesVisionWindowThroughWindowState(): void {
  const prepared = computerPrepareCapture(
    { action: "capture", mode: COMPUTER_MODE_VISION },
    { kind: COMPUTER_TARGET_SELECTED, window: computerCurrentMmWindow() },
    computerCurrentWindowStateTools(),
  )

  expect(prepared.tool).toBe(COMPUTER_DISPATCH_WINDOW_STATE)
  expect(prepared.mode).toBe(COMPUTER_MODE_VISION)
  expect(prepared.arguments.tree_format).toBe(COMPUTER_TREE_FORMAT_ELEMENTS)
  expect("format" in prepared.arguments).toBe(false)
  expect("quality" in prepared.arguments).toBe(false)
}

function capturesExactWindowWithResolvedApp(): void {
  const prepared = computerPrepareCapture(
    { action: "capture" },
    { kind: COMPUTER_EXACT_TARGET_SELECTED, pid: COMPUTER_CURRENT_MM_PID, windowId: COMPUTER_CURRENT_MM_WINDOW_ID },
    computerCurrentWindowStateTools(),
  )
  const capture = computerCaptureFromEnvelope(prepared, computerConvertEnvelope(computerCurrentMmCaptureEnvelope()))

  expect(capture.app).toBe(COMPUTER_CURRENT_MM_APP)
  expect(capture.elements[0]?.app).toBe(COMPUTER_CURRENT_MM_APP)
  expect(capture.elements[0]?.token).toBe("s0000001e:0")
}

function convertsDeclaredTreeCapabilities(): void {
  const tools = computerConvertTools({
    tools: [
      {
        name: COMPUTER_DISPATCH_WINDOW_STATE,
        inputSchema: {
          properties: {
            element_token: { type: "string" },
            tree_format: { type: "string" },
            max_elements: { type: "integer" },
          },
        },
      },
    ],
  })

  expect(tools).toEqual([
    {
      name: COMPUTER_DISPATCH_WINDOW_STATE,
      inputProperties: [
        COMPUTER_INPUT_ELEMENT_TOKEN,
        COMPUTER_DRIVER_TREE_FORMAT_PROPERTY,
        COMPUTER_DRIVER_MAX_ELEMENTS_PROPERTY,
      ],
    },
  ])
}

function omitsUndeclaredTreeCapabilities(): void {
  const tools = computerConvertTools({
    tools: [
      {
        name: COMPUTER_DISPATCH_WINDOW_STATE,
        inputSchema: { properties: { element_token: { type: "string" } } },
      },
    ],
  })

  expect(tools).toEqual([{ name: COMPUTER_DISPATCH_WINDOW_STATE, inputProperties: [COMPUTER_INPUT_ELEMENT_TOKEN] }])
}

function register(): void {
  test("pede tree_format elements para janela selecionada", requestsElementsForSelectedWindow)
  test("pede tree_format elements para alvo exato", requestsElementsForExactWindow)
  test("omite argumentos não declarados pelo driver antigo", omitsUndeclaredArgumentsForLegacyWindowState)
  test("não envia tree_format para captura de tela", omitsElementsForDesktopCapture)
  test("usa o app_name do envelope em alvo exato", capturesExactWindowWithResolvedApp)
  test("captura janela em modo vision pelo estado da janela", capturesVisionWindowThroughWindowState)
  test("converte capacidades tree_format e max_elements declaradas", convertsDeclaredTreeCapabilities)
  test("não inventa capacidades tree_format e max_elements ausentes", omitsUndeclaredTreeCapabilities)
}

describe("negociação de capacidades do driver", register)
