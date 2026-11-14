import { describe, expect, test } from "vitest"
import { computerConvertEnvelope, computerParseRpcResponse } from "../adapters"
import { ComputerStickyWindowTarget, computerJudgeAction } from "../internal"
import {
  COMPUTER_INSTALLED_APP,
  COMPUTER_RUNNING_APP,
  COMPUTER_WINDOW_REFUSAL_MESSAGE,
} from "./driver-response-constants"
import { computerTestRpcKind } from "./driver-response-support"
import { computerTestWindow } from "./support"

function runningAndInstalled(): void {
  const parsed = computerParseRpcResponse(
    JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      result: { content: [], structuredContent: { apps: [COMPUTER_RUNNING_APP, COMPUTER_INSTALLED_APP] } },
    }),
  )
  expect(parsed.kind).toBe("valid-rpc")
  const envelope = computerConvertEnvelope({
    content: [],
    structuredContent: {
      apps: [
        { name: "Editor", pid: 10, running: true, bundle_id: "com.editor" },
        { name: "Installed", pid: 0, running: false, bundle_id: "com.installed" },
      ],
    },
  })
  expect(envelope.applications).toEqual([
    { name: "Editor", pid: 10, running: true, aliases: ["com.editor"] },
    { name: "Installed", pid: 0, running: false, aliases: ["com.installed"] },
  ])
}

function negativePid(): void {
  expect(computerTestRpcKind('{"apps":[{"name":"Editor","pid":-1,"running":true}]}')).toBe("invalid-rpc")
}

function fractionalPid(): void {
  expect(computerTestRpcKind('{"apps":[{"name":"Editor","pid":1.5,"running":true}]}')).toBe("invalid-rpc")
}

function textPid(): void {
  expect(computerTestRpcKind('{"apps":[{"name":"Editor","pid":"10","running":true}]}')).toBe("invalid-rpc")
}

function runningZeroPid(): void {
  expect(computerTestRpcKind('{"apps":[{"name":"Editor","pid":0,"running":true}]}')).toBe("invalid-rpc")
}

function installedPositivePid(): void {
  expect(computerTestRpcKind('{"apps":[{"name":"Installed","pid":10,"running":false}]}')).toBe("invalid-rpc")
}

function invalidWindowPid(): void {
  expect(
    computerTestRpcKind(
      '{"windows":[{"app_name":"Editor","pid":0,"window_id":1,"is_on_screen":true,"title":"Document","z_index":0}]}',
    ),
  ).toBe("invalid-rpc")
}

function installedCannotSelectWindow(): void {
  const envelope = computerConvertEnvelope({
    content: [],
    structuredContent: {
      apps: [{ name: "Installed", pid: 0, running: false, bundle_id: "com.installed" }],
    },
  })
  const target = new ComputerStickyWindowTarget()
  expect(
    target.select(
      [computerTestWindow("Editor", 10, 1)],
      envelope.applications,
      { kind: "target-app", app: "com.installed" },
      "darwin",
    ).kind,
  ).toBe("target-rejected")
  expect(target.current().kind).toBe("target-absent")
}

function zeroElementWithoutLabel(): void {
  expect(
    computerTestRpcKind(
      '{"elements":[{"element_index":0,"role":"AXWindow"},{"element_index":1,"role":"AXButton","label":"Save"}]}',
    ),
  ).toBe("valid-rpc")
  const envelope = computerConvertEnvelope({
    content: [],
    structuredContent: {
      elements: [
        { element_index: 0, role: "AXWindow", element_token: "root-token" },
        { element_index: 1, role: "AXButton", label: "Save" },
      ],
    },
  })
  expect(envelope.elements[0]).toEqual({
    index: 0,
    role: "AXWindow",
    token: "root-token",
    bounds: { kind: "bounds-absent" },
  })
  expect(envelope.elements[1]?.label).toBe("Save")
}

function negativeElement(): void {
  expect(computerTestRpcKind('{"elements":[{"element_index":-1,"role":"AXButton"}]}')).toBe("invalid-rpc")
}

function fractionalElement(): void {
  expect(computerTestRpcKind('{"elements":[{"element_index":0.5,"role":"AXButton"}]}')).toBe("invalid-rpc")
}

function textElement(): void {
  expect(computerTestRpcKind('{"elements":[{"element_index":"0","role":"AXButton"}]}')).toBe("invalid-rpc")
}

function invalidLabel(): void {
  expect(computerTestRpcKind('{"elements":[{"element_index":0,"role":"AXButton","label":false}]}')).toBe("invalid-rpc")
}

function windowNotFound(): void {
  expect(
    computerTestRpcKind('{"code":"window_id_not_found","pid":10,"window_id":20,"suggestion":"call list_windows"}'),
  ).toBe("valid-rpc")
  const envelope = computerConvertEnvelope({
    content: [{ type: "text", text: COMPUTER_WINDOW_REFUSAL_MESSAGE }],
    structuredContent: { code: "window_id_not_found" },
    isError: true,
  })
  expect(envelope).toMatchObject({
    isError: true,
    message: COMPUTER_WINDOW_REFUSAL_MESSAGE,
    code: "window_id_not_found",
    elements: [],
    windows: [],
  })
  expect(
    computerJudgeAction({
      action: "capture",
      ok: !envelope.isError,
      message: envelope.message,
      ...(envelope.code ? { code: envelope.code } : {}),
    }).result,
  ).toEqual({ kind: "failed", action: "capture", message: COMPUTER_WINDOW_REFUSAL_MESSAGE })
}

function ownerMismatch(): void {
  expect(computerTestRpcKind('{"code":"window_owner_pid_mismatch","pid":10,"window_id":20,"owner_pid":30}')).toBe(
    "valid-rpc",
  )
  const envelope = computerConvertEnvelope({
    content: [{ type: "text", text: COMPUTER_WINDOW_REFUSAL_MESSAGE }],
    structuredContent: { code: "window_owner_pid_mismatch" },
    isError: true,
  })
  expect(envelope.message).toBe(COMPUTER_WINDOW_REFUSAL_MESSAGE)
  expect(
    computerJudgeAction({
      action: "capture",
      ok: !envelope.isError,
      message: envelope.message,
      ...(envelope.code ? { code: envelope.code } : {}),
    }).result.kind,
  ).toBe("failed")
}

function unknownCode(): void {
  expect(computerTestRpcKind('{"code":"unrecognized_error"}')).toBe("invalid-rpc")
}

function structuredMessagePreserved(): void {
  const envelope = computerConvertEnvelope({
    content: [{ type: "text", text: "Other text" }],
    structuredContent: { message: COMPUTER_WINDOW_REFUSAL_MESSAGE, code: "window_id_not_found" },
    isError: true,
  })
  expect(envelope.message).toBe(COMPUTER_WINDOW_REFUSAL_MESSAGE)
}

function register(): void {
  test("preserva aplicativos ativos e instalados sem processo", runningAndInstalled)
  test("recusa PID negativo", negativePid)
  test("recusa PID fracionário", fractionalPid)
  test("recusa PID textual", textPid)
  test("recusa aplicativo ativo sem PID", runningZeroPid)
  test("recusa aplicativo inativo com PID vivo", installedPositivePid)
  test("continua recusando PID zero em janela", invalidWindowPid)
  test("aplicativo instalado não fornece alvo interativo", installedCannotSelectWindow)
  test("preserva índice zero e ausência de rótulo", zeroElementWithoutLabel)
  test("recusa índice negativo", negativeElement)
  test("recusa índice fracionário", fractionalElement)
  test("recusa índice textual", textElement)
  test("recusa rótulo de tipo inválido", invalidLabel)
  test("preserva recusa de janela ausente com texto e código", windowNotFound)
  test("preserva recusa de PID proprietário divergente", ownerMismatch)
  test("recusa código não contratado", unknownCode)
  test("preserva mensagem estruturada de erro", structuredMessagePreserved)
}

describe("respostas do driver 0.21", register)
