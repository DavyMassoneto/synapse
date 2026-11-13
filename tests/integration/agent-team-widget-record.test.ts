import { Value } from "typebox/value"
import { describe, expect, test } from "vitest"
import { PI_PROCESS_RECORD_SCHEMA } from "../fixtures"

function acceptsWidgetLines(): void {
  expect(
    Value.Check(PI_PROCESS_RECORD_SCHEMA, {
      type: "extension_ui_request",
      method: "setWidget",
      id: "widget-1",
      widgetKey: "agent-team",
      widgetLines: ["Equipe · nenhum subagente"],
    }),
  ).toBe(true)
}

function rejectsMalformedWidget(): void {
  expect(
    Value.Check(PI_PROCESS_RECORD_SCHEMA, {
      type: "extension_ui_request",
      method: "setWidget",
      id: "widget-1",
      widgetKey: "agent-team",
      widgetLines: [42],
    }),
  ).toBe(false)
}

function rejectsUnknownUiMethod(): void {
  expect(
    Value.Check(PI_PROCESS_RECORD_SCHEMA, {
      type: "extension_ui_request",
      method: "unknown",
      id: "widget-1",
      widgetKey: "agent-team",
      widgetLines: [],
    }),
  ).toBe(false)
}

function suite(): void {
  test("fronteira aceita evento setWidget do painel", acceptsWidgetLines)
  test("fronteira recusa linha de widget não textual", rejectsMalformedWidget)
  test("fronteira não aceita método UI arbitrário", rejectsUnknownUiMethod)
}

describe("evento RPC do painel da equipe", suite)
