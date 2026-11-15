import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import {
  COMPUTER_RAW_STATE_SCHEMA,
  COMPUTER_VALID_RPC,
  computerConvertEnvelope,
  computerParseRpcResponse,
} from "#synapse/modules/computer-use/adapters/driver-response-validation"
import { COMPUTER_IMAGE_PRESENT, COMPUTER_PNG_MIME } from "#synapse/modules/computer-use/public/contracts"
import {
  COMPUTER_CURRENT_BACKGROUND_UNAVAILABLE_MESSAGE,
  COMPUTER_CURRENT_CLICK_SUMMARY,
  COMPUTER_CURRENT_INVALID_WINDOW_MESSAGE,
  COMPUTER_CURRENT_MM_APP,
  COMPUTER_CURRENT_MM_PID,
  COMPUTER_CURRENT_REFUSED_MESSAGE,
  computerCurrentAppsState,
  computerCurrentBackgroundUnavailableEnvelope,
  computerCurrentClickSummaryEnvelope,
  computerCurrentInvalidWindowEnvelope,
  computerCurrentMmCaptureEnvelope,
  computerCurrentMmCaptureState,
  computerCurrentMmElementState,
  computerCurrentRefusedEnvelope,
} from "./driver-current-contract-support"

function acceptsCurrentCaptureState(): void {
  expect(Value.Check(COMPUTER_RAW_STATE_SCHEMA, computerCurrentMmCaptureState())).toBe(true)
}

function convertsCurrentMmCapture(): void {
  const envelope = computerConvertEnvelope(computerCurrentMmCaptureEnvelope())

  expect(envelope.elements).toHaveLength(5)
  expect(envelope.elements[0]?.index).toBe(0)
  expect(envelope.elements[0]?.role).toBe("TitleBar")
  expect(envelope.elements[0]?.app).toBe(COMPUTER_CURRENT_MM_APP)
  expect(envelope.elements[0]?.bounds.kind).toBe("bounds-known")
  expect(envelope.elements[4]?.label).toBe("Fechar")
  expect(envelope.image).toMatchObject({
    kind: COMPUTER_IMAGE_PRESENT,
    mime: COMPUTER_PNG_MIME,
    width: 32,
    height: 18,
  })
  expect(envelope.isError).toBe(false)
}

function rejectsNegativeElementIndex(): void {
  expect(Value.Check(COMPUTER_RAW_STATE_SCHEMA, computerCurrentMmElementState(-1))).toBe(false)
}

function rejectsFractionalElementIndex(): void {
  expect(Value.Check(COMPUTER_RAW_STATE_SCHEMA, computerCurrentMmElementState(1.5))).toBe(false)
}

function parsesCurrentMmRpcResponse(): void {
  const line = JSON.stringify({ id: 7, jsonrpc: "2.0", result: computerCurrentMmCaptureEnvelope() })
  const parsed = computerParseRpcResponse(line)

  expect(parsed.kind).toBe(COMPUTER_VALID_RPC)
  if (parsed.kind === COMPUTER_VALID_RPC) {
    const result = parsed.response.result
    if (!result || !("content" in result)) {
      throw new Error("Resposta sem envelope.")
    }
    expect(computerConvertEnvelope(result).elements).toHaveLength(5)
  }
}

function preservesInvalidWindowMessage(): void {
  const envelope = computerConvertEnvelope(computerCurrentInvalidWindowEnvelope())

  expect(envelope.isError).toBe(true)
  expect(envelope.message).toBe(COMPUTER_CURRENT_INVALID_WINDOW_MESSAGE)
  expect(envelope.code).toBeUndefined()
}

function preservesBackgroundUnavailableMessage(): void {
  const envelope = computerConvertEnvelope(computerCurrentBackgroundUnavailableEnvelope())

  expect(envelope.isError).toBe(true)
  expect(envelope.message).toBe(COMPUTER_CURRENT_BACKGROUND_UNAVAILABLE_MESSAGE)
  expect(envelope.recommended).toBe("foreground")
  expect(envelope.code).toBeUndefined()
}

function usesStructuredSummaryAsMessage(): void {
  const envelope = computerConvertEnvelope(computerCurrentClickSummaryEnvelope())

  expect(envelope.message).toBe(COMPUTER_CURRENT_CLICK_SUMMARY)
  expect(envelope.effect).toBe("unverifiable")
  expect(envelope.isError).toBe(false)
}

function treatsRefusedEffectAsError(): void {
  const envelope = computerConvertEnvelope(computerCurrentRefusedEnvelope())

  expect(envelope.isError).toBe(true)
  expect(envelope.message).toBe(COMPUTER_CURRENT_REFUSED_MESSAGE)
  expect(envelope.effect).toBeUndefined()
  expect(envelope.code).toBeUndefined()
}

function acceptsNullBundleIdentifier(): void {
  const envelope = computerConvertEnvelope({ content: [], structuredContent: computerCurrentAppsState() })

  expect(envelope.applications).toEqual([
    { aliases: [], name: COMPUTER_CURRENT_MM_APP, pid: COMPUTER_CURRENT_MM_PID, running: true },
    { aliases: [], name: "Installed.App.exe", pid: 0, running: false },
  ])
}

function rejectsInvalidAppPid(): void {
  const state = computerCurrentAppsState()
  const app = state.apps?.[0]
  if (app) {
    app.pid = -1
  }
  expect(Value.Check(COMPUTER_RAW_STATE_SCHEMA, state)).toBe(false)
}

function register(): void {
  test("aceita o estado real da captura do Motorsport Manager", acceptsCurrentCaptureState)
  test("converte TitleBar no índice zero, controles e imagem do Motorsport Manager", convertsCurrentMmCapture)
  test("recusa índice de elemento negativo", rejectsNegativeElementIndex)
  test("recusa índice de elemento fracionário", rejectsFractionalElementIndex)
  test("parseia a resposta JSON-RPC do Motorsport Manager sem invalidar", parsesCurrentMmRpcResponse)
  test("preserva a mensagem de erro tool_invocation_failed", preservesInvalidWindowMessage)
  test("preserva a mensagem de recusa background_unavailable", preservesBackgroundUnavailableMessage)
  test("usa summary estruturado como mensagem", usesStructuredSummaryAsMessage)
  test("trata effect refused como erro com mensagem", treatsRefusedEffectAsError)
  test("aceita bundle_id nulo do list_apps", acceptsNullBundleIdentifier)
  test("recusa pid de aplicativo inválido", rejectsInvalidAppPid)
}

describe("contrato atual do driver de computer use", register)
